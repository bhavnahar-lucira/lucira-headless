export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(req) {
  try {
    console.log("===== SSO START =====");

    const { searchParams } = new URL(req.url);

    const sig = searchParams.get("sig");
    const phone = searchParams.get("p");
    const ts = searchParams.get("ts");
    const amount = searchParams.get("amount");

    if (!sig || !phone || !ts) {
      console.log("Missing params → redirect login");
      let loginUrl = "https://schemes.lucirajewelry.com/login";
      if (amount) loginUrl += `?amount=${amount}`;
      return NextResponse.redirect(loginUrl);
    }

    const SECRET = process.env.SHOPIFY_SSO_SECRET;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!SECRET || !JWT_SECRET) {
      throw new Error("Missing env variables");
    }

    /* ================= VERIFY SIGNATURE ================= */

    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${phone}|${ts}`)
      .digest("hex");

    if (sig !== expectedSig) {
      console.log("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    /* ================= VERIFY TIMESTAMP ================= */

    const now = Math.floor(Date.now() / 1000);
    const timeDiff = now - Number(ts);

    if (timeDiff < 0 || timeDiff > 300) {
      console.log("Expired link");
      return NextResponse.json(
        { error: "Link expired" },
        { status: 401 }
      );
    }

    console.log("Signature & timestamp verified");

    /* ================= INTERNAL CUSTOMER CHECK ================= */

    // 🔥 IMPORTANT: Bypass nginx completely
    const checkRes = await fetch("http://127.0.0.1:3000/api/scheme/customer/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: phone }),
    });

    console.log("Customer API Status:", checkRes.status);

    if (!checkRes.ok) {
      throw new Error(`Customer API failed: ${checkRes.status}`);
    }

    const result = await checkRes.json();
    const customer = result?.Entities?.[0];

    if (!customer) {
      console.log("Customer not found → redirect verify");
      let verifyUrl = `https://schemes.lucirajewelry.com/verify?mobile=${phone}`;
      if (amount) verifyUrl += `&amount=${amount}`;
      return NextResponse.redirect(verifyUrl);
    }

    console.log("Customer found:", customer.party_id);

    /* ================= CREATE JWT ================= */

    const jwt = await new SignJWT({
      party_id: customer.party_id,
      mobile: customer.mobile,
      name: customer.party_name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(JWT_SECRET));

    console.log("JWT created");

    let redirectUrl = "https://schemes.lucirajewelry.com/";
    if (amount) redirectUrl += `?amount=${amount}`;

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("session", jwt, {
      httpOnly: true,
      secure: true, // production
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("Redirecting to homepage");
    console.log("===== SSO END =====");

    return response;

  } catch (error) {
    console.error("SSO ERROR:", error);
    return NextResponse.json(
      { error: "SSO failed", message: error.message },
      { status: 500 }
    );
  }
}