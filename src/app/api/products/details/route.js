import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    const PRODUCT_QUERY = `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          tags
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price { amount }
                compareAtPrice { amount }
                selectedOptions { name value }
                image { url }
              }
            }
          }
          seo { title description }
        }
      }
    `;

    const data = await shopifyStorefrontFetch(PRODUCT_QUERY, { handle });
    const product = data?.product;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product Details Error:", error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}
