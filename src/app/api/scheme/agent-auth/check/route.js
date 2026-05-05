import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.cookies.get("agent_session")?.value;

  if (!token) {
    return NextResponse.json({ auth: false });
  }

  return NextResponse.json({ auth: true });
}