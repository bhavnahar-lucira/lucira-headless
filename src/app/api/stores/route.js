import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const storesCollection = db.collection("stores");

    const stores = await storesCollection.find({}).toArray();

    return NextResponse.json({ stores });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
