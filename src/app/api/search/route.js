import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { resolveSearchMatch } from "@/lib/search";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");

    const { filter } = await resolveSearchMatch(productsCollection, {}, query);

    const products = await productsCollection
      .find(filter)
      .limit(10)
      .project({
        title: 1,
        handle: 1,
        price: 1,
        images: 1,
      })
      .toArray();

    const results = products.map((p) => {
      const firstImage = p.images && p.images.length > 0 ? p.images[0].url : null;
      
      return {
        id: p._id.toString(),
        title: p.title,
        handle: p.handle,
        image: firstImage,
        price: p.price ? `₹${p.price.toLocaleString()}` : "Price on request",
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("MongoDB Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
