import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";
import clientPromise from "@/lib/mongodb";

const SORT_MAP = {
  best_selling: { sortKey: "BEST_SELLING", reverse: false },
  price_low_high: { sortKey: "PRICE", reverse: false },
  price_high_low: { sortKey: "PRICE", reverse: true },
  az: { sortKey: "TITLE", reverse: false },
};

const parseFilters = (rawFilters) => {
  if (!rawFilters) return [];
  try {
    const parsed =
      typeof rawFilters === "string" ? JSON.parse(rawFilters) : rawFilters;

    const shopifyFilters = [];
    Object.values(parsed).forEach((group) => {
      if (!Array.isArray(group)) return;
      group.forEach((opt) => {
        if (!opt?.input) return;
        shopifyFilters.push(
          typeof opt.input === "string" ? JSON.parse(opt.input) : opt.input
        );
      });
    });

    return shopifyFilters;
  } catch {
    return [];
  }
};

const collectionCountCache = new Map();

const getCollectionTotalCount = async (handle) => {
  const cacheKey = `collection-count:${handle}`;
  if (collectionCountCache.has(cacheKey)) {
    return collectionCountCache.get(cacheKey);
  }

  const query = `
    query CollectionProductCount($query: String!) {
      collections(first: 1, query: $query) {
        edges {
          node {
            productsCount { count }
          }
        }
      }
    }
  `;

  const data = await shopifyAdminFetch(query, {
    query: `handle:${handle}`,
  });

  const count =
    data?.collections?.edges?.[0]?.node?.productsCount?.count ?? 0;

  collectionCountCache.set(cacheKey, count);
  setTimeout(() => collectionCountCache.delete(cacheKey), 10 * 60 * 1000);

  return count;
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");
    const sort = searchParams.get("sort") || "best_selling";
    const cursor = searchParams.get("cursor");
    const limit = Number(searchParams.get("limit")) || 20;
    const filters = searchParams.get("filters");

    if (!handle) {
      return NextResponse.json({
        products: [],
        filters: {},
        pageInfo: {},
        totalProducts: 0,
      });
    }

    const activeFilters = parseFilters(filters);
    const sortConfig = SORT_MAP[sort] || SORT_MAP.best_selling;

    // 1. Fetch Shop-wide pricing data (Admin API)
    // let metalRates = {};
    // let stonePricingDB = [];
    // try {
    //   const shopPricingQuery = `
    //     query {
    //       shop {
    //         metalPrices: metafield(namespace: "DI-GoldPrice", key: "metal_prices") { value }
    //         stonePricing: metafield(namespace: "DI-GoldPrice", key: "stone_pricing") { value }
    //       }
    //     }
    //   `;
    //   const shopData = await shopifyAdminFetch(shopPricingQuery);
    //   if (shopData?.shop?.metalPrices?.value) metalRates = JSON.parse(shopData.shop.metalPrices.value);
    //   if (shopData?.shop?.stonePricing?.value) stonePricingDB = JSON.parse(shopData.shop.stonePricing.value);
    // } catch (e) {
    //   console.warn("⚠️ Shop pricing metadata fetch failed:", e.message);
    // }

    // 2. Fetch Collection (Storefront API)
    const COLLECTION_QUERY = `
      query CollectionProducts(
        $handle: String!
        $first: Int!
        $after: String
        $sortKey: ProductCollectionSortKeys
        $reverse: Boolean
        $filters: [ProductFilter!]
      ) {
        collectionByHandle(handle: $handle) {
          title
          description
          seo { title description }
          image {
            url
            altText
          }
          products(
            first: $first
            after: $after
            sortKey: $sortKey
            reverse: $reverse
            filters: $filters
          ) {
            pageInfo { hasNextPage endCursor }
            filters {
              label
              type
              values { label count input }
            }
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
                      ... on MediaImage {
                        image {
                          url
                          altText
                        }
                      }
                      ... on Video {
                        sources {
                          url
                          mimeType
                        }
                      }
                    }
                  }
                }
                variants(first: 200) {
                  edges {
                    node {
                      id
                      price { amount }
                      compareAtPrice { amount }
                      availableForSale
                      quantityAvailable
                      selectedOptions { name value }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const ALL_PRODUCTS_QUERY = `
      query AllProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          pageInfo { hasNextPage endCursor }
          filters { label type values { label count input } }
          edges {
            node {
              id title handle description descriptionHtml createdAt tags featuredImage { url }
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
                    id price { amount } compareAtPrice { amount }
                    availableForSale quantityAvailable selectedOptions { name value }
                    image { url altText }
                  }
                }
              }
            }
          }
        }
      }
    `;

    let storefrontData;
    if (handle === "all") {
      storefrontData = await shopifyStorefrontFetch(ALL_PRODUCTS_QUERY, {
        first: limit,
        after: cursor || null,
        sortKey: sortConfig.sortKey === "BEST_SELLING" ? "BEST_SELLING" : sortConfig.sortKey === "PRICE" ? "PRICE" : "TITLE",
        reverse: sortConfig.reverse,
        filters: activeFilters,
      });
    } else {
      storefrontData = await shopifyStorefrontFetch(COLLECTION_QUERY, {
        handle,
        first: limit,
        after: cursor || null,
        sortKey: sortConfig.sortKey,
        reverse: sortConfig.reverse,
        filters: activeFilters,
      });
    }

    const collectionData = storefrontData?.collectionByHandle;
    const productsData = handle === "all" ? storefrontData?.products : collectionData?.products;

    if (!productsData) {
      return NextResponse.json({ 
        collection: handle === "all" ? { title: "All Products", description: "All of our products" } : (collectionData || {}), 
        products: [], filters: {}, pageInfo: {}, totalProducts: 0 
      });
    }

    // 3. Fetch Cached Pricing Data from MongoDB
    const client = await clientPromise;
    const db = client.db("next_local_db");

    const pricingCollection = db.collection("variant_pricing");

    const variantIds = [];

    productsData.edges.forEach(({ node }) => {
      node.variants.edges.forEach(({ node: v }) => {
        variantIds.push(v.id.split("/").pop());
      });
    });

    const pricingDocs = await pricingCollection
      .find(
        {
          variantId: { $in: variantIds }
        },
        {
          projection: {
            variantId: 1,
            price_breakup: 1,
            raw_breakup: 1,
          }
        }
      )
      .toArray();

    const pricingMap = {};

    pricingDocs.forEach(doc => {
      pricingMap[doc.variantId] = doc;
    });

    // 3. Fetch Variant Metafields in Bulk (Admin API)
    // const variantGids = [];
    // productsData.edges.forEach(({ node }) => {
    //   node.variants.edges.forEach(({ node: v }) => variantGids.push(v.id));
    // });

    // const variantConfigs = {};
    // if (variantGids.length > 0) {
    //   try {
    //     const variantQuery = `
    //       query getVariants($ids: [ID!]!) {
    //         nodes(ids: $ids) {
    //           ... on ProductVariant {
    //             id
    //             metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
    //           }
    //         }
    //       }
    //     `;
        
    //     // Ensure unique IDs and Chunk to avoid Shopify limit of 250
    //     const uniqueGids = [...new Set(variantGids)];
    //     const CHUNK_SIZE = 100;
    //     for (let i = 0; i < uniqueGids.length; i += CHUNK_SIZE) {
    //       const chunk = uniqueGids.slice(i, i + CHUNK_SIZE);
    //       const adminData = await shopifyAdminFetch(variantQuery, { ids: chunk });
    //       adminData?.nodes?.forEach(node => {
    //         if (node?.metafield?.value) {
    //           variantConfigs[node.id] = node.metafield.value;
    //         }
    //       });
    //     }
    //   } catch (e) {
    //     console.warn("⚠️ Bulk variant metadata fetch failed:", e.message);
    //   }
    // }

    // 4. Process Products & Calculate Metadata
    const products = await Promise.all(
      productsData.edges.map(async ({ node }) => {
        const variants = node.variants.edges.map(({ node: v }) => {
          const options = {};
          v.selectedOptions.forEach((o) => {
            options[o.name.toLowerCase()] = o.value;
          });
          
          // A. Read Cached Pricing Data from MongoDB
          let dynamic = {};

          const variantId = v.id.split("/").pop();

          const pricingData = pricingMap[variantId];

          if (pricingData?.raw_breakup) {
            const breakup = pricingData.raw_breakup;

            dynamic = {
              carat: breakup?.diamond?.carat,
              clarity: breakup?.diamond?.clarity,
              color: breakup?.diamond?.color,
              weight: breakup?.metal?.weight,
            };
          }

          // B. Robust Option Fallbacks
          const getOpt = (keys) => {
            for (const key of keys) {
              const lowerKey = key.toLowerCase();
              if (options[lowerKey] !== undefined && options[lowerKey] !== null) return options[lowerKey];
            }
            return null;
          };

          const carat = dynamic.carat ?? getOpt(["carat", "carat weight", "diamond weight", "center stone weight"]);
          const clarity = dynamic.clarity ?? getOpt(["clarity", "diamond clarity", "clarity grade"]);
          const diamond_color = dynamic.color ?? getOpt(["diamond color", "color grade", "stone color"]);
          const weight = dynamic.weight ?? getOpt(["weight", "gold weight", "metal weight", "net weight"]);
          const metal_color = getOpt(["color", "metal", "metal color", "material color"]);

          return {
            id: v.id.split("/").pop(),
            size: options.size || null,
            color: metal_color,
            carat,
            clarity,
            diamond_color,
            weight,
            price: Number(v.price.amount),
            compare_price: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
            inStock: v.availableForSale === true && Number(v.quantityAvailable || 0) > 0,
            image: v.image?.url || null,
            altText: v.image?.altText || "",
          };
        });

        let selectedVariant = variants.find((v) => v.inStock) || variants[0];

        const images = [];
        let hasVideo = false;

        node.media?.edges?.forEach(({ node: m }) => {
          if (m.mediaContentType === "IMAGE") {
            images.push({
              url: m.image.url,
              altText: m.image.altText || "",
            });
          } else if (m.mediaContentType === "VIDEO") {
            hasVideo = true;
          }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isNew = new Date(node.createdAt) > thirtyDaysAgo;

        const labelTag = node.tags?.find(tag => 
          ["best seller", "hot", "trending", "limited"].includes(tag.toLowerCase())
        );

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          handle: node.handle,
          description: node.description,
          descriptionHtml: node.descriptionHtml,
          video: hasVideo,
          isNew: isNew,
          label: labelTag || (isNew ? "New" : null),
          images,
          price: selectedVariant.price,
          compare_price: selectedVariant.compare_price,
          selectedColor: selectedVariant.color,
          carat: selectedVariant.carat,
          clarity: selectedVariant.clarity,
          diamond_color: selectedVariant.diamond_color,
          weight: selectedVariant.weight,
          colors: [...new Set(variants.map((v) => v.color).filter(Boolean))],
          image: selectedVariant.image || node.featuredImage?.url,
          altText: selectedVariant.altText || "",
          variants,
        };
      })
    );

    // 5. Fetch Review Stats from MongoDB in Bulk
    try {
      const client = await clientPromise;
      const db = client.db("next_local_db");
      const productsCollection = db.collection("products");

      const productHandles = products.map(p => p.handle);
      const dbProducts = await productsCollection.find(
        { handle: { $in: productHandles } },
        { projection: { handle: 1, reviewStats: 1 } }
      ).toArray();

      const reviewStatsMap = {};
      dbProducts.forEach(dbp => {
        if (dbp.reviewStats) {
          reviewStatsMap[dbp.handle] = dbp.reviewStats;
        }
      });

      products.forEach(p => {
        p.reviewStats = reviewStatsMap[p.handle] || { count: 0, average: 0 };
      });
    } catch (e) {
      console.warn("⚠️ Bulk review stats fetch failed:", e.message);
    }

    const processedFilters = {};
    productsData.filters.forEach((f) => {
      if (f.type === "PRICE_RANGE") return;
      processedFilters[f.label] = f.values.map((v) => ({
        label: v.label,
        count: v.count,
        input: v.input,
      }));
    });

    let totalProducts = await getCollectionTotalCount(handle);
    
    // If filters are applied, find the total count from the Shopify returned filter values.
    if (activeFilters.length > 0 && productsData.filters) {
      try {
        const parsedFilters = filters ? JSON.parse(filters) : {};
        let maxFilteredTotal = 0;
        let anyGroupFound = false;

        // Try to find the total by looking at all filter groups.
        // For groups with no selections, the sum of all value counts is the total filtered set.
        // For groups with selections, the sum of selected value counts is the total.
        // We take the MAX across all groups to be as accurate as possible.
        for (const f of productsData.filters) {
          if (f.type === "PRICE_RANGE") continue;
          
          const selectedForGroup = parsedFilters[f.label] || [];
          let groupTotal = 0;

          if (selectedForGroup.length === 0) {
            groupTotal = f.values.reduce((sum, v) => sum + v.count, 0);
          } else {
            const selectedLabels = new Set(selectedForGroup.map(o => o.label));
            groupTotal = f.values
              .filter(v => selectedLabels.has(v.label))
              .reduce((sum, v) => sum + v.count, 0);
          }

          if (groupTotal > maxFilteredTotal) {
            maxFilteredTotal = groupTotal;
            anyGroupFound = true;
          }
        }

        if (anyGroupFound) {
          // Ensure totalProducts is at least the number of products returned in this response
          totalProducts = Math.max(maxFilteredTotal, products.length);
        }
      } catch (e) {
        console.warn("Failed to calculate filtered total:", e);
      }
    }

    return NextResponse.json(
      {
        collection: {
          title: collectionData?.title,
          description: collectionData?.description,
          seo: collectionData?.seo,
          image: collectionData?.image,
        },
        products,
        filters: processedFilters,
        pageInfo: productsData.pageInfo,
        totalProducts,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=3600",
        },
      }
  );
  } catch (err) {
    console.error("❌ Collection API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
