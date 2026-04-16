const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugShopify() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE;
  const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

  console.log("Domain:", SHOPIFY_DOMAIN);
  console.log("Token:", ACCESS_TOKEN ? "Present (Length: " + ACCESS_TOKEN.length + ")" : "Missing");

  try {
    const countRes = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/count.json?status=active`, {
      headers: { "X-Shopify-Access-Token": ACCESS_TOKEN }
    });
    const countData = await countRes.json();
    console.log("Active Products Count:", countData);

    const query = `
            query getProducts($cursor: String) {
              products(first: 5, after: $cursor, query: "status:active") {
                pageInfo { hasNextPage endCursor }
                edges {
                  node {
                    id title handle descriptionHtml vendor productType status tags createdAt
                    featuredImage { url }
                    collections(first: 10) { edges { node { handle } } }
                    shop_for: metafield(namespace: "custom", key: "shop_for") { value }
                    weight: metafield(namespace: "custom", key: "weight") { value }
                    carat_range: metafield(namespace: "custom", key: "carat_range") { value }
                    material_type: metafield(namespace: "ornaverse", key: "material_type") { value }
                    finishing: metafield(namespace: "custom", key: "finishing") { value }
                    fit: metafield(namespace: "custom", key: "fit") { value }
                    matching_products: metafield(namespace: "custom", key: "matching_product") { value }
                    complementary_products: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") { value }
                    variants(first: 10) {
                      edges {
                        node {
                          id price compareAtPrice inventoryQuantity sku selectedOptions { name value }
                          image { url }
                          in_store: metafield(namespace: "custom", key: "in_store_available") { value }
                          ring_size: metafield(namespace: "custom", key: "ring_size_inventory") { value }
                          diamond_shape: metafield(namespace: "custom", key: "diamond_1_shape") { value }
                          metal_purity: metafield(namespace: "custom", key: "metal_purity") { value }
                          metal_weight: metafield(namespace: "custom", key: "metal_weight") { value }
                          metal_color: metafield(namespace: "custom", key: "metal_color") { value }
                          gross_weight: metafield(namespace: "custom", key: "gross_weight") { value }
                          top_height: metafield(namespace: "custom", key: "top_height") { value }
                          top_width: metafield(namespace: "custom", key: "top_width") { value }
                          d1_clarity: metafield(namespace: "custom", key: "diamond_1_clarity") { value }
                          d1_color: metafield(namespace: "custom", key: "diamond_1_color") { value }
                          d1_shape: metafield(namespace: "custom", key: "diamond_1_shape") { value }
                          d1_pcs: metafield(namespace: "custom", key: "diamond_1_numbers") { value }
                          d1_wt: metafield(namespace: "custom", key: "diamond_1_weight") { value }
                          d2_clarity: metafield(namespace: "custom", key: "diamond_2_clarity") { value }
                          d2_color: metafield(namespace: "custom", key: "diamond_2_color") { value }
                          d2_shape: metafield(namespace: "custom", key: "diamond_2_shape") { value }
                          d2_pcs: metafield(namespace: "custom", key: "diamond_2_numbers") { value }
                          d2_wt: metafield(namespace: "custom", key: "diamond_2_weight") { value }
                          gem1_color: metafield(namespace: "custom", key: "gemstone_1_color") { value }
                          gem1_shape: metafield(namespace: "custom", key: "gemstone_1_shape") { value }
                          gem1_pcs: metafield(namespace: "custom", key: "gemstone_1_numbers") { value }
                          gem1_wt: metafield(namespace: "custom", key: "gemstone_1_weight") { value }
                          gem2_color: metafield(namespace: "custom", key: "gemstone_2_color") { value }
                          gem2_shape: metafield(namespace: "custom", key: "gemstone_2_shape") { value }
                          gem2_pcs: metafield(namespace: "custom", key: "gemstone_2_numbers") { value }
                          gem2_wt: metafield(namespace: "custom", key: "gemstone_2_weight") { value }
                          variant_config: metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
                        }
                      }
                    }
                    media(first: 10) {
                      edges {
                        node {
                          mediaContentType
                          alt
                          ... on MediaImage { image { url altText } }
                          ... on Video { sources { url format mimeType } preview { image { url } } }
                          ... on ExternalVideo { embeddedUrl preview { image { url } } }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;


    const gqlRes = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ACCESS_TOKEN },
      body: JSON.stringify({ query }),
    });
    const gqlData = await gqlRes.json();
    console.log("GraphQL Sample Result:", JSON.stringify(gqlData, null, 2));

  } catch (error) {
    console.error("Debug Error:", error);
  }
}

debugShopify();
