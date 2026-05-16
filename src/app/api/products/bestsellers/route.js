import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "All";

    let storefrontQuery = "tag:'best seller'";
    if (tab !== "All") {
      storefrontQuery = `tag:'best seller' product_type:${tab}`;
    }

    const BEST_SELLING_QUERY = `
      query BestSellingProducts($query: String!) {
        products(first: 20, query: $query, sortKey: BEST_SELLING) {
          edges {
            node {
              id
              title
              handle
              featuredImage { url }
              variants(first: 1) {
                edges {
                  node {
                    price { amount }
                    compareAtPrice { amount }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyStorefrontFetch(BEST_SELLING_QUERY, { query: storefrontQuery });
    const products = (data?.products?.edges || []).map(({ node: p }) => ({
      id: p.id.split("/").pop(),
      shopifyId: p.id,
      title: p.title,
      handle: p.handle,
      image: p.featuredImage?.url,
      price: Number(p.variants.edges[0]?.node?.price?.amount || 0),
      compare_price: Number(p.variants.edges[0]?.node?.compareAtPrice?.amount || 0),
      reviewStats: { count: 0, average: 0 }
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Bestsellers API Error:", error);
    return NextResponse.json({ products: [] });
  }
}
