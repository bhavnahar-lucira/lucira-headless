const { shopifyAdminFetch } = require('./src/lib/shopify');

async function find() {
  try {
    console.log("Searching for Insurance...");
    const data1 = await shopifyAdminFetch(`
      {
        products(first: 20, query: "title:Insurance") {
          nodes {
            id
            title
            variants(first: 5) {
              nodes {
                id
                title
                price
              }
            }
          }
        }
      }
    `);
    console.log("Insurance Results:", JSON.stringify(data1, null, 2));

    console.log("\nSearching for Gold Coin...");
    const data2 = await shopifyAdminFetch(`
      {
        products(first: 20, query: "title:Gold Coin") {
          nodes {
            id
            title
            variants(first: 5) {
              nodes {
                id
                title
                price
              }
            }
          }
        }
      }
    `);
    console.log("Gold Coin Results:", JSON.stringify(data2, null, 2));

  } catch (e) {
    console.error("Error fetching from Shopify:", e);
  }
}

find();
