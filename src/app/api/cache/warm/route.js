import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CacheWarmer/1.0",
      },
      cache: 'no-store' // Ensure we actually hit the server to trigger revalidation
    });
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      status: response.status,
      duration,
      message: `Successfully warmed: ${url}`
    });
  } catch (error) {
    console.error("Cache warming error:", error);
    return NextResponse.json({ error: "Failed to warm cache", details: error.message }, { status: 500 });
  }
}
