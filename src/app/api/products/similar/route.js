import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import { fetchNectorReviews } from "@/lib/nector";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id"); 

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

    const products = await Promise.all((data?.productRecommendations || []).map(async (p) => {
      let reviewStats = { count: 0, average: 0 };
      try {
        const reviews = await fetchNectorReviews(p.id);
        reviewStats = { count: reviews.count || 0, average: reviews.average || 0 };
      } catch(e) {}

      return {
        id: p.id.split("/").pop(),
        shopifyId: p.id,
        title: p.title,
        handle: p.handle,
        image: p.featuredImage?.url,
        price: Number(p.variants.edges[0]?.node?.price?.amount || 0),
        compare_price: Number(p.variants.edges[0]?.node?.compareAtPrice?.amount || 0),
        reviewStats
      };
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Similar Products Error:", error);
    return NextResponse.json({ products: [] });
  }
}
