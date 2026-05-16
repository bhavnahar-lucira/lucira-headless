import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id"); // Storefront API needs GID or product recommendations from handle

    if (!productId) {
      return NextResponse.json({ products: [] });
    }

    const RECOMMENDATIONS_QUERY = `
      query productRecommendations($productId: ID!) {
        productRecommendations(productId: $productId) {
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
    `;

    const data = await shopifyStorefrontFetch(RECOMMENDATIONS_QUERY, {
      productId: productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`,
    });

    const products = (data?.productRecommendations || []).map(p => ({
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
    console.error("Similar Products Error:", error);
    return NextResponse.json({ products: [] });
  }
}
