export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export async function POST(req) {
  try {
    const { receipt_id } = await req.json();
    const token = await getORNToken();

    const res = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/Scheme/GetSchemePayment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receipt_id }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Receipt retrieve error:", err);
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}
