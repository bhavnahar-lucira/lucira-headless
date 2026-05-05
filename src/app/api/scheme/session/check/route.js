import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ auth: false });

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return NextResponse.json({
      auth: true,
      user: payload, // 👈 REQUIRED
    });
  } catch {
    return NextResponse.json({ auth: false });
  }
}
