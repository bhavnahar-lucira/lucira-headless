import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

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
                    amount { amount }
                  }
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems { allItems }
                  ... on DiscountProducts {
                    products(first: 100) { nodes { id } }
                  }
                  ... on DiscountCollections {
                    collections(first: 100) { nodes { id } }
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

    // --- Validation against Cart Items ---
    const entitledItems = discountInfo.customerGets?.items;
    
    // If it's not "all items", we need to validate
    if (entitledItems && !entitledItems.allItems) {
      const client = await clientPromise;
      const db = client.db("next_local_db");
      const productsCollection = db.collection("products");

      const entitledProductIds = entitledItems.products?.nodes?.map(p => p.id) || [];
      const entitledCollectionIds = entitledItems.collections?.nodes?.map(c => c.id) || [];

      console.log("DEBUG: Entitled Products:", entitledProductIds);
      console.log("DEBUG: Entitled Collection IDs:", entitledCollectionIds);

      // Get product details for items in cart to check their IDs and collections
      const cartProductIds = items.map(item => {
        const id = item.shopifyId || item.productId || item.id;
        return (id && id.toString().includes("gid://")) ? id : `gid://shopify/Product/${id}`;
      }).filter(Boolean);
      
      console.log("DEBUG: Cart Product GIDs:", cartProductIds);

      const dbProducts = await productsCollection.find({ 
        shopifyId: { $in: cartProductIds } 
      }).project({ shopifyId: 1, collectionHandles: 1 }).toArray();

      console.log("DEBUG: DB Products found:", dbProducts.map(p => ({ id: p.shopifyId, collections: p.collectionHandles })));

      let entitledCollectionHandles = [];
      if (entitledCollectionIds.length > 0) {
        // Fetch handles for the entitled collection IDs with chunking
        const uniqueCollIds = [...new Set(entitledCollectionIds)];
        const CHUNK_SIZE = 100;
        const collNodes = [];

        for (let i = 0; i < uniqueCollIds.length; i += CHUNK_SIZE) {
          const chunk = uniqueCollIds.slice(i, i + CHUNK_SIZE);
          const collectionsData = await shopifyAdminFetch(`
            query getCollections($ids: [ID!]!) {
              nodes(ids: $ids) {
                ... on Collection {
                  id
                  handle
                }
              }
            }
          `, { ids: chunk });
          if (collectionsData?.nodes) {
            collNodes.push(...collectionsData.nodes);
          }
        }
        
        entitledCollectionHandles = collNodes.map(n => n.handle).filter(Boolean) || [];
        console.log("DEBUG: Entitled Collection Handles:", entitledCollectionHandles);
      }

      const applicableItems = items.filter(item => {
        // Normalize Product GID for comparison
        const rawId = item.shopifyId || item.productId || item.id;
        let productGid = (rawId && rawId.toString().includes("gid://")) ? rawId : `gid://shopify/Product/${rawId}`;
        
        const dbProduct = dbProducts.find(p => p.shopifyId === productGid);
        
        // 1. Check if product is explicitly entitled
        const isProductEntitled = entitledProductIds.includes(productGid);
        
        // 2. Check if any of product's collections are entitled
        // Use handles for comparison as they are stored in our DB
        const isCollectionEntitled = dbProduct && dbProduct.collectionHandles && entitledCollectionHandles.length > 0 
          ? dbProduct.collectionHandles.some(h => entitledCollectionHandles.includes(h))
          : false;

        console.log(`DEBUG: Item ${rawId} (${productGid}) - Product Entitled: ${isProductEntitled}, Collection Entitled: ${isCollectionEntitled}`);
        return isProductEntitled || isCollectionEntitled;
      });

      console.log("DEBUG: Applicable items count:", applicableItems.length);

      if (applicableItems.length === 0) {
        return NextResponse.json({ 
          error: "This coupon is not applicable to the items in your cart." 
        }, { status: 400 });
      }

      // If we're here, some items are applicable. 
      // Note: In a real checkout, Shopify would only apply the discount to the applicable line items.
      // For this validation, we've confirmed it's at least partially applicable.
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
