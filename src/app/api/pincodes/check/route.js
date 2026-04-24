import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pincodes");

    const record = await collection.findOne({ pincode: pincode.trim() });

    if (!record) {
      return NextResponse.json({ 
        success: true, 
        deliverable: false,
        message: "Sorry, we do not deliver to this pincode yet." 
      });
    }

    return NextResponse.json({
      success: true,
      deliverable: true,
      data: record
    });
  } catch (error) {
    console.error("Check pincode error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
