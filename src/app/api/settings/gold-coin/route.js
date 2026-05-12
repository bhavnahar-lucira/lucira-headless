import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const settingsCollection = db.collection("settings");

    const goldCoinSetting = await settingsCollection.findOne({ key: "gold_coin_offer" });

    return NextResponse.json({ 
      enabled: goldCoinSetting ? goldCoinSetting.enabled : false 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { enabled } = await request.json();
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const settingsCollection = db.collection("settings");

    await settingsCollection.updateOne(
      { key: "gold_coin_offer" },
      { $set: { enabled: !!enabled, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
