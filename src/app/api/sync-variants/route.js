import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let skip = 0;
  try {
    const body = await req.json().catch(() => ({}));
    skip = body.skip || 0;
  } catch (e) {}

  const { searchParams } = new URL(req.url);
  const shopifyId = searchParams.get("shopifyId");

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE;
  const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch (e) {
          // Client likely disconnected or controller closed
        }
      };

      try {
        const client = await clientPromise;
        const db = client.db("next_local_db");
        const productsCollection = db.collection("products");

        // Fetch Shop-level Gold Rates for price calculation
        const shopQuery = `
          {
            shop {
              metal_prices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") { value }
              stone_pricing: metafield(namespace: "DI-GoldPrice", key: "stone_pricing") { value }
            }
          }
        `;
        const shopData = await shopifyAdminFetch(shopQuery);
        const metalRates = JSON.parse(shopData?.shop?.metal_prices?.value || "{}");
        const stonePricingDb = JSON.parse(shopData?.shop?.stone_pricing?.value || "[]");

        let productsToSync = [];
        if (shopifyId) {
          const product = await productsCollection.findOne({ shopifyId });
          if (product) productsToSync = [product];
        } else {
          productsToSync = await productsCollection.find({ status: "ACTIVE" }).toArray();
        }

        if (productsToSync.length === 0) {
          sendUpdate({ status: "complete", message: "No products found to sync variants." });
          controller.close();
          return;
        }

        sendUpdate({ 
          status: "starting", 
          message: skip > 0 ? `Resuming variant sync from ${skip}...` : `Syncing variants for ${productsToSync.length} products...`, 
          progress: skip > 0 ? Math.round((skip / productsToSync.length) * 100) : 0 
        });

        for (let i = skip; i < productsToSync.length; i++) {
          const p = productsToSync[i];
          sendUpdate({ 
            status: "progress", 
            message: `Fetching variants for ${p.title}...`, 
            progress: Math.round((i / productsToSync.length) * 100),
            skip: i
          });

          const variantQuery = `
            query getProductVariants($id: ID!) {
              product(id: $id) {
                variants(first: 250) {
                  edges {
                    node {
                      id title price compareAtPrice inventoryQuantity sku selectedOptions { name value }
                      image { url }
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
                      in_store: metafield(namespace: "custom", key: "in_store_available") { value }
                      ring_size: metafield(namespace: "custom", key: "ring_size_inventory") { value }
                      diamond_shape: metafield(namespace: "custom", key: "diamond_1_shape") { value }
                      metal_purity: metafield(namespace: "custom", key: "metal_purity") { value }
                      custom_metal_weight: metafield(namespace: "custom", key: "metal_weight") { value }
                      ornaverse_metal_weight: metafield(namespace: "ornaverse", key: "metal_weight") { value }
                      metal_color: metafield(namespace: "custom", key: "metal_color") { value }
                      custom_gross_weight: metafield(namespace: "custom", key: "gross_weight") { value }
                      ornaverse_gross_weight: metafield(namespace: "ornaverse", key: "gross_weight") { value }
                      top_height: metafield(namespace: "custom", key: "top_height") { value }
                      top_width: metafield(namespace: "custom", key: "top_width") { value }
                      ornaverse_components: metafield(namespace: "ornaverse", key: "components") { value }
                      d1_clarity: metafield(namespace: "custom", key: "diamond_1_clarity") { value }
                      d1_color: metafield(namespace: "custom", key: "diamond_1_color") { value }
                      d1_shape: metafield(namespace: "custom", key: "diamond_1_shape") { value }
                      d1_pcs: metafield(namespace: "custom", key: "diamond_1_numbers") { value }
                      d1_wt: metafield(namespace: "custom", key: "diamond_1_weight") { value }
                      d2_clarity: metafield(namespace: "custom", key: "diamond_2_clarity") { value }
                      d2_color: metafield(namespace: "custom", key: "diamond_2_color") { value }
                      d2_shape: metafield(namespace: "custom", key: "diamond_2_shape") { value }
                      d2_pcs: metafield(namespace: "custom", key: "diamond_2_numbers") { value }
                      d2_wt: metafield(namespace: "custom", key: "diamond_2_weight") { value }
                      d3_clarity: metafield(namespace: "custom", key: "diamond_3_clarity") { value }
                      d3_color: metafield(namespace: "custom", key: "diamond_3_color") { value }
                      d3_shape: metafield(namespace: "custom", key: "diamond_3_shape") { value }
                      d3_pcs: metafield(namespace: "custom", key: "diamond_3_numbers") { value }
                      d3_wt: metafield(namespace: "custom", key: "diamond_3_weight") { value }
                      d4_clarity: metafield(namespace: "custom", key: "diamond_4_clarity") { value }
                      d4_color: metafield(namespace: "custom", key: "diamond_4_color") { value }
                      d4_shape: metafield(namespace: "custom", key: "diamond_4_shape") { value }
                      d4_pcs: metafield(namespace: "custom", key: "diamond_4_numbers") { value }
                      d4_wt: metafield(namespace: "custom", key: "diamond_4_weight") { value }
                      gem1_color: metafield(namespace: "custom", key: "gemstone_1_color") { value }
                      gem1_shape: metafield(namespace: "custom", key: "gemstone_1_shape") { value }
                      gem1_pcs: metafield(namespace: "custom", key: "gemstone_1_numbers") { value }
                      gem1_wt: metafield(namespace: "custom", key: "gemstone_1_weight") { value }
                      gem2_color: metafield(namespace: "custom", key: "gemstone_2_color") { value }
                      gem2_shape: metafield(namespace: "custom", key: "gemstone_2_shape") { value }
                      gem2_pcs: metafield(namespace: "custom", key: "gemstone_2_numbers") { value }
                      gem2_wt: metafield(namespace: "custom", key: "gemstone_2_weight") { value }
                      gem3_color: metafield(namespace: "custom", key: "gemstone_3_color") { value }
                      gem3_shape: metafield(namespace: "custom", key: "gemstone_3_shape") { value }
                      gem3_pcs: metafield(namespace: "custom", key: "gemstone_3_numbers") { value }
                      gem3_wt: metafield(namespace: "custom", key: "gemstone_3_weight") { value }
                      gem4_color: metafield(namespace: "custom", key: "gemstone_4_color") { value }
                      gem4_shape: metafield(namespace: "custom", key: "gemstone_4_shape") { value }
                      gem4_pcs: metafield(namespace: "custom", key: "gemstone_4_numbers") { value }
                      gem4_wt: metafield(namespace: "custom", key: "gemstone_4_weight") { value }
                      variant_config: metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
                    }
                  }
                }
              }
            }
          `;

          const variantData = await shopifyAdminFetch(variantQuery, { id: p.shopifyId });
          const shopifyVariants = variantData?.product?.variants?.edges?.map(e => e.node) || [];

          // Fetch existing product to merge basic fields
          const existingProduct = await productsCollection.findOne({ shopifyId: p.shopifyId });
          const existingVariants = existingProduct?.variants || [];

          const variants = shopifyVariants.map((v) => {
            const config = v.variant_config?.value ? JSON.parse(v.variant_config.value) : null;
            let priceBreakup = null;
            if (config) {
              try {
                priceBreakup = calculatePriceBreakup(config, metalRates, stonePricingDb);
              } catch (e) {
                console.error(`Price breakup failed for variant ${v.id}:`, e.message);
              }
            }

            // A. Diamonds from ornaverse components (Preferred)
            const ornaverseComponents = v.ornaverse_components?.value ? JSON.parse(v.ornaverse_components.value).components : [];
            
            let diamonds = ornaverseComponents?.filter(s => s.item_group_name?.toLowerCase() === "diamond")?.map(s => ({
              pieces: s.pieces,
              weight: s.weight,
              quality: `${s.quality_code || ""}${s.stone_color_code ? `, ${s.stone_color_code}` : ""}`.trim().replace(/^,/, ""),
              shape: s.shape_code,
            })) || [];

            // B. Fallback to individual custom metafields if no JSON diamonds
            if (diamonds.length === 0) {
              [1, 2, 3, 4].forEach(i => {
                if (v[`d${i}_clarity`]?.value || v[`d${i}_wt`]?.value) {
                  diamonds.push({
                    quality: `${v[`d${i}_clarity`]?.value || ""}, ${v[`d${i}_color`]?.value || ""}`.trim().replace(/^, | ,$|^,|,$/g, ""),
                    shape: v[`d${i}_shape`]?.value || "Round",
                    pieces: v[`d${i}_pcs`]?.value || "1",
                    weight: v[`d${i}_wt`]?.value || "0"
                  });
                }
              });
            }

            // C. Gemstones from ornaverse components (Exclude metal/gold/silver/platinum/diamond)
            const excludeTypes = ["gold", "metal", "silver", "platinum", "diamond"];
            let gemstones = ornaverseComponents?.filter(s => 
              s.item_group_name && !excludeTypes.includes(s.item_group_name.toLowerCase())
            )?.map(s => ({
              pieces: s.pieces,
              weight: s.weight,
              color: s.stone_color_code,
              shape: s.shape_code,
            })) || [];

            // D. Fallback to individual custom metafields for gemstones
            if (gemstones.length === 0) {
              [1, 2, 3, 4].forEach(i => {
                if (v[`gem${i}_color`]?.value || v[`gem${i}_wt`]?.value) {
                  gemstones.push({
                    color: v[`gem${i}_color`]?.value || "",
                    shape: v[`gem${i}_shape`]?.value || "Round",
                    pieces: v[`gem${i}_pcs`]?.value || "1",
                    weight: v[`gem${i}_wt`]?.value || "0"
                  });
                }
              });
            }

            const variantId = v.id.split("/").pop();
            const existingV = existingVariants.find(ev => ev.id === variantId);

            const inventoryLevels = v.inventoryItem?.inventoryLevels?.edges?.map(({ node: inv }) => ({
              locationId: inv.location.id,
              locationName: inv.location.name,
              available: inv.quantities?.find(q => q.name === "available")?.quantity || 0
            })) || [];

            const inStoreAvailable = inventoryLevels
              .filter(inv => inv.available > 0)
              .map(inv => inv.locationId);

            return {
              id: variantId,
              title: v.title,
              sku: v.sku,
              price: parseFloat(v.price),
              compare_price: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
              inventory: v.inventoryQuantity,
              inStock: v.inventoryQuantity > 0,
              inventoryLevels,
              options: v.selectedOptions.reduce((acc, opt) => ({ ...acc, [opt.name.toLowerCase()]: opt.value }), {}),
              color: v.selectedOptions.find(o => o.name.toLowerCase().includes("color") || o.name.toLowerCase().includes("metal"))?.value,
              size: v.selectedOptions.find(o => o.name.toLowerCase().includes("size"))?.value,
              image: v.image?.url || p.image,
              price_breakup: priceBreakup || existingV?.price_breakup,
              metafields: {
                ...(existingV?.metafields || {}),
                in_store_available: inStoreAvailable,
                diamond_1_shape: v.diamond_shape?.value || v.d1_shape?.value,
                ring_size_inventory: v.ring_size?.value,
                metal_purity: v.metal_purity?.value || config?.purity,
                metal_weight: v.ornaverse_metal_weight?.value || v.custom_metal_weight?.value || config?.metal_weight,
                metal_color: v.metal_color?.value,
                gross_weight: v.ornaverse_gross_weight?.value || v.custom_gross_weight?.value,
                top_height: v.top_height?.value,
                top_width: v.top_width?.value,
                ornaverse_components: v.ornaverse_components?.value ? JSON.parse(v.ornaverse_components.value) : (existingV?.metafields?.ornaverse_components || null),
                diamonds: diamonds.length > 0 ? diamonds : (existingV?.metafields?.diamonds || null),
                gemstones: gemstones.length > 0 ? gemstones : (existingV?.metafields?.gemstones || null)
              }
            };
          });

          // Extract top-level discounts for the product document
          const inStockVariants = variants.filter(v => v.inStock);
          const isRing = String(p.type || p.title || "").toLowerCase().includes("ring");
          
          let representativeVariant = null;
          if (inStockVariants.length > 0) {
            if (isRing) {
              representativeVariant = inStockVariants.find(v => String(v.color || v.title).includes("Yellow Gold"));
            }
            if (!representativeVariant) representativeVariant = inStockVariants[0];
          } else {
            representativeVariant = variants[0];
          }

          const diamondDiscount = representativeVariant?.price_breakup?.diamond?.discount_percent || 0;
          const makingDiscount = representativeVariant?.price_breakup?.making_charges?.discount_percent || 0;

          await productsCollection.updateOne(
            { shopifyId: p.shopifyId },
            { 
              $set: { 
                variants: variants, 
                diamondDiscount,
                makingDiscount,
                lastUpdated: new Date() 
              } 
            }
          );

          // Small delay to prevent rate limiting
          if (i % 5 === 0) await new Promise(r => setTimeout(r, 500));
        }

        sendUpdate({ status: "complete", message: `Sync Complete for ${productsToSync.length} products!`, progress: 100 });
        controller.close();
      } catch (error) {
        console.error("Variant Sync Error:", error);
        sendUpdate({ status: "error", message: `Sync Failed: ${error.message}` });
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
}
