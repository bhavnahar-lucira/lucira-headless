import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "newest";
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const reviewsCollection = db.collection("reviews");

    // Build Query
    const query = { productHandle: { $ne: "" } };
    if (rating && rating !== "all") {
      query.rating = parseInt(rating);
    }

    // Build Sort
    let sortObj = { date: -1 };
    if (sort === "oldest") sortObj = { date: 1 };
    if (sort === "highest") sortObj = { rating: -1, date: -1 };
    if (sort === "lowest") sortObj = { rating: 1, date: -1 };
    if (sort === "images") sortObj = { image_count: -1, date: -1 };
    if (sort === "videos") sortObj = { video_count: -1, date: -1 };

    // Fetch total count for pagination
    const total = await reviewsCollection.countDocuments(query);

    // Fetch paginated reviews
    const reviewsFromDb = await reviewsCollection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Fetch stats for the header
    const statsResult = await reviewsCollection.aggregate([
      { $match: { productHandle: { $ne: "" } } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]).toArray();

    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    let weightedSum = 0;
    statsResult.forEach(s => {
      stats[s._id] = s.count;
      totalRatings += s.count;
      weightedSum += s._id * s.count;
    });

    const averageRating = totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : 0;

    const mappedReviews = reviewsFromDb.map((review) => ({
      id: review.id || review._id,
      personName: review.name || "Verified Buyer",
      verified: true,
      personImage: review.images && review.images.length > 0 ? review.images[0] : null,
      images: review.images || [],
      review: review.text || review.description,
      productTitle: review.productTitle || "",
      productImage: review.productImage || "/images/product/1.jpg",
      productHandle: review.productHandle || "",
      rating: review.rating || 5,
      date: review.date,
      title: review.title || ""
    }));

    // Fetch all review images for the gallery with their review context
    const galleryItems = await reviewsCollection
      .find({ productHandle: { $ne: "" }, images: { $exists: true, $not: { $size: 0 } } })
      .sort({ date: -1 })
      .limit(20)
      .project({ images: 1, id: 1 })
      .toArray();

    const allGalleryImages = galleryItems.flatMap(g => 
      g.images.map(img => ({ url: img, reviewId: g.id }))
    );

    return NextResponse.json({
        reviews: mappedReviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats: {
          average: averageRating,
          total: totalRatings,
          breakdown: stats
        },
        gallery: allGalleryImages
    });
  } catch (error) {
    console.error("All Reviews API Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
