import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

async function getCustomerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("customerAccessToken")?.value || "";
}

async function getCustomerId(customerAccessToken) {
  const data = await shopifyStorefrontFetch(`
    query($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
      }
    }
  `, { customerAccessToken });
  return data?.customer?.id;
}

export async function GET() {
  try {
    const customerAccessToken = await getCustomerAccessToken();
    if (!customerAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerId(customerAccessToken);
    if (!customerId) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const simpleId = customerId.split("/").pop();

    // Fetch Metafields for Loyalty Points via Admin API (internal fetch)
    const metafieldQuery = `
      query getCustomerMetafields($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "nector", key: "custom_properties") {
            value
          }
        }
      }
    `;

    const [metafieldRes, wishlistClient] = await Promise.all([
      fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.ADMIN_TOKEN
        },
        body: JSON.stringify({
          query: metafieldQuery,
          variables: { id: customerId }
        })
      }),
      clientPromise
    ]);

    const metafieldData = await metafieldRes.json();
    const rawJson = metafieldData?.data?.customer?.metafield?.value;
    let points = "0";
    let tier = "Member";
    let nextTierPoints = "0";
    let progress = 0;

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      points = parsed.nector_user_points?.toString() || "0";
      tier = parsed.nector_user_tier_name || "Member";
      // We can also extract more info if needed
      // nector_user_next_tier_remaining_points
      nextTierPoints = parsed.nector_user_next_tier_remaining_points?.toString() || "0";
      
      // Calculate progress if possible (dummy calculation or from data)
      progress = 75; // Default for now if not in data
    }

    // Fetch Wishlist count from MongoDB
    const db = wishlistClient.db();
    const wishlistCount = await db.collection("wishlist").countDocuments({ customerId });

    return NextResponse.json({
      points,
      tier,
      nextTierPoints,
      progress,
      wishlistCount
    });

  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
