import { NextResponse } from "next/server";

const SHOP = "luciraonline";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerAccessToken } = body;

    // try cookie if body did not include one
    const token =
      customerAccessToken || req.cookies.get("customerAccessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
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
              cartCreate(
                input: {
                  buyerIdentity: {
                    customerAccessToken: "${token}"
                  }
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
    const cart = data?.data?.cartCreate?.cart;

    return NextResponse.json(cart);

  } catch (err) {
    console.error("CREATE CART ERROR:", err);
    return NextResponse.json(
      { error: "Create cart failed" },
      { status: 500 }
    );
  }
}