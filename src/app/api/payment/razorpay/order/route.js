import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

function toSubunits(amount) {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  return Math.round(numericAmount * 100);
}

function buildAddressPayload(address = null) {
  if (!address) return null;

  return {
    id: address.id || "",
    firstName: address.firstName || "",
    lastName: address.lastName || "",
    company: address.company || "",
    address1: address.address1 || "",
    address2: address.address2 || "",
    city: address.city || "",
    province: address.province || "",
    zip: address.zip || "",
    country: address.country || "",
    phone: address.phone || "",
    gstin: address.gstin || "",
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const userId = normalizeUserId(body?.userId);
    const sessionId = body?.sessionId || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "UserId or SessionId is required" },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cartCollection = db.collection("carts");
    const cart = await cartCollection.findOne(buildCartLookup({ userId, sessionId }));

    if (!cart?.items?.length) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
    const amountInSubunits = toSubunits(totalAmount);

    if (!amountInSubunits) {
      return NextResponse.json(
        { error: "Unable to calculate payable amount" },
        { status: 400 }
      );
    }

    const receipt = `lucira_${Date.now()}`;
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: "INR",
        receipt,
        notes: {
          userId: userId || "",
          sessionId: sessionId || "",
          shippingAddressId: body?.shippingAddress?.id || "",
          billingAddressId: body?.billingAddress?.id || "",
        },
      }),
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return NextResponse.json(
        { error: razorpayOrder?.error?.description || "Failed to create Razorpay order" },
        { status: razorpayResponse.status }
      );
    }

    return NextResponse.json({
      key: keyId,
      amount: amountInSubunits,
      currency: razorpayOrder.currency || "INR",
      orderId: razorpayOrder.id,
      receipt,
      customer: {
        name: body?.customer?.name || "",
        email: body?.customer?.email || "",
        contact: body?.customer?.phone || "",
      },
      shippingAddress: buildAddressPayload(body?.shippingAddress),
      billingAddress: buildAddressPayload(body?.billingAddress),
    });
  } catch (error) {
    console.error("RAZORPAY ORDER CREATE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
