import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const productType = searchParams.get("type");
  const start = searchParams.get("start") || 0;
  const end = searchParams.get("end") || 999999;

  const query = `
    query {
      products(
        first: 4
        query: "status:active product_type:${productType} variants.price:>=${start} variants.price:<=${end}"
      ) {
        edges {
          node {
            title
            productType
            status
            handle
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  price
                  compareAtPrice
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE}/admin/api/scheme/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    return NextResponse.json({ error: "Shopify error" }, { status: 500 });
  }

  const products = json.data.products.edges.map(({ node }) => {
    const variant = node.variants.edges[0]?.node;
    return {
      title: node.title,
      product_type: node.productType,
      price: Math.round(variant?.price),
      compare_at_price: Math.round(variant?.compareAtPrice),
      url: `https://www.lucirajewelry.com/products/${node.handle}`,
      image: node.featuredImage
        ? { src: node.featuredImage.url, alt: node.featuredImage.altText }
        : null,
    };
  });

  return NextResponse.json(products);
}
