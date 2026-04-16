import crypto from "crypto";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";
import { shopifyAdminFetch } from "@/lib/shopify";

function normalizeVariantId(variantId = "") {
  const value = String(variantId || "").trim();
  if (!value) return "";
  return value.includes("gid://shopify/ProductVariant/")
    ? value
    : `gid://shopify/ProductVariant/${value}`;
}

function asMoney(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function normalizePhone(value = "") {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return value.startsWith("+") ? value : `+${digits}`;
}

function formatCompanyWithGstin(company = "", gstin = "") {
  const trimmedCompany = String(company || "").trim();
  const trimmedGstin = String(gstin || "").trim().toUpperCase();

  if (trimmedCompany && trimmedGstin) {
    return `${trimmedCompany} | GSTIN: ${trimmedGstin}`;
  }

  if (trimmedGstin) {
    return `GSTIN: ${trimmedGstin}`;
  }

  return trimmedCompany;
}

function buildMailingAddress(address = null) {
  if (!address) return null;

  return {
    firstName: address.firstName || "",
    lastName: address.lastName || "",
    company: formatCompanyWithGstin(address.company, address.gstin),
    address1: address.address1 || "",
    address2: address.address2 || "",
    city: address.city || "",
    province: address.province || "",
    zip: address.zip || "",
    country: address.country || "",
    phone: normalizePhone(address.phone || ""),
  };
}

function buildLineItemProperties(item = {}) {
  const pairs = [
    ["EngravingText", item.engravingText || item.engraving || ""],
    ["EngravingFont", item.engravingFont || ""],
    ["GiftText", item.giftText || ""],
    ["_Shipping Date", item.shippingDate || ""],
    ["_Gold Price Per Gram", item.goldPricePerGram],
    ["_Gold Weight", item.goldWeight],
    ["_Gold Price", item.goldPrice],
    ["_Making Charges", item.makingCharges],
    ["_Diamond Charges", item.diamondCharges],
    ["_GST", item.gst],
    ["_Final Price", item.finalPrice || item.price],
    ["_Diamond Total Pcs", item.diamondTotalPcs],
    ["Color", item.color || ""],
    ["Karat", item.karat || ""],
    ["Size", item.size || ""],
    ["Variant Title", item.variantTitle || ""],
  ];

  return pairs
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([name, value]) => ({
      name,
      value: String(value),
    }));
}

function buildOrderCustomAttributes({
  shippingAddress,
  billingAddress,
  razorpayOrderId,
  razorpayPaymentId,
}) {
  const pairs = [
    ["payment_gateway", "Razorpay"],
    ["razorpay_order_id", razorpayOrderId],
    ["razorpay_payment_id", razorpayPaymentId],
    ["shipping_address_id", shippingAddress?.id || ""],
    ["billing_address_id", billingAddress?.id || ""],
    ["shipping_gstin", shippingAddress?.gstin || ""],
    ["billing_gstin", billingAddress?.gstin || ""],
    [
      "shipping_method",
      (shippingAddress?.country || "").trim().toLowerCase() === "india"
        ? "Shipping Rate - FREE"
        : "Shipping - Calculated outside Shopify checkout",
    ],
  ];

  return pairs
    .filter(([, value]) => String(value || "").trim() !== "")
    .map(([key, value]) => ({ key, value: String(value) }));
}

