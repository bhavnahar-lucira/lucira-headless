import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const menus = await db.collection("menus").find({}).toArray();

    return NextResponse.json({ success: true, menus });
  } catch (error) {
    console.error("Fetch Menus Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
