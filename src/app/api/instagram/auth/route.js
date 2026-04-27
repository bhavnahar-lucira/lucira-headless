import { NextResponse } from "next/server";
import { exchangeForLongLivedToken } from "@/lib/instagram";

/**
 * Helper endpoint to exchange a short-lived token for a long-lived token.
 * POST /api/instagram/auth { short_lived_token: '...' }
 */
export async function POST(request) {
  try {
    const { short_lived_token } = await request.json();

    if (!short_lived_token) {
      return NextResponse.json({ error: "short_lived_token is required" }, { status: 400 });
    }

    const data = await exchangeForLongLivedToken(short_lived_token);
    
    // In a production app, you might want to save this to your database
    // For now, we return it so the user can add it to their .env file
    return NextResponse.json({
      message: "Exchange successful",
      long_lived_token: data.access_token,
      expires_in: data.expires_in,
      info: "Please add this long_lived_token to your .env.local as INSTAGRAM_ACCESS_TOKEN"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
