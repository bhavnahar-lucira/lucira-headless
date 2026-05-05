import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json();

  // 🔐 ONLY store minimal, safe data in session
  const sessionPayload = {
    party_id: body.party_id,
    mobile: body.mobile,
    name: body.name,
    enrollment_draft: body.enrollment_draft || null,
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return res;
}
