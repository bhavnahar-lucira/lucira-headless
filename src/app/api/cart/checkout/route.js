import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { shopifyAdminFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";
import { buildCartLookup, normalizeUserId } from "@/lib/cartIdentity";

export async function POST(req) {
  try {
    const { userId: rawUserId, sessionId } = await req.json();
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

    const cart = await cartCollection.findOne(buildCartLookup({ userId, sessionId }));

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [], totalQuantity: 0, totalAmount: 0 });
    }

    let updatedItems = cart.items;
    let pricesChanged = false;

    try {
      const variantGids = cart.items
        .filter((item) => item?.variantId)
        .map((item) =>
          item.variantId.includes("ProductVariant")
            ? item.variantId
            : `gid://shopify/ProductVariant/${item.variantId}`
        );

      if (variantGids.length > 0) {
        const shopifyQuery = `
          query($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on ProductVariant {
                id
                title
                metafield(namespace: "DI-GoldPrice", key: "variant_config") {
                  value
                }
              }
            }
            shop {
              metalPrices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") {
                value
              }
              stonePricing: metafield(namespace: "DI-GoldPrice", key: "stone_pricing") {
                value
              }
            }
          }
        `;

        const pricingData = await shopifyAdminFetch(shopifyQuery, { ids: variantGids });

        if (pricingData?.shop?.metalPrices?.value && pricingData?.shop?.stonePricing?.value) {
          const metalRates = JSON.parse(pricingData.shop.metalPrices.value);
          const stonePricingDB = JSON.parse(pricingData.shop.stonePricing.value);
          const variantNodes = pricingData.nodes || [];

          updatedItems = cart.items.map((item) => {
            const node = variantNodes.find(
              (variantNode) =>
                variantNode &&
                (variantNode.id === item.variantId ||
                  variantNode.id === `gid://shopify/ProductVariant/${item.variantId}`)
            );

            if (!node?.metafield?.value) {
              return item;
            }

            const config = JSON.parse(node.metafield.value);
            const latestPriceBreakup = calculatePriceBreakup(config, metalRates, stonePricingDB);
            const latestPrice = latestPriceBreakup.total;

            if (item.price !== latestPrice) {
              pricesChanged = true;
            }

            return {
              ...item,
              price: latestPrice,
              finalPrice: latestPrice,
              variantTitle: node.title || item.variantTitle,
            };
          });
        }
      }
    } catch (pricingErr) {
      console.error("CHECKOUT REPRICE ERROR (Using stored cart prices):", pricingErr);
    }

    const totalQuantity = updatedItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const totalAmount = updatedItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

    await cartCollection.updateOne(
      { _id: cart._id },
      { $set: { items: updatedItems, updatedAt: new Date() } }
    );

    return NextResponse.json({
      ...cart,
      items: updatedItems,
      totalQuantity,
      totalAmount,
      pricesChanged,
    });
  } catch (err) {
    console.error("CHECKOUT CART ERROR:", err);
    return NextResponse.json({ error: "Failed to recalculate checkout cart" }, { status: 500 });
  }
}
