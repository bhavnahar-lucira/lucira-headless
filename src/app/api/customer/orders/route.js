import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

async function getCustomerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("customerAccessToken")?.value || "";
}

export async function GET() {
  try {
    const customerAccessToken = await getCustomerAccessToken();
    if (!customerAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await shopifyStorefrontFetch(`
      query($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                totalPriceV2 {
                  amount
                  currencyCode
                }
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      variant {
                        image {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { customerAccessToken });

    if (!data?.customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orders = data.customer.orders.edges.map(({ node }) => ({
      id: node.id,
      orderNumber: node.orderNumber,
      date: new Date(node.processedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: node.fulfillmentStatus === 'FULFILLED' ? 'Delivered' : 
              node.fulfillmentStatus === 'IN_PROGRESS' ? 'In Transit' : 'Processing',
      amount: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: node.totalPriceV2.currencyCode,
      }).format(node.totalPriceV2.amount),
      product: node.lineItems.edges[0]?.node.title || "Jewelry Item",
      image: node.lineItems.edges[0]?.node.variant?.image?.url || "/images/product/1.jpg"
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
