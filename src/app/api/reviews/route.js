import clientPromise from "@/lib/mongodb";
import { fetchNectorReviews } from "@/lib/nector";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await fetchNectorReviews(productId);

    // Update the database with the latest reviews
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");
    const reviewsCollection = db.collection("reviews");

    const id = productId.includes("gid://") ? productId : `gid://shopify/Product/${productId}`;

    // 1. Update product summary (count and average rating)
    const product = await productsCollection.findOne({ 
      shopifyId: id
    });
    
    if (product) {
      await productsCollection.updateOne(
        { shopifyId: id },
        { 
          $set: { 
            reviewStats: {
              count: reviews.count || 0,
              average: reviews.average || 0,
              stats: reviews.stats || [],
              usedFallback: reviews.usedFallback || false
            },
            lastReviewsUpdated: new Date() 
          } 
        }
      );
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Failed to fetch/update reviews", message: error.message }, { status: 500 });
  }
}
