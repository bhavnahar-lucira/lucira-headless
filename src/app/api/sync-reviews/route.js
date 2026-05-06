import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { fetchNectorReviews } from "@/lib/nector";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let skip = 0;
  try {
    const body = await req.json().catch(() => ({}));
    skip = body.skip || 0;
  } catch (e) {}

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch (e) {}
      };

      try {
        const client = await clientPromise;
        const db = client.db("next_local_db");
        const productsCollection = db.collection("products");
        const reviewsCollection = db.collection("reviews");

        sendUpdate({ status: "starting", message: "Fetching local products...", progress: 0 });

        const products = await productsCollection.find({ status: "ACTIVE" }).project({ shopifyId: 1, handle: 1, title: 1, image: 1 }).toArray();
        const total = products.length;

        if (total === 0) {
          sendUpdate({ status: "complete", message: "No ACTIVE products found to sync reviews.", progress: 100 });
          controller.close();
          return;
        }

        sendUpdate({ 
          status: "starting", 
          message: skip > 0 ? `Resuming review sync from ${skip}/${total}...` : "Starting review sync...", 
          progress: skip > 0 ? Math.round((skip / total) * 100) : 0 
        });

        for (let i = skip; i < products.length; i++) {
          const product = products[i];
          try {
            const reviewsData = await fetchNectorReviews(product.shopifyId, { noFallback: true });
            
            // 1. Update Detailed Reviews Collection
            if (reviewsData.list && reviewsData.list.length > 0) {
              const productIdSimple = product.shopifyId.split("/").pop();
              const reviewOps = reviewsData.list.map(review => ({
                updateOne: {
                  filter: { id: review.id },
                  update: { 
                    $set: {
                      ...review,
                      productId: productIdSimple,
                      productHandle: product.handle || "",
                      productTitle: product.title || "",
                      productImage: product.image || ""
                    } 
                  },
                  upsert: true
                }
              }));
              await reviewsCollection.bulkWrite(reviewOps);
            }

            // 2. Update Product Summary
            await productsCollection.updateOne(
              { _id: product._id },
              { 
                $set: { 
                  reviewStats: {
                    count: reviewsData.count || 0,
                    average: reviewsData.average || 0,
                    stats: reviewsData.stats || [],
                    usedFallback: reviewsData.usedFallback || false
                  },
                  lastReviewsUpdated: new Date()
                } 
              }
            );

            const processed = i + 1;
            if (processed % 5 === 0 || processed === total) {
              sendUpdate({ 
                status: "progress", 
                message: `Synced reviews for ${processed}/${total} products...`, 
                progress: Math.round((processed / total) * 100),
                skip: i
              });
            }

            // Small delay to avoid hitting Nector too hard
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (err) {
            console.error(`Failed to sync reviews for ${product.handle}:`, err.message);
          }
        }

        sendUpdate({ status: "complete", message: `Successfully synced reviews for ${total} products!`, progress: 100 });
        controller.close();

      } catch (error) {
        console.error("Critical Review Sync Error:", error);
        sendUpdate({ status: "error", message: `Sync Failed: ${error.message}` });
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
}
