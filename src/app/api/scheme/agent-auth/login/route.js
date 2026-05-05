

import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const response = await fetch(
      "https://lucira.uat.ornaverse.in/connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
          grant_type: "password",
          client_id: "api_access",
          scope: "openid offline_access",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    const { access_token, refresh_token, expires_in } = result;

    const res = NextResponse.json({ success: true });

    // 🔐 Access token
    res.cookies.set("agent_session", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      path: "/",
      maxAge: expires_in,
    });

    // 🔐 Refresh token (longer life)
    res.cookies.set("agent_refresh", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;

  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }
}