import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { plan_id, total_count, customer } = await req.json();

  const subscription = await razorpay.subscriptions.create({
    plan_id,
    total_count,
    customer_notify: 1,
    notes: {
      mobile: customer.mobile,
      name: customer.name,
    },
  });

  return NextResponse.json(subscription);
}
