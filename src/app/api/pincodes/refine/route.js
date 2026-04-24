import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { refinePincodeData } from "@/utils/coordinateMapping";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pincodesCollection = db.collection("pincodes");

    const updatedCount = await refinePincodeData(pincodesCollection);

    return NextResponse.json({
      success: true,
      message: `Refined coordinates for ${updatedCount} specific pincodes based on built-in mapping.`,
      updated: updatedCount
    });
  } catch (error) {
    console.error("Pincode refinement error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
