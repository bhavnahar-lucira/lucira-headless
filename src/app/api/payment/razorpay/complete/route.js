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
    .map(([key, value]) => ({
      key,
      value: String(value),
    }));
}

function buildOrderCustomAttributes({
  shippingAddress,
  billingAddress,
  razorpayOrderId,
  razorpayPaymentId,
  nectorPoints,
}) {
  const pairs = [
    ["payment_gateway", "Razorpay"],
    ["razorpay_order_id", razorpayOrderId],
    ["razorpay_payment_id", razorpayPaymentId],
    ["shipping_address_id", shippingAddress?.id || ""],
    ["billing_address_id", billingAddress?.id || ""],
    ["shipping_gstin", shippingAddress?.gstin || ""],
    ["billing_gstin", billingAddress?.gstin || ""],
    ["NECTOR_USED_AMOUNT", nectorPoints?.coin_value ? String(nectorPoints.coin_value) : ""],
    ["nector_points_used", nectorPoints?.coin_value ? String(nectorPoints.coin_value) : ""],
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

function buildOrderNote({ shippingAddress, billingAddress }) {
  return [
    "Order created via custom Razorpay checkout.",
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

async function callNectorPerform({ userId, orderId, amount }) {
  try {
    const webhookKey = process.env.NECTOR_WEBHOOK_KEY || "1b00001c-26f4-4b62-a601-4f874e63f108";
    const numericId = String(userId || "").match(/\d+/)?.[0] || userId;
    const customerId = `shopify-${numericId}`;
    
    // Extract numeric order ID from GID (e.g., gid://shopify/Order/6565486231770 -> 6565486231770)
    const numericOrderId = String(orderId || "").match(/\d+/)?.[0] || orderId;

    console.log("Calling Nector Perform Server-Side:", { customerId, orderId: numericOrderId, amount });

    const response = await fetch(`https://platform.nector.io/api/open/integrations/customcheckoutwebhook/${webhookKey}`, {
      method: "POST",
      headers: {
        "x-source": "web",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        action: "perform",
        amount: Number(amount),
        reference_order_id: numericOrderId,
        wallet_type: "coins"
      }),
    });

    const data = await response.json();
    console.log("Nector Perform Response:", data);
    return data;
  } catch (error) {
    console.error("Nector Perform Server-Side Error:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const userId = normalizeUserId(body?.userId);
    const sessionId = body?.sessionId || null;
    const razorpayOrderId = String(body?.razorpayOrderId || "").trim();
    const razorpayPaymentId = String(body?.razorpayPaymentId || "").trim();
    const razorpaySignature = String(body?.razorpaySignature || "").trim();
    const draftId = body?.draftId;
    const nectorPoints = body?.nectorPoints;

    console.log("COMPLETE ORDER REQUEST:", { userId, sessionId, razorpayOrderId, razorpayPaymentId, draftId });

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "UserId or SessionId is required" }, { status: 400 });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !draftId) {
      return NextResponse.json({ error: "Payment details are incomplete" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature, secret })) {
      console.error("Razorpay signature verification failed");
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cartCollection = db.collection("carts");
    const paymentCollection = db.collection("shopify_order_payments");
    const ordersCollection = db.collection("orders");

    const cartLookup = buildCartLookup({ userId, sessionId });
    const cart = await cartCollection.findOne(cartLookup);

    // STEP 1: Update Draft Order with final details (Address, Properties, etc.)
    // We omit lineItems here to preserve the complex properties and discounts 
    // set during the initial draftOrderCreate step.
    const tags = ["Razorpay"];
    if (nectorPoints?.coin_value) {
      tags.push("nector_redeem");
    }

    await shopifyAdminFetch(`
      mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
        draftOrderUpdate(id: $id, input: $input) {
          draftOrder { id }
          userErrors { field message }
        }
      }
    `, {
      id: draftId,
      input: {
        shippingAddress: buildMailingAddress(body?.shippingAddress),
        billingAddress: buildMailingAddress(body?.billingAddress || body?.shippingAddress),
        note: buildOrderNote({
          shippingAddress: body?.shippingAddress,
          billingAddress: body?.billingAddress
        }),
        tags: tags,
        customAttributes: buildOrderCustomAttributes({
          shippingAddress: body?.shippingAddress,
          billingAddress: body?.billingAddress,
          razorpayOrderId,
          razorpayPaymentId,
          nectorPoints,
        })
      }
    });

    // STEP 2: Complete Shopify Draft Order
    console.log("Completing draft order:", draftId);
    const shopifyData = await shopifyAdminFetch(`
      mutation draftOrderComplete($id: ID!) {
        draftOrderComplete(id: $id) {
          draftOrder {
            id
            order {
              id
              name
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, { id: draftId });

    const payload = shopifyData.draftOrderComplete;
    
    if (payload?.userErrors?.some(e => e.message.toLowerCase().includes("already completed") || e.message.toLowerCase().includes("not open"))) {
      console.log("Draft order already completed or not open:", draftId);
      return NextResponse.json({
        success: true,
        message: "Order already completed"
      });
    }

    if (payload?.userErrors?.length) {
      console.error("DraftOrderComplete UserErrors:", payload.userErrors);
      return NextResponse.json({ error: payload.userErrors[0].message }, { status: 400 });
    }

    const order = payload.draftOrder.order;
    console.log("Order completed successfully:", order.name);

    // STEP 3: Nector Point Redemption (Server-Side)
    if (nectorPoints?.coin_value) {
      // Calculate amount before Nector discount (sum of items)
      // This must match the amount passed during the Nector 'list' call.
      const cartTotalAmount = cart?.items?.reduce((acc, item) => 
        acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0;

      await callNectorPerform({
        userId,
        orderId: order.id,
        amount: Math.max(cartTotalAmount, 1)
      });
    }

    // STEP 4: Save to Local MongoDB
    const orderRecord = {
      shopifyOrderId: order.id,
      shopifyOrderName: order.name,
      razorpayOrderId,
      razorpayPaymentId,
      userId: userId || null,
      sessionId: sessionId || null,
      totalAmount: Number(order.totalPriceSet.shopMoney.amount),
      customer: body?.customer,
      shippingAddress: body?.shippingAddress,
      billingAddress: body?.billingAddress,
      status: "PAID",
      createdAt: new Date(),
    };

    await ordersCollection.insertOne(orderRecord);
    await paymentCollection.insertOne({
      ...orderRecord,
      razorpaySignature,
      updatedAt: new Date()
    });

    // STEP 4: Clear Cart
    console.log("Clearing cart for user:", userId || sessionId);
    await cartCollection.updateOne(cartLookup, { $set: { items: [], updatedAt: new Date() } });

    return NextResponse.json({
      success: true,
      shopifyOrderId: order.id,
      shopifyOrderName: order.name,
    });
  } catch (error) {
    console.error("COMPLETE ORDER ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to complete order",
      details: error.message
    }, { status: 500 });
  }
}
