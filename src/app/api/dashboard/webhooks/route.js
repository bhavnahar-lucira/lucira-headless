import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    
    // Get start of today in local time
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [logs, stats] = await Promise.all([
      db.collection("webhook_events")
        .find({})
        .sort({ startedAt: -1 })
        .limit(100)
        .toArray(),
      
      db.collection("webhook_events").aggregate([
        { $match: { startedAt: { $gte: startOfToday } } },
        {
          $group: {
            _id: null,
            created: { $sum: { $cond: [{ $eq: ["$topic", "products/create"] }, 1, 0] } },
            updated: { $sum: { $cond: [{ $eq: ["$topic", "products/update"] }, 1, 0] } },
            deleted: { $sum: { $cond: [{ $eq: ["$topic", "products/delete"] }, 1, 0] } }
          }
        }
      ]).toArray()
    ]);

    return NextResponse.json({ 
      logs, 
      stats: stats[0] || { created: 0, updated: 0, deleted: 0 } 
    });
  } catch (error) {
    console.error("Failed to fetch webhook logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
