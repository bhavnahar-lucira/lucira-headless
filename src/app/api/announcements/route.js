import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const announcementsCollection = db.collection("announcements");

    const announcements = await announcementsCollection.find({ type: { $ne: "settings" } }).toArray();
    const settings = await announcementsCollection.findOne({ type: "settings" });

    return NextResponse.json({ 
      announcements, 
      isVisible: settings ? settings.isVisible : true 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { announcements, isVisible } = await request.json();
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const announcementsCollection = db.collection("announcements");

    // Clear existing offers but keep settings or handle both
    await announcementsCollection.deleteMany({ type: { $ne: "settings" } });
    
    if (announcements && announcements.length > 0) {
      const toInsert = announcements.filter(a => a.text.trim()).map(a => ({
        text: a.text,
        url: a.url
      }));
      if (toInsert.length > 0) {
        await announcementsCollection.insertMany(toInsert);
      }
    }

    // Update settings
    await announcementsCollection.updateOne(
      { type: "settings" },
      { $set: { isVisible: isVisible ?? true } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
