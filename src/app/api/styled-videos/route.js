import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const videos = await db.collection("styled_videos").find({}).sort({ order: 1 }).toArray();
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error("Fetch Styled Videos Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    if (Array.isArray(data)) {
      // Bulk update/replace to handle ordering and full list sync
      await db.collection("styled_videos").deleteMany({});
      if (data.length > 0) {
        const formattedData = data.map((v, i) => {
          const { _id, ...rest } = v;
          return { ...rest, order: i };
        });
        await db.collection("styled_videos").insertMany(formattedData);
      }
    } else {
      // Single item save/update
      const { _id, ...updateData } = data;
      if (_id) {
        await db.collection("styled_videos").updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData },
          { upsert: true }
        );
      } else {
        await db.collection("styled_videos").insertOne({
          ...updateData,
          order: await db.collection("styled_videos").countDocuments()
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Styled Videos Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("ID is required");

    const client = await clientPromise;
    const db = client.db();
    await db.collection("styled_videos").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Styled Video Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
