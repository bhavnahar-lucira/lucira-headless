import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const looks = await db.collection("curated_looks").find({}).sort({ order: 1 }).toArray();
    return NextResponse.json({ success: true, looks });
  } catch (error) {
    console.error("Fetch Curated Looks Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("next_local_db");
    
    if (Array.isArray(data)) {
      // Bulk update/replace
      await db.collection("curated_looks").deleteMany({});
      if (data.length > 0) {
        const formattedData = data.map((v, i) => {
          const { _id, ...rest } = v;
          return { ...rest, order: i };
        });
        await db.collection("curated_looks").insertMany(formattedData);
      }
    } else {
      // Single item save/update
      const { _id, ...updateData } = data;
      if (_id) {
        await db.collection("curated_looks").updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData },
          { upsert: true }
        );
      } else {
        await db.collection("curated_looks").insertOne({
          ...updateData,
          order: await db.collection("curated_looks").countDocuments()
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Curated Looks Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
