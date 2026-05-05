export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getORNToken } from "@/lib/scheme/ornTokenService";

export async function POST(req) {
  try {
    const body = await req.json();
    const token = await getORNToken();

    const res = await fetch(
      "https://lucira.uat.ornaverse.in/Services/POS/SchemeEnrollment/Create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    console.log("Ornaverse Generate Response Status:", res.status);
    console.log("Ornaverse Generate Response Text:", text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error("JSON Parse Error. Raw response:", text);
      return NextResponse.json(
        { error: "Invalid response from Ornaverse", details: text },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { ...data, _ornaverse_status: res.status, _ornaverse_url: res.url },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Enrollment create error:", err);
    return NextResponse.json(
      { error: "Enrollment failed" },
      { status: 500 }
    );
  }
}
