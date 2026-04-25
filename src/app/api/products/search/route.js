import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { resolveSearchMatch } from "@/lib/search";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const query = searchParams.get("q");
    // If q is present and no sort is specified, default to relevance
    const sort = searchParams.get("sort") || (query ? "relevance" : "featured");

    const SORT_MAP = {
      featured: { diamondDiscount: -1, "reviewStats.count": -1, title: 1, _id: 1 },
      relevance: { score: { $meta: "textScore" }, _id: 1 },
      best_selling: { "reviewStats.count": -1, title: 1, _id: 1 },
      az: { title: 1, _id: 1 },
      za: { title: -1, _id: 1 },
      price_low_high: { price: 1, _id: 1 },
      price_high_low: { price: -1, _id: 1 },
      date_new_old: { createdAt: -1, _id: 1 },
      date_old_new: { createdAt: 1, _id: 1 },
    };

    const sortConfig = SORT_MAP[sort] || SORT_MAP.featured;

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");
    const shopifyCollections = db.collection("shopify_collections");

    let filter = {};

    // 1. Collection filtering
    if (handle && handle !== "all") {
      const isRealCollection = await shopifyCollections.findOne({ handle });

      if (isRealCollection || !handle.startsWith("all-")) {
        filter.collectionHandles = handle;
      } else {
        // Handle "all-rings", "all-earrings", etc.
        const typeKeyword = handle.replace("all-", "").replace(/-/g, " ");
        // singularize (very basic: rings -> ring, earrings -> earring)
        const singularType = typeKeyword.replace(/s$/, "");
        
        const handleFilter = {
          $or: [
            { type: { $regex: `^${singularType}$`, $options: "i" } }, // Exact type match
            { type: { $regex: `^${typeKeyword}$`, $options: "i" } },
            { collectionHandles: handle },
            { tags: { $regex: `^${singularType}$`, $options: "i" } }
          ]
        };
        
        // If it's rings, we MUST exclude earrings
        if (singularType.toLowerCase() === "ring") {
          filter.type = { $not: /earring/i };
        }

        filter = { ...filter, ...handleFilter };
      }
    }

    // 2. Definitive Field Mapping
    const KEY_MAP = {
      // Simple keys (current frontend)
      "in_store_available": "variants.metafields.in_store_available",
      "ring_size": "variants.metafields.ring_size_inventory",
      "shop_for": "productMetafields.shop_for",
      "weight": "productMetafields.weight",
      "shape": "variants.metafields.diamonds.shape",
      "gemstone_shape": "variants.metafields.gemstones.shape",
      "carat_range": "productMetafields.carat_range",
      "material_type": "productMetafields.material_type",
      "product_type": "type",
      "metal_purity": "variants.metafields.metal_purity",
      "finishing": "productMetafields.finishing",
      "fit": "productMetafields.fit",
      
      // Shopify-style keys (support both)
      "filter.v.m.custom.in_store_available": "variants.metafields.in_store_available",
      "filter.p.m.custom.ring_size": "variants.metafields.ring_size_inventory",
      "filter.p.m.custom.shop_for": "productMetafields.shop_for",
      "filter.p.m.custom.weight": "productMetafields.weight",
      "filter.v.m.custom.shape": "variants.metafields.diamonds.shape",
      "filter.v.m.custom.gemstone_shape": "variants.metafields.gemstones.shape",
      "filter.p.m.custom.carat_range": "productMetafields.carat_range",
      "filter.p.m.custom.material_type": "productMetafields.material_type",
      "filter.p.product_type": "type",
      "filter.v.m.custom.metal_purity": "variants.metafields.metal_purity",
      "filter.p.m.custom.finishing": "productMetafields.finishing",
      "filter.p.m.custom.fit": "productMetafields.fit"
    };

    const variantFilters = {};
    const productFilters = {};

    // Fetch store mappings to resolve store names back to GIDs
    const storesCollection = db.collection("stores");
    const stores = await storesCollection.find({}).toArray();
    const nameToGidMap = {};
    stores.forEach(s => {
      let displayName = s.name;
      if (displayName.includes("Divinecarat")) displayName = "Malad";
      if (displayName === "BO1") displayName = "Borivali";
      if (displayName === "CS1") displayName = "Chembur";
      if (displayName === "PS1") displayName = "Pune";
      if (displayName === "NOS18") displayName = "Noida";
      nameToGidMap[displayName] = s.shopifyId;
    });

    searchParams.forEach((value, key) => {
      if (!value || key === "handle" || key === "page" || key === "limit" || key === "sort" || key === "q") return;
      
      let mongoKey = KEY_MAP[key];
      
      // Fallback dynamic mapping if not in KEY_MAP
      if (!mongoKey) {
        if (key.startsWith("filter.v.m.")) {
          mongoKey = `variants.metafields.${key.split(".").slice(4).join(".")}`;
        } else if (key.startsWith("filter.p.m.")) {
          mongoKey = `productMetafields.${key.split(".").slice(4).join(".")}`;
        } else if (key === "filter.p.product_type") {
          mongoKey = "type";
        }
      }

      if (mongoKey) {
        // Resolve store name to GID if it's the in_store_available filter
        let finalValue = value;
        if (mongoKey === "variants.metafields.in_store_available" && nameToGidMap[value]) {
          finalValue = nameToGidMap[value];
        }

        if (mongoKey.startsWith("variants.")) {
          const vKey = mongoKey.replace("variants.", "");
          if (!variantFilters[vKey]) variantFilters[vKey] = [];
          variantFilters[vKey].push(finalValue);
        } else {
          if (!productFilters[mongoKey]) productFilters[mongoKey] = [];
          productFilters[mongoKey].push(finalValue);
        }
      }
    });

    // Apply product-level filters (including type)
    Object.entries(productFilters).forEach(([mKey, mValues]) => {
      const uniqueValues = [...new Set(mValues)];
      const expandedValues = [];
      uniqueValues.forEach(v => {
        expandedValues.push(v);
        expandedValues.push(JSON.stringify([v])); // Support JSON encoded strings in DB
      });
      filter[mKey] = { $in: expandedValues };
    });

    // Apply variant-level filters using $elemMatch to ensure all variant criteria match the same variant
    if (Object.keys(variantFilters).length > 0) {
      const elemMatch = {};
      Object.entries(variantFilters).forEach(([vKey, vValues]) => {
        const uniqueValues = [...new Set(vValues)];
        const expandedValues = [];
        uniqueValues.forEach(v => {
          expandedValues.push(v);
          expandedValues.push(JSON.stringify([v]));
        });
        elemMatch[vKey] = { $in: expandedValues };
      });
      filter.variants = { $elemMatch: elemMatch };
    }

    // Handle price range separately
    const minPrice = searchParams.get("filter.v.price.gte");
    const maxPrice = searchParams.get("filter.v.price.lte");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const { filter: resolvedFilter, fallbackFilter, strategy } = await resolveSearchMatch(productsCollection, filter, query || "");

    let finalSort = sortConfig;
    const projection = {
      description: 0,
      "reviews.list": 0,
    };

    // If sorting by relevance, check if we actually did a text search
    if (sort === "relevance") {
      if (strategy === "text") {
        projection.score = { $meta: "textScore" };
      } else {
        // If no text search was performed, fallback to featured sort
        finalSort = SORT_MAP.featured;
      }
    }

    console.log(`Applying sort: ${JSON.stringify(finalSort)} to collection: ${handle}`);

    let products = await productsCollection
      .find(resolvedFilter)
      .project(projection)
      .sort(finalSort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    let total = await productsCollection.countDocuments(resolvedFilter);

    // If no products found and we have a query, try fallback broad search
    if (products.length === 0 && query && fallbackFilter) {
      console.log(`No results for primary search "${query}", trying fallback...`);
      products = await productsCollection
        .find(fallbackFilter)
        .project(projection)
        .sort(sort === "relevance" ? { title: 1 } : finalSort)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      total = await productsCollection.countDocuments(fallbackFilter);
    }

    return NextResponse.json({
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Failed to search products", message: error.message }, { status: 500 });
  }
}