function buildOrderNote({ razorpayOrderId, razorpayPaymentId, shippingAddress, billingAddress }) {
  return [
    "Order created via custom Razorpay checkout.",
    `Razorpay Order ID: ${razorpayOrderId}`,
    `Razorpay Payment ID: ${razorpayPaymentId}`,
    shippingAddress?.gstin ? `Shipping GSTIN: ${shippingAddress.gstin}` : "",
    billingAddress?.gstin ? `Billing GSTIN: ${billingAddress.gstin}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildShippingLines(address = null) {
  const isIndia = (address?.country || "").trim().toLowerCase() === "india";
  if (!isIndia) return [];

  return [
    {
      title: "Shipping Rate - FREE",
      code: "FREE",
      source: "Lucira",
      priceSet: {
        shopMoney: {
          amount: 0,
          currencyCode: "INR",
        },
      },
    },
  ];
}

function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature, secret }) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const userId = normalizeUserId(body?.userId);
    const sessionId = body?.sessionId || null;
    const razorpayOrderId = String(body?.razorpayOrderId || "").trim();
    const razorpayPaymentId = String(body?.razorpayPaymentId || "").trim();
    const razorpaySignature = String(body?.razorpaySignature || "").trim();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "UserId or SessionId is required" },
        { status: 400 }
      );
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Razorpay payment details are incomplete" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    if (
      !verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        secret,
      })
    ) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cartCollection = db.collection("carts");
    const paymentCollection = db.collection("shopify_order_payments");

    const existingPayment = await paymentCollection.findOne({ razorpayPaymentId });
    if (existingPayment?.shopifyOrderId) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        shopifyOrderId: existingPayment.shopifyOrderId,
        shopifyOrderName: existingPayment.shopifyOrderName,
      });
    }

    const cart = await cartCollection.findOne(buildCartLookup({ userId, sessionId }));
    if (!cart?.items?.length) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const shippingAddress = body?.shippingAddress || null;
    const billingAddress = body?.billingAddress || null;
    const customer = body?.customer || {};

    const orderInput = {
      currency: "INR",
      email: customer.email || undefined,
      phone: normalizePhone(customer.phone || shippingAddress?.phone || ""),
      note: buildOrderNote({
        razorpayOrderId,
        razorpayPaymentId,
        shippingAddress,
        billingAddress,
      }),
      customAttributes: buildOrderCustomAttributes({
        shippingAddress,
        billingAddress,
        razorpayOrderId,
        razorpayPaymentId,
      }),
      financialStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      shippingAddress: buildMailingAddress(shippingAddress),
      billingAddress: buildMailingAddress(billingAddress),
      shippingLines: buildShippingLines(shippingAddress),
      lineItems: cart.items.map((item) => ({
        variantId: normalizeVariantId(item.variantId),
        quantity: Number(item.quantity || 1),
        priceSet: {
          shopMoney: {
            amount: Number(asMoney(item.price || item.finalPrice || 0)),
            currencyCode: "INR",
          },
        },
        properties: buildLineItemProperties(item),
      })),
      transactions: [
        {
          kind: "SALE",
          status: "SUCCESS",
          gateway: "Razorpay",
          amountSet: {
            shopMoney: {
              amount: Number(asMoney(totalAmount)),
              currencyCode: "INR",
            },
          },
          receiptJson: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
          }),
        },
      ],
    };

    if (customer?.id) {
      orderInput.customer = {
        toAssociate: {
          id: customer.id,
        },
      };
    }

    const data = await shopifyAdminFetch(
      `
        mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
          orderCreate(order: $order, options: $options) {
            userErrors {
              field
              message
            }
            order {
              id
              name
              displayFinancialStatus
              displayFulfillmentStatus
              shippingAddress {
                company
              }
              billingAddress {
                company
              }
              lineItems(first: 50) {
                nodes {
                  title
                  quantity
                  customAttributes {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      `,
      {
        order: orderInput,
        options: {
          inventoryBehaviour: "DECREMENT_IGNORING_POLICY",
          sendReceipt: false,
          sendFulfillmentReceipt: false,
        },
      }
    );

    const payload = data.orderCreate;
    const errors = payload?.userErrors || [];

    if (errors.length) {
      return NextResponse.json(
        { error: errors[0]?.message || "Failed to create Shopify order" },
        { status: 400 }
      );
    }

    const order = payload?.order;

    await paymentCollection.updateOne(
      { razorpayPaymentId },
      {
        $set: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          userId: userId || null,
          sessionId: sessionId || null,
          shopifyOrderId: order?.id || "",
          shopifyOrderName: order?.name || "",
          totalAmount: Number(asMoney(totalAmount)),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    await cartCollection.updateOne(
      { _id: cart._id },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      shopifyOrderId: order?.id || "",
      shopifyOrderName: order?.name || "",
      financialStatus: order?.displayFinancialStatus || "",
      fulfillmentStatus: order?.displayFulfillmentStatus || "",
    });
  } catch (error) {
    console.error("RAZORPAY COMPLETE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete payment" },
      { status: 500 }
    );
  }
}
