import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

const parseFilters = (rawFilters) => {
  if (!rawFilters) return [];
  try {
    const parsed = typeof rawFilters === "string" ? JSON.parse(rawFilters) : rawFilters;
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle") || "all";
    const filtersRaw = searchParams.get("filters");

    const activeFilters = parseFilters(filtersRaw);

    // Storefront API: filters are available on Collection.products
    const COLLECTION_QUERY = `
      query GetCollectionFilters($handle: String!, $filters: [ProductFilter!]) {
        collection(handle: $handle) {
          products(first: 250, filters: $filters) {
            filters {
              label
              type
              values {
                label
                count
                input
              }
            }
          }
        }
      }
    `;

    // Extract dynamic filters from searchParams to pass to Shopify
    const shopifyFilters = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("filter.")) {
        try {
          // Handle price range specially
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
              shopifyFilters.push(JSON.parse(value));
          }
        } catch (e) {
          // If not JSON, it might be a standard string value from URL
          const label = key.replace("filter.p.m.", "").replace("filter.v.", "");
          shopifyFilters.push({ productMetafield: { namespace: "custom", key: label, value } });
        }
      }
    });

    const storefrontData = await shopifyStorefrontFetch(COLLECTION_QUERY, {
      handle: handle === "all" ? "all" : handle,
      filters: shopifyFilters.length > 0 ? shopifyFilters : activeFilters,
    });

    const filtersData = storefrontData?.collection?.products?.filters;

    if (!filtersData) {
      return NextResponse.json({});
    }

    const results = {};
    filtersData.forEach((f) => {
      if (f.type === "PRICE_RANGE") {
        // Find max price from values or defaults
        results["Price"] = { min: 0, max: 1000000 }; 
        return;
      }
      results[f.label] = f.values.map((v) => ({
        label: v.label,
        value: v.label,
        count: v.count,
        input: v.input,
        urlKey: f.label // Fallback for UI
      }));
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Filters API error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
