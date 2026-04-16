import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeUserId(searchParams.get("userId"));
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "UserId or SessionId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cartCollection = db.collection("carts");

    // Search for cart by userId first, then sessionId
    let query = buildCartLookup({ userId, sessionId });
    let cart = await cartCollection.findOne(query);

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [], totalQuantity: 0, totalAmount: 0 });
    }

    // Keep cart prices fixed to the stored item price until the item is explicitly changed.
    const totalQuantity = cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = cart.items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    return NextResponse.json({ ...cart, totalQuantity, totalAmount });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return NextResponse.json({ error: "Failed to get cart" }, { status: 500 });
  }
}
