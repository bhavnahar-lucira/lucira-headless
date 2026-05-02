import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    
    // Build query
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { handle: { $regex: q, $options: "i" } }
      ];
    }

    const total = await db.collection("shopify_collections").countDocuments(query);
    const collections = await db
      .collection("shopify_collections")
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      collections: collections.map((col) => ({
        id: col.shopifyId || col._id,
        title: col.title,
        handle: col.handle,
        updatedAt: col.updatedAt,
        hasFaq: !!col.faqQuestion,
        hasSeo: !!col.seoContent,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("List Collections Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
