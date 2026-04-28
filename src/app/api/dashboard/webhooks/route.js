import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    
    const logs = await db.collection("webhook_events")
      .find({})
      .sort({ startedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to fetch webhook logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
