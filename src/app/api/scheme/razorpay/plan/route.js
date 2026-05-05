import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { amount, tenure } = await req.json();

  const plan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: `Vault Of Dreams ₹${amount}`,
      amount: amount * 100,
      currency: "INR",
    },
    notes: {
      tenure,
    },
  });

  return NextResponse.json(plan);
}
