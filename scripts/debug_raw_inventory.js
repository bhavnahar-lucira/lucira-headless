const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugRawInventory() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  
  // Variant ID from your link: 46332112601306
  const variantId = "gid://shopify/ProductVariant/46332112601306";

  const query = `
    query getVariant($id: ID!) {
      productVariant(id: $id) {
        id
        title
        inventoryQuantity
        inventoryItem {
          id
          inventoryLevels(first: 10) {
            edges {
              node {
                location { id name }
                quantities(names: ["available"]) { name quantity }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables: { id: variantId } }),
    });

    const result = await response.json();
    console.log('--- Shopify RAW Response ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugRawInventory();
