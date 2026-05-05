export const runtime = "nodejs";


import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export async function POST(req) {
  try {
    const body = await req.json();
    const token = await getORNToken();

    const response = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/SchemeReceipt/Create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data || "Scheme receipt creation failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("SchemeReceipt Error:", error);

    return NextResponse.json(
      {
        error: "Scheme receipt creation failed",
      },
      { status: 500 }
    );
  }
}
