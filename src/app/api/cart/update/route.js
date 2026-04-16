import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function POST(req) {
  try {
    const {
      userId: rawUserId,
      sessionId,
      currentVariantId,
      nextVariantId,
      quantity,
      size,
      price,
      variantTitle,
      inStock,
    } = await req.json();
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

    let query = buildCartLookup({ userId, sessionId });
    let cart = await cartCollection.findOne(query);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const updatedItems = cart.items.map((item) => {
      if (item.variantId === currentVariantId) {
        return { 
          ...item, 
          variantId: nextVariantId !== undefined ? nextVariantId : item.variantId,
          variantTitle: variantTitle !== undefined ? variantTitle : item.variantTitle,
          quantity: quantity !== undefined ? quantity : item.quantity,
          size: size !== undefined ? size : item.size,
          price: price !== undefined ? price : item.price,
          inStock: inStock !== undefined ? inStock : item.inStock,
        };
      }
      return item;
    });

    await cartCollection.updateOne(
      { _id: cart._id },
      { $set: { items: updatedItems, updatedAt: new Date() } }
    );

    // Recalculate totals
    const totalQuantity = updatedItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = updatedItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    return NextResponse.json({ items: updatedItems, totalQuantity, totalAmount });
  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
