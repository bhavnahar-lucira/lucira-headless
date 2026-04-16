import { NextResponse } from "next/server";

const SHOP = "luciraonline";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { cartId, customerAccessToken } = body;

    // fall back to cookie when available
    const token =
      customerAccessToken || req.cookies.get("customerAccessToken")?.value;

    if (!cartId || !token) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${SHOP}.myshopify.com/api/2024-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation {
              cartBuyerIdentityUpdate(
                cartId: "${cartId}"
                buyerIdentity: {
                  customerAccessToken: "${token}"
                }
              ) {
                cart {
                  id
                  totalQuantity
                }
              }
            }
          `,
        }),
      }
    );

    const data = await response.json();
    const cart = data?.data?.cartBuyerIdentityUpdate?.cart;

    return NextResponse.json(cart);

  } catch (err) {
    console.error("ATTACH CART ERROR:", err);
    return NextResponse.json(
      { error: "Attach cart failed" },
      { status: 500 }
    );
  }
}