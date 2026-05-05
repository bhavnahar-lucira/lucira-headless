import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://schemes-to-webengage-385594025448.asia-south1.run.app/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    return NextResponse.json({
      status: response.status,
      response: text,
    });

  } catch (error) {
    console.error("Webhook proxy error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
