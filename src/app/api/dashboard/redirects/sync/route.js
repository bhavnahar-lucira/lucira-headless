import { NextResponse } from "next/server";
import { shopifyAdminRestFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    let allRedirects = [];
    let params = { limit: 250 };
    let hasNext = true;

    while (hasNext) {
      const response = await shopifyAdminRestFetch("redirects.json", params);
      const redirects = response.data.redirects;
      allRedirects.push(...redirects);

      // Simple pagination check for REST
      const linkHeader = response.linkHeader;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextUrl = linkHeader.split(",").find(s => s.includes('rel="next"')).match(/<(.*)>/)[1];
        const url = new URL(nextUrl);
        params = Object.fromEntries(url.searchParams.entries());
      } else {
        hasNext = false;
      }
    }

    if (allRedirects.length > 0) {
      // We want to replace the local collection with the one from Shopify to keep them in sync
      // or we can do upserts. Upserts are safer.
      const ops = allRedirects.map((r) => ({
        updateOne: {
          filter: { path: r.path },
          update: { 
            $set: {
              shopifyId: r.id,
              path: r.path,
              target: r.target,
              updatedAt: new Date(),
            }
          },
          upsert: true,
        },
      }));

      await collection.bulkWrite(ops);
    }

    return NextResponse.json({
      success: true,
      count: allRedirects.length,
    });
  } catch (error) {
    console.error("Redirect sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
