import { NextResponse } from "next/server";
import { getInstagramMedia } from "@/lib/instagram";

export async function GET() {
  const media = await getInstagramMedia();
  
  if (!media || media.length === 0) {
    // Return empty array or mock data as fallback
    return NextResponse.json([]);
  }

  return NextResponse.json(media);
}
