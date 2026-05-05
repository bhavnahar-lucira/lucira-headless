export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export async function POST(req) {
  try {
    const { mobile } = await req.json();
    const token = await getORNToken();

    const res = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/Customer/GetCustomer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Customer fetch error:", err);
    return NextResponse.json(
      { error: "Customer fetch failed" },
      { status: 500 }
    );
  }
}
