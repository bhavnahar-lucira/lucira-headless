import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const query = `
      query {
        collections(first: 250) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              image { url altText }
              faqQuestion: metafield(namespace: "custom", key: "FaqQuestion") { value }
              faqAnswers: metafield(namespace: "custom", key: "FaqAnswers") { value }
              seoContent: metafield(namespace: "custom", key: "seocontent") { value }
            }
          }
        }
      }
    `;

    console.log("Fetching collections from Shopify Admin API...");
    const data = await shopifyAdminFetch(query);
    
    if (!data || !data.collections) {
      throw new Error("Failed to fetch collections from Shopify");
    }

    const shopifyCollections = data.collections.edges.map(e => e.node);
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('shopify_collections');

    const ops = shopifyCollections.map(col => ({
      updateOne: {
        filter: { handle: col.handle },
        update: {
          $set: {
            shopifyId: col.id,
            title: col.title,
            handle: col.handle,
            description: col.description,
            descriptionHtml: col.descriptionHtml,
            image: col.image,
            faqQuestion: col.faqQuestion?.value || null,
            faqAnswers: col.faqAnswers?.value || null,
            seoContent: col.seoContent?.value || null,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    let result = { upsertedCount: 0, modifiedCount: 0 };
    if (ops.length > 0) {
      result = await collection.bulkWrite(ops);
    }

    return NextResponse.json({
      success: true,
      count: shopifyCollections.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount
    });

  } catch (error) {
    console.error("Collection Sync Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
