import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");

    // Ping the database to check if it's connected
    const ping = await db.command({ ping: 1 });

    return NextResponse.json({ 
      status: "Connected successfully!", 
      database: "next_local_db",
      ping 
    });
  } catch (e) {
    console.error("Database connection failed:", e);
    return NextResponse.json(
      { error: "Database connection failed", message: e.message }, 
      { status: 500 }
    );
  }
}
