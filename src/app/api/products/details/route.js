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

    const product = await productsCollection.findOne({ 
      handle: handle,
      status: "ACTIVE",
      isPublished: true
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Ensure discounts are present for UI badges
    const diamondDiscount = product.diamondDiscount || product.variants?.[0]?.price_breakup?.diamond?.discount_percent || 0;
    const makingDiscount = product.makingDiscount || product.variants?.[0]?.price_breakup?.making_charges?.discount_percent || 0;

    return NextResponse.json({ 
      product: {
        ...product,
        diamondDiscount,
        makingDiscount,
        hasSimilar: !!(product.matchingProductIds && product.matchingProductIds.length > 0)
      } 
    });
  } catch (error) {
    console.error("Product Details Error:", error);
    return NextResponse.json({ error: "Failed to fetch product details", message: error.message }, { status: 500 });
  }
}
