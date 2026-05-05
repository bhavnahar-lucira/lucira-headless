import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  } = await req.json();

  const body =
    razorpay_payment_id + "|" + razorpay_subscription_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // ❌ Signature mismatch
  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 }
    );
  }

  // ✅ Signature verified
  const res = NextResponse.json({
    success: true,
    payment_id: razorpay_payment_id,
    subscription_id: razorpay_subscription_id,
  });

  // 🔐 SSR-safe checkout lock
  res.cookies.set("payment_status", "completed", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return res;
}
