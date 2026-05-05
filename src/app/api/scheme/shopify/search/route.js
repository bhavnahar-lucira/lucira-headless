import { NextResponse } from "next/server";

/** 🔹 Words that should NOT block search */
const STOP_WORDS = [
  "under",
  "below",
  "above",
  "less",
  "than",
  "price",
  "rs",
  "₹",
];

/** 🔹 Normalize user query like Amazon */
const normalizeQuery = (q) => {
  return q
    .toLowerCase()
    .replace(/₹/g, "")
    .split(" ")
    .filter(word => !STOP_WORDS.includes(word))
    .join(" ")
    .trim();
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q");

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  const normalizedQuery = normalizeQuery(rawQuery);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  /** 🔹 Shopify GraphQL */
  const query = `
    query SearchProducts($query: String!) {
      products(first: 25, query: $query) {
        edges {
          node {
            title
            handle
            productType
            tags
            featuredImage {
              url
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

  const variables = {
    query: `
      status:active
      (title:*${normalizedQuery}*
       OR product_type:*${normalizedQuery}*
       OR handle:*${normalizedQuery}*
       OR tag:*${normalizedQuery}*)
    `,
  };

  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE}/admin/api/scheme/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  /** 🔹 Products */
  const products = json.data.products.edges.map(({ node }) => {
    const variant = node.variants.edges[0]?.node;
    return {
      title: node.title,
      handle: node.handle,
      productType: node.productType,
      price: Math.round(variant?.price || 0),
      compare_at_price: Math.round(variant?.compareAtPrice || 0),
      image: node.featuredImage?.url || null,
        url: `https://www.lucirajewelry.com/products/${node.handle}`,
    };
  });

  /** 🔹 Suggestions (titles + types + tags + manual) */
  const titleSuggestions = products.map(p => p.title);
  const typeSuggestions = products.map(p => p.productType).filter(Boolean);

  const manualSuggestions = [
    "Wedding Rings",
    "Engagement Rings",
    "Gold Rings",
    "Diamond Jewelry",
    "Gifts for Her",
    "Gifts for Him",
  ].filter(s =>
    s.toLowerCase().includes(normalizedQuery)
  );

  const suggestions = [
    ...new Set([
      ...titleSuggestions,
      ...typeSuggestions,
      ...manualSuggestions,
    ]),
  ].slice(0, 6);

  return NextResponse.json({
    suggestions,
    products: products.slice(0, 10),
  });
}
