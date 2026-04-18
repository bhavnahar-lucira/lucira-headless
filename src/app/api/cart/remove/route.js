import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function POST(req) {
  try {
    const { userId: rawUserId, sessionId, variantId } = await req.json();
    const userId = normalizeUserId(rawUserId);

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

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const updatedItems = cart.items.filter((item) => item.variantId !== variantId);

    console.log("REMOVE LOG:", {
      originalCount: cart.items.length,
      newCount: updatedItems.length,
      variantId
    });

    if (updatedItems.length === 0) {
      // If no items left, delete the document entirely
      await cartCollection.deleteOne({ _id: cart._id });
      return NextResponse.json({ 
        items: [], 
        totalQuantity: 0, 
        totalAmount: 0 
      });
    }

    // Recalculate totals
    const totalQuantity = updatedItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = updatedItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    await cartCollection.updateOne(
      { _id: cart._id },
      { 
        $set: { 
          items: updatedItems, 
          totalQuantity,
          totalAmount,
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({ items: updatedItems, totalQuantity, totalAmount });
  } catch (err) {
    console.error("REMOVE FROM CART ERROR DETAILS:", err);
    return NextResponse.json({ error: err.message || "Failed to remove from cart" }, { status: 500 });
  }
}
