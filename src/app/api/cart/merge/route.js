import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function POST(req) {
  try {
    const { userId: rawUserId, sessionId } = await req.json();
    const userId = normalizeUserId(rawUserId);
    console.log("MERGE REQUEST:", { userId, sessionId });

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "UserId and SessionId are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const cartCollection = db.collection("carts");

    // Find guest cart by sessionId
    const guestCart = await cartCollection.findOne({ sessionId });
    
    // Find user cart by userId
    const userCart = await cartCollection.findOne(buildCartLookup({ userId, sessionId: null }));

    console.log("MERGE STATUS:", {
      guestCartFound: !!guestCart,
      userCartFound: !!userCart,
      isSameCart: guestCart && userCart && guestCart._id.toString() === userCart._id.toString()
    });

    if (!guestCart) {
      // If no guest cart, just return user cart or empty
      const existingCart = userCart || { items: [], totalQuantity: 0, totalAmount: 0 };
      return NextResponse.json(existingCart);
    }

    // CASE: Both session and user refer to the same document
    if (userCart && guestCart._id.toString() === userCart._id.toString()) {
      console.log("SAME CART DETECTED - Updating userId only");
      await cartCollection.updateOne(
        { _id: guestCart._id },
        {
          $set: { userId, updatedAt: new Date() },
          $unset: { sessionId: "" },
        }
      );
      
      const totalQuantity = guestCart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
      const totalAmount = guestCart.items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
      
      return NextResponse.json({ ...guestCart, userId, totalQuantity, totalAmount });
    }

    // CASE: Two different documents - Merge items
    let mergedItems = userCart ? [...userCart.items] : [];

    guestCart.items.forEach((guestItem) => {
      const existingItemIndex = mergedItems.findIndex(
        (item) => item.variantId === guestItem.variantId
      );

      if (existingItemIndex > -1) {
        const updatedItem = {
          ...mergedItems[existingItemIndex],
          ...guestItem,
          quantity: guestItem.quantity || 1,
        };
        mergedItems.splice(existingItemIndex, 1);
        mergedItems.unshift(updatedItem);
      } else {
        mergedItems.unshift(guestItem);
      }
    });

    if (userCart) {
      // Update existing user cart
      await cartCollection.updateOne(
        { _id: userCart._id },
        {
          $set: { userId, items: mergedItems, updatedAt: new Date() },
          $unset: { sessionId: "" },
        }
      );
      // Delete guest cart
      await cartCollection.deleteOne({ _id: guestCart._id });
    } else {
      // Convert guest cart to user cart
      await cartCollection.updateOne(
        { _id: guestCart._id },
        { 
          $set: { 
            userId,
            items: mergedItems, 
            updatedAt: new Date() 
          },
          $unset: { sessionId: "" } // Optionally remove sessionId or keep it
        }
      );
    }

    // Recalculate totals
    const totalQuantity = mergedItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = mergedItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    return NextResponse.json({ items: mergedItems, totalQuantity, totalAmount });
  } catch (err) {
    console.error("MERGE CART ERROR:", err);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}
