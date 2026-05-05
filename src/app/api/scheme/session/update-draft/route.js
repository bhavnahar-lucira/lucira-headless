import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No session found" });
  }

  const { enrollment_draft } = await req.json();

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  // 🔐 Verify existing session
  const { payload } = await jwtVerify(token, secret);

  // 🔁 Re-sign token with updated draft only
  const newPayload = {
    ...payload,
    enrollment_draft,
  };

  const newToken = await new SignJWT(newPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return res;
}
