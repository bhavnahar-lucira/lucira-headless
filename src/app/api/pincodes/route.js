import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const query = searchParams.get("q") || "";

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("pincodes");

    const filter = {};
    if (query) {
      filter.pincode = { $regex: query, $options: "i" };
    }

    const total = await collection.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const pincodes = await collection
      .find(filter)
      .sort({ pincode: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      pincodes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Fetch pincodes error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { pincode, latitude, longitude, cod, upi } = body;

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: "Pincode is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("pincodes");

    const updateData = {
      updatedAt: new Date(),
    };

    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (cod !== undefined) updateData.cod = !!cod;
    if (upi !== undefined) updateData.upi = !!upi;

    const result = await collection.updateOne(
      { pincode: pincode },
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Pincode updated successfully",
      result,
    });
  } catch (error) {
    console.error("Update pincode error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
