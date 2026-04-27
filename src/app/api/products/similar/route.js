import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");

    // 1. Find the source product
    const product = await productsCollection.findOne({ handle: handle });
    if (!product || !product.matchingProductIds || product.matchingProductIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 2. Fetch all matching products by their Shopify IDs
    // Support both full GID and numeric ID strings using regex
    const idFilters = product.matchingProductIds.map(id => ({
      shopifyId: { $regex: `${id}$` }
    }));

    const similarProducts = await productsCollection
      .find({ $or: idFilters })
      .toArray();

    return NextResponse.json({ 
      products: similarProducts.map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        reviews: p.reviews || p.reviewStats || null
      }))
    });
  } catch (error) {
    console.error("Similar Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch similar products", message: error.message }, { status: 500 });
  }
}
