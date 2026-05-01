import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const session = await db.collection("cache_warm_sessions")
      .find({})
      .sort({ startedAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json(session[0] || { status: "idle" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function warmUrl(url) {
  try {
    await fetch(url, {
      headers: { "User-Agent": "CacheWarmer/1.0" },
      cache: 'no-store'
    });
    return true;
  } catch (err) {
    return false;
  }
}

export async function POST() {
  const client = await clientPromise;
  const db = client.db("next_local_db");

  // Check if a session is already running
  const activeSession = await db.collection("cache_warm_sessions").findOne({ status: "running" });
  if (activeSession) {
    return NextResponse.json({ error: "A cache warming session is already running" }, { status: 400 });
  }

  const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const startedAt = new Date();
  
  // 1. Collect all URLs
  const [products, collections, articles, pages] = await Promise.all([
    db.collection("products").find({ status: "ACTIVE", isPublished: true }, { projection: { handle: 1 } }).toArray(),
    db.collection("shopify_collections").find({}, { projection: { handle: 1 } }).toArray(),
    db.collection("articles").find({}, { projection: { handle: 1, blogHandle: 1 } }).toArray(),
    db.collection("pages").find({}, { projection: { handle: 1 } }).toArray(),
  ]);

  const allUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/login`,
    `${BASE_URL}/register`,
    `${BASE_URL}/reviews`,
    `${BASE_URL}/search`,
    `${BASE_URL}/collections/all`,
    ...collections.map(c => `${BASE_URL}/collections/${c.handle}`),
    ...products.map(p => `${BASE_URL}/products/${p.handle}`),
    ...articles.map(a => `${BASE_URL}/blogs/${a.blogHandle}/${a.handle}`),
    ...pages.map(p => `${BASE_URL}/pages/${p.handle}`),
  ];

  const uniqueUrls = [...new Set(allUrls)];
  
  // 2. Initialize session in DB
  const sessionId = Date.now().toString();
  await db.collection("cache_warm_sessions").insertOne({
    sessionId,
    status: "running",
    startedAt,
    totalUrls: uniqueUrls.length,
    processedUrls: 0,
    progress: 0,
    currentUrl: "Starting...",
  });

  // 3. Start background process (don't await)
  (async () => {
    const batchSize = 5;
    let processedCount = 0;

    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
      const batch = uniqueUrls.slice(i, i + batchSize);
      
      await Promise.all(batch.map(url => warmUrl(url)));
      
      processedCount += batch.length;
      const progress = Math.round((processedCount / uniqueUrls.length) * 100);

      await db.collection("cache_warm_sessions").updateOne(
        { sessionId },
        { 
          $set: { 
            processedUrls: processedCount, 
            progress,
            currentUrl: batch[batch.length - 1]
          } 
        }
      );

      // Respect API limits
      await new Promise(r => setTimeout(r, 500));
    }

    const endedAt = new Date();
    const duration = Math.round((endedAt - startedAt) / 1000);
    
    await db.collection("cache_warm_sessions").updateOne(
      { sessionId },
      { 
        $set: { 
          status: "completed", 
          endedAt, 
          duration: `${duration} seconds`,
          currentUrl: "Finished"
        } 
      }
    );
  })().catch(async (err) => {
    console.error("Background Warming Error:", err);
    await db.collection("cache_warm_sessions").updateOne(
      { sessionId },
      { $set: { status: "failed", error: err.message, endedAt: new Date() } }
    );
  });

  return NextResponse.json({ success: true, message: "Cache warming started in background", totalUrls: uniqueUrls.length });
}
