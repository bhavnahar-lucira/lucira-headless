import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { shopifyStorefrontFetch, shopifyAdminFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "All";

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");

    // 1. Build Query
    let query = { status: "ACTIVE", isPublished: true };
    
    if (tab === "All") {
      query.tags = { $regex: /best seller/i };
    } else {
      // 1. Specific bestseller collection handle
      const handle = `bestseller-${tab.toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-$/, "")
        .replace(/^-/, "")}`;
      
      // 2. Fallback search (Tag: 'best seller' AND category name in tags/type)
      const categoryTerm = tab.toLowerCase().replace(/s$/, ""); // e.g. "Rings" -> "ring"
      
      const categoryFilter = {
        $or: [
          { collectionHandles: handle },
          {
            $and: [
              { tags: { $regex: /best seller/i } },
              {
                $or: [
                  { type: { $regex: new RegExp(categoryTerm, "i") } },
                  { tags: { $regex: new RegExp(categoryTerm, "i") } }
                ]
              }
            ]
          }
        ]
      };
      query = { ...query, ...categoryFilter };
    }

    // 2. Try to find in MongoDB
    let products = await productsCollection
      .find(query)
      .limit(20)
      .toArray();

    if (products.length > 0) {
      return NextResponse.json({ 
        products: products.map(p => ({
          ...p,
          reviews: p.reviews || p.reviewStats || null
        }))
      });
    }

    // 3. Fallback: If "All" is empty, sync from Shopify
    if (tab === "All") {
      console.log("No bestsellers found in DB, syncing from Shopify...");
      
      const BEST_SELLING_QUERY = `
        query BestSellingProducts {
          products(first: 20, sortKey: BEST_SELLING) {
            edges {
              node {
                id
                title
                handle
                description
                descriptionHtml
                createdAt
                tags
                featuredImage { url }
                media(first: 20) {
                  edges {
                    node {
                      mediaContentType
                      ... on MediaImage { image { url altText } }
                      ... on Video { sources { url mimeType } }
                    }
                  }
                }
                variants(first: 50) {
                  edges {
                    node {
                      id
                      price { amount }
                      compareAtPrice { amount }
                      availableForSale
                      quantityAvailable
                      selectedOptions { name value }
                      image { url altText }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const storefrontData = await shopifyStorefrontFetch(BEST_SELLING_QUERY);
      const shopifyProducts = storefrontData?.products?.edges || [];

      if (shopifyProducts.length === 0) {
        return NextResponse.json({ products: [] });
      }

      let metalRates = {};
      let stonePricingDB = [];
      try {
        const shopPricingQuery = `
          query {
            shop {
              metalPrices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") { value }
              stonePricing: metafield(namespace: "DI-GoldPrice", key: "stone_pricing") { value }
            }
          }
        `;
        const shopData = await shopifyAdminFetch(shopPricingQuery);
        if (shopData?.shop?.metalPrices?.value) metalRates = JSON.parse(shopData.shop.metalPrices.value);
        if (shopData?.shop?.stonePricing?.value) stonePricingDB = JSON.parse(shopData.shop.stonePricing.value);
      } catch (e) {
        console.warn("⚠️ Shop pricing metadata fetch failed:", e.message);
      }

      const variantGids = [];
      shopifyProducts.forEach(({ node }) => {
        node.variants.edges.forEach(({ node: v }) => variantGids.push(v.id));
      });

      const variantConfigs = {};
      if (variantGids.length > 0) {
        const CHUNK_SIZE = 250;
        for (let i = 0; i < variantGids.length; i += CHUNK_SIZE) {
          const chunk = variantGids.slice(i, i + CHUNK_SIZE);
          const variantQuery = `
            query getVariants($ids: [ID!]!) {
              nodes(ids: $ids) {
                ... on ProductVariant {
                  id
                  metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
                }
              }
            }
          `;
          const adminData = await shopifyAdminFetch(variantQuery, { ids: chunk });
          adminData?.nodes?.forEach(node => {
            if (node?.metafield?.value) {
              variantConfigs[node.id] = node.metafield.value;
            }
          });
        }
      }

      const mappedProducts = await Promise.all(
        shopifyProducts.map(async ({ node }) => {
          const variants = node.variants.edges.map(({ node: v }) => {
            const options = {};
            v.selectedOptions.forEach((o) => {
              options[o.name.toLowerCase()] = o.value;
            });

            let dynamic = {};
            const configValue = variantConfigs[v.id];
            if (configValue) {
              try {
                const config = JSON.parse(configValue);
                const breakup = calculatePriceBreakup(config, metalRates, stonePricingDB);
                dynamic = {
                  carat: breakup.diamond.carat,
                  clarity: breakup.diamond.clarity,
                  color: breakup.diamond.color,
                  weight: breakup.metal.weight,
                };
              } catch (e) {}
            }

            const getOpt = (keys) => {
              for (const key of keys) {
                const lowerKey = key.toLowerCase();
                if (options[lowerKey] !== undefined && options[lowerKey] !== null) return options[lowerKey];
              }
              return null;
            };

            return {
              id: v.id.split("/").pop(),
              size: options.size || null,
              color: getOpt(["color", "metal", "metal color", "material color"]),
              carat: dynamic.carat ?? getOpt(["carat", "carat weight", "diamond weight", "center stone weight"]),
              clarity: dynamic.clarity ?? getOpt(["clarity", "diamond clarity", "clarity grade"]),
              diamond_color: dynamic.color ?? getOpt(["diamond color", "color grade", "stone color"]),
              weight: dynamic.weight ?? getOpt(["weight", "gold weight", "metal weight", "net weight"]),
              price: Number(v.price.amount),
              compare_price: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
              inStock: v.availableForSale === true && Number(v.quantityAvailable || 0) > 0,
              image: v.image?.url || null,
              altText: v.image?.altText || "",
            };
          });

          let selectedVariant = variants.find((v) => v.inStock) || variants[0];

          const images = node.media?.edges
            ?.filter(({ node: m }) => m.mediaContentType === "IMAGE")
            .map(({ node: m }) => ({
              url: m.image.url,
              altText: m.image.altText || "",
            })) || [];

          const mappedProduct = {
            shopifyId: node.id,
            title: node.title,
            handle: node.handle,
            description: node.description,
            descriptionHtml: node.descriptionHtml,
            createdAt: node.createdAt,
            publishedAt: node.publishedAt || new Date().toISOString(), // Best selling from storefront are usually published
            status: "ACTIVE",
            isPublished: true,
            tags: node.tags.includes("best seller") ? node.tags : [...node.tags, "best seller"],
            image: selectedVariant.image || node.featuredImage?.url,
            images,
            price: selectedVariant.price,
            compare_price: selectedVariant.compare_price,
            selectedColor: selectedVariant.color,
            colors: [...new Set(variants.map((v) => v.color).filter(Boolean))],
            variants: variants,
            lastUpdated: new Date()
          };

          await productsCollection.updateOne(
            { shopifyId: node.id },
            { $set: mappedProduct },
            { upsert: true }
          );

          return mappedProduct;
        })
      );

      return NextResponse.json({ products: mappedProducts });
    }

    return NextResponse.json({ products: [] });

  } catch (error) {
    console.error("Bestsellers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch bestsellers", message: error.message }, { status: 500 });
  }
}
