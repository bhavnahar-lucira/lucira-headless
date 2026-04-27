import { NextResponse } from "next/server";
import { refreshLongLivedToken, getAccessToken } from "@/lib/instagram";

/**
 * Endpoint to refresh the long-lived token.
 * This should be called once every few weeks (long-lived tokens last 60 days).
 */
export async function GET() {
  const currentToken = await getAccessToken();

  if (!currentToken) {
    return NextResponse.json({ error: "No current token found in DB or Env" }, { status: 400 });
  }

  try {
    const data = await refreshLongLivedToken(currentToken);
    
    return NextResponse.json({
      message: "Token refreshed and saved to Database successfully",
      expires_in: data.expires_in,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
