async function shopifyStorefrontFetch(query, variables = {}) {
  const response = await fetch('https://lucira-india.myshopify.com/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '3200780f2d9737ec2e53df4e7235f3df',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors) {
    console.error("Shopify Errors:", JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function find() {
  try {
    const data = await shopifyStorefrontFetch(`
      query {
        products(first: 10, query: "title:Insurance") {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                    }
                    compareAtPrice {
                      amount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);
    if (!data) {
        console.log("No data returned from Shopify");
        return;
    }
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
find();
