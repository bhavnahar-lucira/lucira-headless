import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    // Explicitly using shopify-app as verified by debug script
    const db = client.db("shopify-app"); 
    const settingsCollection = db.collection("settings");

    const goldCoinSetting = await settingsCollection.findOne({ key: "gold_coin_offer" });

    return NextResponse.json({
      enabled: goldCoinSetting ? !!goldCoinSetting.enabled : false,
      threshold: goldCoinSetting?.threshold || 20000
    });
  } catch (error) {
    console.error("Error fetching gold coin setting from MongoDB:", error);
    return NextResponse.json({ enabled: false, threshold: 20000 });
  }
}
