import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customerId" },
        { status: 400 }
      );
    }

    const shopifyCustomerId = `gid://shopify/Customer/${customerId}`;

    const query = `
      query getCustomerReferral($id: ID!) {
        customer(id: $id) {
          metafield(
            namespace: "nector"
            key: "custom_properties"
          ) {
            value
          }
        }
      }
    `;

    const response = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            process.env.ADMIN_TOKEN
        },
        body: JSON.stringify({
          query,
          variables: {
            id: shopifyCustomerId
          }
        })
      }
    );

    const data = await response.json();

    if (data.errors?.length) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 403 }
      );
    }

    const rawJson = data?.data?.customer?.metafield?.value;

    if (!rawJson) {
      return NextResponse.json({ referralLink: "" });
    }

    const parsed = JSON.parse(rawJson);

    const referralLink = parsed.nector_user_referral_link || "";

    return NextResponse.json({ referralLink });

  } catch(error) {
    console.error("Referral API Error:", error);
    return NextResponse.json(
      { error: "Failed fetching referral link" },
      { status:500 }
    );
  }
}