import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ redirect: false });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    // Check for exact match
    const redirect = await collection.findOne({ path });

    if (redirect) {
      return NextResponse.json({
        redirect: true,
        target: redirect.target
      });
    }

    // Optional: check for trailing slash variations if needed
    const altPath = path.endsWith("/") ? path.slice(0, -1) : path + "/";
    const altRedirect = await collection.findOne({ path: altPath });

    if (altRedirect) {
      return NextResponse.json({
        redirect: true,
        target: altRedirect.target
      });
    }

    return NextResponse.json({ redirect: false });
  } catch (error) {
    console.error("Redirect check error:", error);
    return NextResponse.json({ redirect: false }, { status: 500 });
  }
}
