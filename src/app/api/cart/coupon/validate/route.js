import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";

export async function POST(req) {
  try {
    const { items, couponCode, customerEmail } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Create a temporary draft order to validate the coupon
    const draftOrderInput = {
      lineItems: items.map(item => ({
        variantId: item.variantId.includes("gid://") ? item.variantId : `gid://shopify/ProductVariant/${item.variantId}`,
        quantity: Number(item.quantity || 1),
        originalUnitPrice: Number(item.price || 0)
      })),
      appliedDiscount: {
        title: couponCode,
        value: 0,
        valueType: "FIXED_AMOUNT"
      },
      email: customerEmail || undefined,
      useCustomerDefaultAddress: false,
    };

    // We use a trick: In Shopify Draft Orders, if you want to test a real 'Discount Code',
    // you usually have to use the Storefront API or create it via Admin.
    // However, to check IF a code exists and get its value, we can query the code directly.
    
    const discountData = await shopifyAdminFetch(`
      query getDiscount($code: String!) {
        codeDiscountNodeByCode(code: $code) {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              summary
              shortSummary
              customerGets {
                value {
                  ... on DiscountAmount {
                    amount {
                      amount
                    }
                  }
                  ... on DiscountPercentage {
                    percentage
                  }
                }
              }
            }
          }
        }
      }
    `, { code: couponCode });

    const discountNode = discountData?.codeDiscountNodeByCode;

    if (!discountNode || discountNode.codeDiscount.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    const discountInfo = discountNode.codeDiscount;
    let value = 0;
    let valueType = "FIXED_AMOUNT";

    if (discountInfo.customerGets?.value?.amount) {
      value = Number(discountInfo.customerGets.value.amount.amount);
      valueType = "FIXED_AMOUNT";
    } else if (discountInfo.customerGets?.value?.percentage) {
      value = Number(discountInfo.customerGets.value.percentage) * 100; // Shopify returns 0.1 for 10%
      valueType = "PERCENTAGE";
    }
    
    return NextResponse.json({ 
      success: true, 
      code: couponCode,
      summary: discountInfo.summary || discountInfo.shortSummary || "Coupon applied successfully",
      value,
      valueType
    });

  } catch (error) {
    console.error("COUPON VALIDATION ERROR:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
