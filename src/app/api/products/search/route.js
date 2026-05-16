import { NextResponse } from "next/server";
import { shopifyStorefrontFetch, shopifyAdminFetch } from "@/lib/shopify";
import { calculatePriceBreakup } from "@/lib/priceEngine";
import { fetchNectorReviews } from "@/lib/nector";
import clientPromise from "@/lib/mongodb";

const SORT_MAP = {
  featured: { sortKey: "RELEVANCE", reverse: false },
  relevance: { sortKey: "RELEVANCE", reverse: false },
  best_selling: { sortKey: "BEST_SELLING", reverse: false },
  az: { sortKey: "TITLE", reverse: false },
  za: { sortKey: "TITLE", reverse: true },
  price_low_high: { sortKey: "PRICE", reverse: false },
  price_high_low: { sortKey: "PRICE", reverse: true },
  date_new_old: { sortKey: "CREATED_AT", reverse: true },
  date_old_new: { sortKey: "CREATED_AT", reverse: false },
};

const parseFilters = (rawFilters) => {
  if (!rawFilters) return [];
  try {
    const parsed = typeof rawFilters === "string" ? JSON.parse(rawFilters) : rawFilters;
    if (Array.isArray(parsed)) return parsed;
    const shopifyFilters = [];
    Object.values(parsed).forEach((group) => {
      if (!Array.isArray(group)) return;
      group.forEach((opt) => {
        if (!opt?.input) return;
        shopifyFilters.push(typeof opt.input === "string" ? JSON.parse(opt.input) : opt.input);
      });
    });
    return shopifyFilters;
  } catch {
    return [];
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle") || "all";
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");
    const sort = searchParams.get("sort") || "featured";
    const filtersRaw = searchParams.get("filters");

    const activeFilters = parseFilters(filtersRaw);
    const sortConfig = SORT_MAP[sort] || SORT_MAP.featured;

    // Extract dynamic filters from searchParams for Shopify
    const shopifyFilters = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("filter.")) {
        try {
          if (key === "filter.v.price.gte" || key === "filter.v.price.lte") {
            const existingPrice = shopifyFilters.find(f => f.price);
            if (existingPrice) {
              if (key === "filter.v.price.gte") existingPrice.price.min = parseFloat(value);
              else existingPrice.price.max = parseFloat(value);
            } else {
              shopifyFilters.push({ price: { 
                min: key === "filter.v.price.gte" ? parseFloat(value) : 0,
                max: key === "filter.v.price.lte" ? parseFloat(value) : 1000000 
              }});
            }
          } else {
            try {
                shopifyFilters.push(JSON.parse(value));
            } catch(e) {
                shopifyFilters.push({ [key.replace("filter.", "")]: value });
            }
          }
        } catch (e) {}
      }
    });

    const finalFilters = shopifyFilters.length > 0 ? shopifyFilters : activeFilters;

    // 1. Fetch Shop-wide pricing data (Admin API)
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

    const COLLECTION_QUERY = `
      query SearchProducts(
        $handle: String!
        $first: Int!
        $after: String
        $sortKey: ProductCollectionSortKeys
        $reverse: Boolean
        $filters: [ProductFilter!]
      ) {
        collectionByHandle(handle: $handle) {
          products(
            first: $first
            after: $after
            sortKey: $sortKey
            reverse: $reverse
            filters: $filters
          ) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id title handle description descriptionHtml createdAt tags
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
                      id sku price { amount } compareAtPrice { amount }
                      availableForSale quantityAvailable selectedOptions { name value }
                      image { url altText }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const SEARCH_QUERY = `
      query KeywordSearch($query: String!, $first: Int!, $after: String) {
        products(query: $query, first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id title handle description descriptionHtml createdAt tags
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
                    id sku price { amount } compareAtPrice { amount }
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

    let productsData;
    if (query && (handle === "all" || !handle)) {
      const storefrontData = await shopifyStorefrontFetch(SEARCH_QUERY, {
        query,
        first: limit,
        after: cursor || null
      });
      productsData = storefrontData?.products;
    } else {
      const storefrontData = await shopifyStorefrontFetch(COLLECTION_QUERY, {
        handle: handle,
        first: limit,
        after: cursor || null,
        sortKey: sortConfig.sortKey === "RELEVANCE" ? "BEST_SELLING" : sortConfig.sortKey,
        reverse: sortConfig.reverse,
        filters: finalFilters,
      });
      productsData = storefrontData?.collectionByHandle?.products;
    }

    if (!productsData) {
      return NextResponse.json({ products: [], pagination: { total: 0, hasNextPage: false } });
    }

    // 2. Fetch Variant Metafields in Bulk (Admin API)
    const variantGids = [];
    productsData.edges.forEach(({ node }) => {
      node.variants.edges.forEach(({ node: v }) => variantGids.push(v.id));
    });

    const variantConfigs = {};
    if (variantGids.length > 0) {
      try {
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
        const uniqueGids = [...new Set(variantGids)];
        const CHUNK_SIZE = 100;
        for (let i = 0; i < uniqueGids.length; i += CHUNK_SIZE) {
          const chunk = uniqueGids.slice(i, i + CHUNK_SIZE);
          const adminData = await shopifyAdminFetch(variantQuery, { ids: chunk });
          adminData?.nodes?.forEach(node => {
            if (node?.metafield?.value) {
              variantConfigs[node.id] = node.metafield.value;
            }
          });
        }
      } catch (e) {
        console.warn("⚠️ Bulk variant metadata fetch failed:", e.message);
      }
    }

    // 3. Process Products & Calculate Metadata
    let products = (await Promise.all(
      productsData.edges.map(async ({ node }) => {
        const variants = node.variants.edges.map(({ node: v }) => {
          const options = {};
          v.selectedOptions.forEach((o) => {
            options[o.name.toLowerCase()] = o.value;
          });

          let dynamic = {};
          let diamondDiscount = 0;
          let makingDiscount = 0;

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
                diamondCharges: breakup.diamond.final,
                components: configValue
              };
              diamondDiscount = breakup.diamond.discount_percent || 0;
              makingDiscount = breakup.making_charges.discount_percent || 0;
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
            shopifyId: v.id,
            sku: v.sku,
            size: options.size || null,
            color: getOpt(["color", "metal", "metal color", "material color"]),
            carat: dynamic.carat ?? getOpt(["carat", "carat weight"]),
            clarity: dynamic.clarity ?? getOpt(["clarity"]),
            diamond_color: dynamic.color ?? getOpt(["diamond color"]),
            weight: dynamic.weight ?? getOpt(["weight"]),
            price: Number(v.price.amount),
            compare_price: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
            inStock: v.availableForSale === true && Number(v.quantityAvailable || 0) > 0,
            image: v.image?.url || null,
            altText: v.image?.altText || "",
            metafields: {
                components: dynamic.components,
                metal_weight: dynamic.weight,
                metal_purity: getOpt(["metal purity", "purity"])
            },
            diamondDiscount,
            makingDiscount
          };
        });

        // 9KT Collection Filtering
        if (handle === "9kt-collection") {
            const has9kt = variants.some(v => String(v.color || v.metafields?.metal_purity || "").includes("9KT"));
            if (!has9kt) return null;
        }

        // Global In-Stock Filtering
        const hasInStock = variants.some(v => v.inStock);
        if (!hasInStock) return null;

        let selectedVariant = variants.find((v) => v.inStock) || variants[0];

        const images = [];
        let video = null;

        node.media?.edges?.forEach(({ node: m }) => {
          if (m.mediaContentType === "IMAGE") {
            images.push({
              url: m.image.url,
              alt: m.image.altText || "",
            });
          } else if (m.mediaContentType === "VIDEO") {
            video = {
                url: m.sources?.[0]?.url,
                mimeType: m.sources?.[0]?.mimeType,
                preview: node.featuredImage?.url,
                sources: m.sources
            };
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
          shopifyId: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          descriptionHtml: node.descriptionHtml,
          video,
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
          diamondDiscount: selectedVariant.diamondDiscount,
          makingDiscount: selectedVariant.makingDiscount,
          reviewStats: { count: 0, average: 0 }
        };
      })
    )).filter(Boolean);

    // 4. Fetch Review Stats from Nector in Parallel
    try {
      await Promise.all(
        products.map(async (p) => {
          try {
            const reviews = await fetchNectorReviews(p.shopifyId);
            p.reviewStats = {
              count: reviews.count || 0,
              average: reviews.average || 0
            };
          } catch (e) {
            p.reviewStats = { count: 0, average: 0 };
          }
        })
      );
    } catch (e) {
      console.warn("⚠️ Parallel review stats fetch failed:", e.message);
    }

    return NextResponse.json({
      products,
      pagination: {
        hasNextPage: productsData.pageInfo.hasNextPage,
        endCursor: productsData.pageInfo.endCursor,
        total: 0
      }
    });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
