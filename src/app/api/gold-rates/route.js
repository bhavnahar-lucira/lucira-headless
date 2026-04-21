import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";

export async function GET() {
  try {
    const query = `
      query {
        shop {
          metalPrices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") {
            value
          }
        }
      }
    `;

    const data = await shopifyAdminFetch(query);

    if (!data.shop?.metalPrices?.value) {
      // Fallback rates if metafield is missing
      return NextResponse.json({
        "gold_price_24k": 8200,
        "gold_price_22k": 7500,
        "platinum_price": 2500,
        "default_tax": 3
      });
    }

    const metalRates = JSON.parse(data.shop.metalPrices.value);
    return NextResponse.json(metalRates);

  } catch (err) {
    console.error("❌ Gold rates API error:", err);
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
