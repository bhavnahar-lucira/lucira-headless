import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const reviewsCollection = db.collection("reviews");

    // Fetch latest reviews with product data AND images
    const reviewsFromDb = await reviewsCollection
      .find({ 
        productHandle: { $ne: "" },
        images: { $exists: true, $not: { $size: 0 } }
      })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    if (reviewsFromDb.length === 0) {
      // Fallback to any review if no reviews have images (optional, but requested only reviews with images)
      return NextResponse.json([]);
    }

    const mappedReviews = reviewsFromDb.map((review) => ({
      id: review.id || review._id,
      personName: review.name || "Verified Buyer",
      verified: true,
      personImage: review.images[0], // Only reviews with images are here
      review: review.text || review.description,
      productTitle: review.productTitle || "",
      productImage: review.productImage || "/images/product/1.jpg",
      productHandle: review.productHandle || "",
      rating: review.rating || 5,
      date: review.date,
      title: review.title || ""
    }));

    // Shuffle and limit
    const shuffled = mappedReviews.sort(() => 0.5 - Math.random()).slice(0, 10);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error("Home Reviews API Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
