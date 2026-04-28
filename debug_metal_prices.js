const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugMetalPrices() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE;
  const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

  const query = `
  {
    shop {
      metal_prices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") {
        value
      }
    }
  }
  `;

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ACCESS_TOKEN },
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    if (result.data?.shop?.metal_prices?.value) {
        console.log("Metal Prices JSON:", JSON.stringify(JSON.parse(result.data.shop.metal_prices.value), null, 2));
    } else {
        console.log("Metal prices metafield not found or empty.");
        console.log("Full Result:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("Debug Error:", error);
  }
}

debugMetalPrices();
