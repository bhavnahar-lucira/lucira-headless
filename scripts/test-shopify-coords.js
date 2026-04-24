const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testLocationCoordinates() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

  const query = `
    query {
      locations(first: 5) {
        edges {
          node {
            id
            name
            # Checking for direct coordinate fields
            # locationAddress is often where these are found in some versions
            # or directly on the node
            latitude
            longitude
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
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testLocationCoordinates();
