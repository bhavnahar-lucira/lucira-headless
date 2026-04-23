import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pincodes");

    // Create index on pincode for faster upserts and unique constraint
    await collection.createIndex({ pincode: 1 }, { unique: true });

    // Read the file content as text
    const bytes = await file.arrayBuffer();
    const content = Buffer.from(bytes).toString('utf-8');
    
    // Split into lines and filter out empty lines
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");

    if (lines.length <= 1) {
      return NextResponse.json(
        { success: false, error: "CSV file is empty or only contains headers" },
        { status: 400 }
      );
    }

    let batch = [];
    let totalProcessed = 0;

    // Skip header line (i=1)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV split
      const values = line.split(',');
      if (values.length < 3) continue;

      const pincode = values[0].trim();
      if (!pincode) continue;

      const pincodeData = {
        pincode: pincode,
        cod: values[1] ? values[1].trim().toLowerCase() === 'true' : false,
        upi: values[2] ? values[2].trim().toLowerCase() === 'true' : false,
        latitude: values[3] && values[3].trim() ? parseFloat(values[3]) : null,
        longitude: values[4] && values[4].trim() ? parseFloat(values[4]) : null,
        updatedAt: new Date()
      };

      batch.push({
        updateOne: {
          filter: { pincode: pincodeData.pincode },
          update: { $set: pincodeData },
          upsert: true
        }
      });

      // Execute in chunks of 1000
      if (batch.length >= 1000) {
        await collection.bulkWrite(batch);
        totalProcessed += batch.length;
        batch = [];
      }
    }

    // Final batch
    if (batch.length > 0) {
      await collection.bulkWrite(batch);
      totalProcessed += batch.length;
    }

    return NextResponse.json({
      success: true,
      totalProcessed: totalProcessed
    });
  } catch (error) {
    console.error("Pincode sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
