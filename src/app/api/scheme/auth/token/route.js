import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export const runtime = "nodejs";
export async function GET() {
  await getORNToken();
  return NextResponse.json({ success: true });
}