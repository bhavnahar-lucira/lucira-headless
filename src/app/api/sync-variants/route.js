import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { startVariantsBackgroundSync } from "./syncLogic";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const session = await db.collection("sync_sessions")
      .find({ type: "variants" })
      .sort({ startedAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json({ 
      session: session[0] || { status: "idle" }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  let skip = 0;
  let isRetry = false;
  try {
    const body = await req.json().catch(() => ({}));
    isRetry = body.isRetry || false;
    skip = body.skip || 0;
  } catch (e) {}

  const { searchParams } = new URL(req.url);
  const shopifyId = searchParams.get("shopifyId");

  if (isRetry) {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const lastSession = await db.collection("sync_sessions").findOne({ type: "variants" }, { sort: { startedAt: -1 } });
    if (lastSession && lastSession.skip !== undefined) {
      skip = lastSession.skip;
    }
  }

  const result = await startVariantsBackgroundSync(skip, shopifyId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result);
}
