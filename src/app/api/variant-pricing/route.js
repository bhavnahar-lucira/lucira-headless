import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");
    const productId = searchParams.get("productId");

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    // 1. Fetch Shop-wide pricing data (Admin API)
    let metalRates = {};
    let stonePricingDB = [];
    try {
      const shopPricingQuery = `
        query {
          shop {
            metalPrices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") { value }
            stonePricing: metafield(namespace: "DI-GoldPrice", key: "stone_pricing") { value }
          }
        }
      `;
      const shopData = await shopifyAdminFetch(shopPricingQuery);
      if (shopData?.shop?.metalPrices?.value) metalRates = JSON.parse(shopData.shop.metalPrices.value);
      if (shopData?.shop?.stonePricing?.value) stonePricingDB = JSON.parse(shopData.shop.stonePricing.value);
    } catch (e) {
      console.warn("⚠️ Shop pricing metadata fetch failed:", e.message);
    }

    // 2. Fetch Variant Config Metafield
    const id = variantId.startsWith("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`;
    const variantQuery = `
      query getVariant($id: ID!) {
        node(id: $id) {
          ... on ProductVariant {
            id
            metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
          }
        }
      }
    `;

    const variantData = await shopifyAdminFetch(variantQuery, { id });
    const configValue = variantData?.node?.metafield?.value;

    if (!configValue) {
      return NextResponse.json({ error: "No config found for this variant" }, { status: 404 });
    }

    const config = JSON.parse(configValue);
    const breakup = calculatePriceBreakup(config, metalRates, stonePricingDB);

    return NextResponse.json(breakup);

  } catch (error) {
    console.error("❌ Variant Pricing API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
