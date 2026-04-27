import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { fetchNectorReviews } from "@/lib/nector";

export const dynamic = "force-dynamic";

export async function GET() {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) return NextResponse.json({ error: "Missing credentials" }, { status: 500 });

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/count.json?status=active`, {
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ACCESS_TOKEN },
    });
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Shopify Count Error (${response.status})`);
    }
    
    const result = await response.json();
    return NextResponse.json({ count: result.count || 0 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(req) {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  
  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing Shopify credentials (ADMIN_TOKEN and SHOPIFY_STORE)" }, { status: 500 });
  }

  let startCursor = null;
  let startProcessed = 0;
  try {
    const body = await req.json().catch(() => ({}));
    startCursor = body.cursor || null;
    startProcessed = body.totalProcessed || 0;
  } catch (e) {}

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch (e) {}
      };
      
      try {
        const client = await clientPromise;
        const db = client.db("next_local_db");
        const productsCollection = db.collection("products");
        
        sendUpdate({ 
          status: "starting", 
          message: startCursor ? `Resuming Sync from ${startProcessed} products...` : "Fetching Products...", 
          progress: 0
        });

        let totalToSync = 0;
        try {
          const countRes = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/count.json?status=active`, {
            headers: { "X-Shopify-Access-Token": ACCESS_TOKEN }
          });
          if (countRes.ok) {
            const countData = await countRes.json();
            totalToSync = countData.count || 0;
          }
        } catch (e) { console.error("Count fetch failed", e); }

        let hasNextPage = true;
        let cursor = startCursor;
        let totalProcessed = startProcessed;

        while (hasNextPage) {
          const query = `
            query getProducts($cursor: String) {
              products(first: 4, after: $cursor, query: "status:active") {
                pageInfo { hasNextPage endCursor }
                edges {
                  node {
                    id title handle descriptionHtml vendor productType status tags createdAt publishedAt
                    seo { title description }
                    featuredImage { url }
                    collections(first: 100) { edges { node { handle } } }
                    shop_for: metafield(namespace: "custom", key: "shop_for") { value }
                    weight: metafield(namespace: "custom", key: "weight") { value }
                    carat_range: metafield(namespace: "custom", key: "carat_range") { value }
                    material_type: metafield(namespace: "ornaverse", key: "material_type") { value }
                    components: metafield(namespace: "ornaverse", key: "components") { value }
                    finishing: metafield(namespace: "custom", key: "finishing") { value }
                    fit: metafield(namespace: "custom", key: "fit") { value }
                    matching_products: metafield(namespace: "custom", key: "matching_product") { value }
                    complementary_products: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") { value }
                    lead_time: metafield(namespace: "custom", key: "lead_time") { value }
                    variants(first: 250) {
                      edges {
                        node {
                          id price compareAtPrice inventoryQuantity sku selectedOptions { name value }
                          image { url }
                          components: metafield(namespace: "ornaverse", key: "components") { value }
                          inventoryItem {
                            inventoryLevels(first: 15) {
                              edges {
                                node {
                                  location { id name }
                                  quantities(names: ["available"]) { name quantity }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    media(first: 12) {
                      edges {
                        node {
                          mediaContentType
                          alt
                          ... on MediaImage { image { url altText } }
                          ... on Video { sources { url format mimeType } preview { image { url } } }
                          ... on ExternalVideo { embeddedUrl preview { image { url } } }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

          const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ACCESS_TOKEN },
            body: JSON.stringify({ query, variables: { cursor } }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify API responded with status ${response.status}.`);
          }

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Shopify returned an invalid response. Please retry.");
          }

          const result = await response.json();
          if (result.errors) {
            console.error("Shopify GraphQL Errors:", result.errors);
            throw new Error(result.errors[0]?.message || "Shopify GraphQL error");
          }

          const products = result.data?.products?.edges || [];

          if (products.length > 0) {
            for (const edge of products) {
              const p = edge.node;
              const media = p.media.edges.map(({ node: m }) => {
                const type = m.mediaContentType;
                let url = type === "IMAGE" ? m.image?.url : (type === "VIDEO" ? m.sources?.[0]?.url : m.embeddedUrl);
                return { type, url, preview: m.preview?.image?.url || "", alt: m.alt || "", sources: m.sources || [] };
              });

              const variants = p.variants.edges.map(({ node: v }) => {
                const options = {};
                v.selectedOptions.forEach(o => { options[o.name.toLowerCase()] = o.value; });

                const inventoryLevels = v.inventoryItem?.inventoryLevels?.edges?.map(({ node: inv }) => {
                    const availableQty = inv.quantities?.find(q => q.name === "available")?.quantity || 0;
                    return {
                        locationId: inv.location.id,
                        locationName: inv.location.name,
                        available: availableQty
                    };
                }) || [];

                const inStoreAvailable = inventoryLevels
                  .filter(inv => inv.available > 0)
                  .map(inv => inv.locationId);

                return {
                  id: v.id.split("/").pop(),
                  sku: v.sku || "",
                  size: options.size || null,
                  color: options.color || v.color || null,
                  price: Number(v.price),
                  compare_price: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                  inStock: v.inventoryQuantity > 0,
                  image: v.image?.url || p.featuredImage?.url,
                  inventoryLevels,
                  metafields: {
                    components: v.components?.value,
                    in_store_available: inStoreAvailable
                  }
                };
              });

              const existingProduct = await productsCollection.findOne({ shopifyId: p.id });
              const existingVariants = existingProduct?.variants || [];

              const finalVariants = variants.map(newV => {
                const existingV = existingVariants.find(ev => ev.id === newV.id);
                if (existingV) {
                  // Deep merge metafields to protect gemstones, diamonds, etc.
                  return { 
                    ...existingV, 
                    ...newV,
                    metafields: {
                      ...(existingV.metafields || {}),
                      ...(newV.metafields || {})
                    }
                  };
                }
                return newV;
              });

              let reviewsData = { count: 0, average: 0, list: [], stats: [] };
              try {
                reviewsData = await fetchNectorReviews(p.id);
                if (reviewsData.list && reviewsData.list.length > 0) {
                  const reviewsCollection = db.collection("reviews");
                  const productIdSimple = p.id.split("/").pop();
                  const reviewOps = reviewsData.list.map(review => ({
                    updateOne: {
                      filter: { id: review.id },
                      update: { $set: { ...review, productId: productIdSimple, productHandle: p.handle, productTitle: p.title, productImage: p.featuredImage?.url || "" } },
                      upsert: true
                    }
                  }));
                  if (reviewOps.length > 0) await reviewsCollection.bulkWrite(reviewOps);
                }
              } catch (reviewErr) {}

              const matchingProductIds = p.matching_products?.value ? JSON.parse(p.matching_products.value).map(gid => gid.split("/").pop()) : [];
              const complementaryProductIds = p.complementary_products?.value ? JSON.parse(p.complementary_products.value).map(gid => gid.split("/").pop()) : [];

              const inStockVariants = finalVariants.filter(v => v.inStock === true || v.inStock === "true");
              const isRing = String(p.productType || "").toLowerCase().includes("ring");
              
              let representativeVariant = null;
              if (inStockVariants.length > 0) {
                if (isRing) representativeVariant = inStockVariants.find(v => String(v.color || v.title).includes("Yellow Gold"));
                if (!representativeVariant) representativeVariant = inStockVariants[0];
              } else {
                representativeVariant = finalVariants[0];
              }

              const mappedProduct = {
                shopifyId: p.id,
                title: p.title,
                handle: p.handle,
                description: p.descriptionHtml,
                vendor: p.vendor,
                type: p.productType,
                status: p.status,
                isPublished: !!p.publishedAt,
                tags: p.tags,
                createdAt: p.createdAt,
                publishedAt: p.publishedAt,
                image: representativeVariant?.image || p.featuredImage?.url || (media.find(m => m.type === "IMAGE")?.url || null),
                images: media.filter(m => m.type === "IMAGE").map(m => ({ url: m.url, alt: m.alt })),
                media: media,
                price: representativeVariant?.price || 0,
                compare_price: representativeVariant?.compare_price || null,
                selectedColor: representativeVariant?.color,
                colors: [...new Set(finalVariants.map(v => v.color).filter(Boolean))],
                variants: finalVariants,
                diamondDiscount: representativeVariant?.price_breakup?.diamond?.discount_percent || 0,
                makingDiscount: representativeVariant?.price_breakup?.making_charges?.discount_percent || 0,
                seo: { title: p.seo?.title || p.title, description: p.seo?.description || p.descriptionHtml?.replace(/<[^>]*>?/gm, '').slice(0, 160) },
                reviewStats: { count: reviewsData.count || 0, average: reviewsData.average || 0, stats: reviewsData.stats || [] },
                collectionHandles: p.collections.edges.map(e => e.node.handle),
                matchingProductIds,
                complementaryProductIds,
                productMetafields: {
                  shop_for: p.shop_for?.value, weight: p.weight?.value, carat_range: p.carat_range?.value,
                  material_type: p.material_type?.value, components: p.components?.value, finishing: p.finishing?.value,
                  fit: p.fit?.value, lead_time: p.lead_time?.value
                },
                lastUpdated: new Date(),
                lastReviewsUpdated: new Date()
              };

              await productsCollection.updateOne({ shopifyId: p.id }, { $set: mappedProduct }, { upsert: true });
            }

            totalProcessed += products.length;
            cursor = result.data?.products?.pageInfo?.endCursor;
            
            sendUpdate({ 
              status: "progress", 
              message: `Synced ${totalProcessed} products...`, 
              progress: totalToSync ? Math.min(Math.round((totalProcessed / totalToSync) * 100), 99) : 50,
              cursor: cursor,
              totalProcessed: totalProcessed
            });
          }
          hasNextPage = result.data?.products?.pageInfo?.hasNextPage;
          if (hasNextPage) await sleep(2000);
        }

        // 4. Tag Bestsellers
        sendUpdate({ status: "progress", message: "Updating Bestseller tags...", progress: 99 });
        try {
          const storefrontRes = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: `{ products(first: 50, sortKey: BEST_SELLING) { edges { node { id } } } }`
            }),
          });
          const sfData = await storefrontRes.json();
          const bsIds = sfData.data?.products?.edges?.map(e => e.node.id) || [];
          if (bsIds.length > 0) {
            await productsCollection.updateMany(
              { shopifyId: { $in: bsIds } },
              { $addToSet: { tags: "best seller" } }
            );
          }
        } catch (bsErr) {
          console.error("Bestseller tagging failed", bsErr);
        }

        sendUpdate({ status: "complete", message: `Sync Complete!`, count: totalProcessed, progress: 100 });
        controller.close();
      } catch (error) {
        console.error("Critical Sync Error:", error);
        sendUpdate({ status: "error", message: `Sync Stopped: ${error.message}` });
        controller.close();
      }
    }
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
}
