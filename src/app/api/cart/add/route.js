import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function POST(req) {
  try {
    const { userId: rawUserId, sessionId, product } = await req.json();
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
      // Create new cart
      cart = {
        userId: userId || null,
        sessionId: userId ? null : sessionId || null,
        items: [product],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await cartCollection.insertOne(cart);
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.variantId === product.variantId
      );

      if (existingItemIndex > -1) {
        // Replace the existing item with the latest payload instead of incrementing quantity
        const updatedItem = {
          ...cart.items[existingItemIndex],
          ...product,
          quantity: product.quantity || 1,
        };
        cart.items.splice(existingItemIndex, 1);
        cart.items.unshift(updatedItem);
      } else {
        // Add new item
        cart.items.unshift(product);
      }
      
      await cartCollection.updateOne(
        { _id: cart._id },
        userId
          ? {
              $set: {
                items: cart.items,
                updatedAt: new Date(),
                userId,
              },
              $unset: { sessionId: "" },
            }
          : {
              $set: {
                items: cart.items,
                updatedAt: new Date(),
                sessionId: sessionId || cart.sessionId || null,
              },
            }
      );
    }

    // Recalculate totals
    const totalQuantity = cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = cart.items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    // Persist totals
    await cartCollection.updateOne(
      { _id: cart._id },
      { $set: { totalQuantity, totalAmount } }
    );

    return NextResponse.json({ ...cart, totalQuantity, totalAmount });
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
