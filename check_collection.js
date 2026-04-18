const SHOP = "luciraonline";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

async function run() {
  const query = `
    {
      collections(first: 50, query: "title:'Diamond Jewelry'") {
        nodes {
          id
          title
          handle
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOP}.myshopify.com/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
