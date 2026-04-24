const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testLocationRestFields() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/locations.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    });

    const result = await response.json();
    console.log("Full Location Data Sample (First Location):");
    if (result.locations && result.locations.length > 0) {
        console.log(JSON.stringify(result.locations[0], null, 2));
    } else {
        console.log("No locations found.");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testLocationRestFields();
