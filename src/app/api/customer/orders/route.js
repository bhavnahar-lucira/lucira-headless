import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyStorefrontFetch, shopifyAdminRestFetch } from "@/lib/shopify";

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

    // Fetch orders using Shopify Admin REST API
    const numericCustomerId = customerId.split('/').pop();
    const { data } = await shopifyAdminRestFetch('orders.json', {
      customer_id: numericCustomerId,
      status: 'any',
      limit: 20
    });

    const orders = (data.orders || []).map((order) => ({
      id: order.admin_graphql_api_id,
      orderNumber: order.order_number.toString(),
      date: new Date(order.processed_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: order.fulfillment_status === 'fulfilled' ? 'Delivered' : 
              order.fulfillment_status === 'partial' ? 'In Transit' : 'Processing',
      amount: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: order.currency,
      }).format(order.total_price),
      product: order.line_items[0]?.name || "Jewelry Item",
      // Note: Admin REST API orders endpoint doesn't return line item images directly.
      // Using a fallback or the product_id to fetch if needed, but for now fallback.
      image: "/images/product/1.jpg" 
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin REST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
