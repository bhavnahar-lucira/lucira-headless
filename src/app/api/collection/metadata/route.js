import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const collection = await db.collection("collections").findOne({ handle });

    if (!collection) {
      return NextResponse.json({ success: false, message: "Collection not found" });
    }

    // Resolve SEO Page GIDs if present
    const seoContentKey = collection.metafields?.["custom.seocontent"] ? "custom.seocontent" : (collection.metafields?.["custom.seo_content"] ? "custom.seo_content" : null);
    if (seoContentKey && typeof collection.metafields[seoContentKey] === "string" && collection.metafields[seoContentKey].startsWith("gid://shopify/Page/")) {
      const pageGid = collection.metafields[seoContentKey];
      const page = await db.collection("pages").findOne({ id: pageGid });
      if (page && page.body) {
        collection.metafields[seoContentKey] = page.body;
      }
    }

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Failed to fetch collection metadata:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
