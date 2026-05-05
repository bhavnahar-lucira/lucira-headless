

import { NextResponse } from "next/server";

export async function POST(req) {
  const refreshToken = req.cookies.get("agent_refresh")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const response = await fetch(
      "https://lucira.uat.ornaverse.in/connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: "api_access",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const { access_token, refresh_token, expires_in } = result;

    const res = NextResponse.json({ success: true });

    res.cookies.set("agent_session", access_token, {
      httpOnly: true,
      secure: true,
     sameSite: "lax", 
      path: "/",
      maxAge: expires_in,
    });

    res.cookies.set("agent_refresh", refresh_token, {
      httpOnly: true,
      secure: true,
     sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (err) {
    const res = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    res.cookies.set("agent_session", "", { maxAge: 0, path: "/" });
    res.cookies.set("agent_refresh", "", { maxAge: 0, path: "/" });
    return res;
  }
}