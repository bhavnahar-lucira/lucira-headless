import { shopifyAdminFetch } from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
      {
        shop {
          metal_prices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") {
            id
            value
          }
        }
      }
    `;

    const data = await shopifyAdminFetch(query);
    const metalPrices = data?.shop?.metal_prices;

    return NextResponse.json({
      id: metalPrices?.id,
      values: metalPrices?.value ? JSON.parse(metalPrices.value) : {}
    });
  } catch (error) {
    console.error("Failed to fetch metal prices:", error);
    return NextResponse.json({ error: "Failed to fetch metal prices" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { values } = await req.json();

    const mutation = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          namespace: "DI-GoldPrice",
          key: "metal_prices",
          type: "json",
          value: JSON.stringify(values),
          ownerId: await getShopId()
        }
      ]
    };

    const result = await shopifyAdminFetch(mutation, variables);

    if (result?.metafieldsSet?.userErrors?.length > 0) {
      return NextResponse.json({ errors: result.metafieldsSet.userErrors }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update metal prices:", error);
    return NextResponse.json({ error: "Failed to update metal prices" }, { status: 500 });
  }
}

async function getShopId() {
  const query = `{ shop { id } }`;
  const data = await shopifyAdminFetch(query);
  return data.shop.id;
}
