export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { mobile } = await req.json();

    const res = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/Authentication/SendOTP",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: "OTP send failed" },
      { status: 500 }
    );
  }
}
