import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";
import { shopifyAdminFetch } from "@/lib/shopify";

function toSubunits(amount) {
  const numericAmount = Number(amount || 0);
  return Math.round(numericAmount * 100);
}

function normalizeVariantId(variantId = "") {
  const value = String(variantId || "").trim();
  if (!value) return "";
  return value.includes("gid://shopify/ProductVariant/")
    ? value
    : `gid://shopify/ProductVariant/${value}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const userId = normalizeUserId(body?.userId);
    const sessionId = body?.sessionId || null;

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "UserId or SessionId is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cart = await db.collection("carts").findOne(buildCartLookup({ userId, sessionId }));

    if (!cart?.items?.length) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const shippingAddress = body?.shippingAddress;
    const billingAddress = body?.billingAddress;
    const customer = body?.customer;
    const appliedCoupon = body?.appliedCoupon;

    // STEP 1: Create Shopify Draft Order
    const draftOrderInput = {
      lineItems: cart.items.map(item => {
        const price = Number(item.price || 0);
        const lineItem = {
          variantId: normalizeVariantId(item.variantId),
          quantity: Number(item.quantity || 1),
          originalUnitPrice: price,
          // Pass custom properties for the technical details
          customAttributes: [
            { key: "_Gold Weight", value: String(item.goldWeight || "") },
            { key: "_Diamond Charges", value: String(item.diamondCharges || "") },
            { key: "Variant Title", value: String(item.variantTitle || "") }
          ].filter(attr => attr.value !== "")
        };

        // If it's a free gift, apply a 100% discount to ensure Shopify respects the ₹0 price
        if (price === 0) {
          lineItem.appliedDiscount = {
            title: "Free Gift",
            value: 100,
            valueType: "PERCENTAGE"
          };
        }

        return lineItem;
      }),
      appliedDiscount: (appliedCoupon && typeof appliedCoupon === 'object') ? {
        title: appliedCoupon.code,
        value: Number(appliedCoupon.value || 0),
        valueType: appliedCoupon.valueType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED_AMOUNT"
      } : undefined,
      useCustomerDefaultAddress: false,
      taxExempt: true // Ensure Shopify doesn't add extra GST on top of tax-inclusive prices
    };

    // If we have a real discount code, Shopify Draft Orders usually require 
    // applying it AFTER creation or via 'appliedDiscount'.
    // Let's try applying it as a manual discount with the code name.

    if (customer?.email) {
      draftOrderInput.email = customer.email;
    }

    const shopifyDraftData = await shopifyAdminFetch(`
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            totalPrice
          }
          userErrors {
            field
            message
          }
        }
      }
    `, { input: draftOrderInput });

    const draftOrder = shopifyDraftData.draftOrderCreate.draftOrder;
    const userErrors = shopifyDraftData.draftOrderCreate.userErrors;

    if (userErrors?.length) {
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 });
    }

    // STEP 2: Create Razorpay Order using Draft Order Total
    const amountInSubunits = toSubunits(draftOrder.totalPrice);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: "INR",
        receipt: draftOrder.id,
      }),
    });

    const razorpayOrder = await razorpayResponse.json();

    return NextResponse.json({
      key: keyId,
      amount: amountInSubunits,
      currency: "INR",
      orderId: razorpayOrder.id,
      draftId: draftOrder.id,
      customer: body?.customer,
      shippingAddress: body?.shippingAddress,
      billingAddress: body?.billingAddress,
    });
  } catch (error) {
    console.error("DRAFT ORDER FLOW ERROR:", error);
    return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
  }
}
