import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const status = await db.collection("sync_history").findOne({ type: "cron_sync_all" });

    return NextResponse.json(status || { status: "never_run" });
  } catch (error) {
    console.error("Failed to fetch sync status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
