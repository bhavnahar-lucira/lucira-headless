const { Client } = require("@opensearch-project/opensearch");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = new Client({
  node: process.env.OPENSEARCH_NODE || "http://localhost:9200",
});

const SHOP = process.env.SHOPIFYSTORE || "luciraonline";
const TOKEN = process.env.STOREFRONT_TOKEN;

async function fetchAllProducts() {
  const query = `
    query {
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            featuredImage { url }
            priceRange {
              minVariantPrice { 
                amount 
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOP}.myshopify.com/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  return data.data.products.edges.map(e => e.node);
}

async function run() {
  try {
    console.log("Fetching products from Shopify...");
    const products = await fetchAllProducts();
    console.log(`Fetched ${products.length} products.`);

    const body = products.flatMap((doc) => [
      { index: { _index: "products", _id: doc.id.split("/").pop() } },
      {
        title: doc.title,
        handle: doc.handle,
        description: doc.description,
        tags: doc.tags,
        image: doc.featuredImage?.url,
        price_amount: parseFloat(doc.priceRange.minVariantPrice.amount),
        price_display: `${doc.priceRange.minVariantPrice.amount} ${doc.priceRange.minVariantPrice.currencyCode}`,
        compare_price_display: doc.compareAtPriceRange?.minVariantPrice?.amount 
          ? `${doc.compareAtPriceRange.minVariantPrice.amount} ${doc.compareAtPriceRange.minVariantPrice.currencyCode}`
          : null,
      },
    ]);

    console.log("Indexing into OpenSearch...");
    const response = await client.bulk({ body });
    if (response.body.errors) {
      console.error("Bulk indexing error:", response.body.errors);
    } else {
      console.log("Successfully indexed products.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
