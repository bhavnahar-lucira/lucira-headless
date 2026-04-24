const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testInventoryRestCount() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  const locationId = "87408541914"; // BO1

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/locations/${locationId}/inventory_levels.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    });

    const result = await response.json();
    console.log("Count approach 1:", result.inventory_levels?.length);
    
    // Check Link header for more pages
    const link = response.headers.get('link');
    console.log("Link header:", link);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testInventoryRestCount();
