export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const party_id = searchParams.get("party_id");
    const token = await getORNToken();

    const res = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/Scheme/GetSchemeEnrollment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ party_id }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Enrollments fetch error:", err);
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}
