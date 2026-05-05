import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { resolveSearchMatch } from "@/lib/search";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");
    const shopifyCollections = db.collection("shopify_collections");

    // 1. Build the Base Match Stage (Collection & Search)
    const buildBaseMatch = async () => {
      const match = {};

      if (handle && handle !== "all") {
        const isRealCollection = await shopifyCollections.findOne({ handle });

        if (isRealCollection || !handle.startsWith("all-")) {
          match.collectionHandles = handle;
        } else {
          const keywords = handle.replace("all-", "").split("-").map(k => k.replace(/s$/, ""));
          const handleFilter = keywords.map(kw => {
            return {
              $or: [
                { collectionHandles: { $regex: kw, $options: "i" } },
                { type: { $regex: kw, $options: "i" } },
                { tags: { $regex: kw, $options: "i" } },
                { title: { $regex: kw, $options: "i" } }
              ]
            };
          });
          
          if (match.$and) {
            match.$and.push(...handleFilter);
          } else {
            match.$and = handleFilter;
          }
        }
      }

      const { filter } = await resolveSearchMatch(productsCollection, match, searchParams.get("q") || "");
      return filter;
    };

    // 2. Definitive Field Mapping
    const KEY_MAP = {
      // Simple keys
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
      
      // Shopify-style keys
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

    // 3. Store Mapping for "In Store Available" Filter
    const storesCollection = db.collection("stores");
    const stores = await storesCollection.find({}).toArray();
    const storeMap = {};
    const nameToGidMap = {};
    stores.forEach(s => {
      let displayName = s.name;
      if (displayName.includes("Divinecarat")) displayName = "Malad";
      if (displayName === "BO1") displayName = "Borivali";
      if (displayName === "CS1") displayName = "Chembur";
      if (displayName === "PS1") displayName = "Pune";
      if (displayName === "NOS18") displayName = "Noida";
      storeMap[s.shopifyId] = displayName;
      nameToGidMap[displayName] = s.shopifyId;
    });

    // 4. Current Active Filters from URL
    const activeProductFilters = {};
    const activeVariantFilters = {};
    const activePriceFilter = {};

    const rawParams = {};
    searchParams.forEach((val, key) => {
      if (!val || key === "handle" || key === "page" || key === "limit" || key === "sort" || key === "q") return;
      if (!rawParams[key]) rawParams[key] = [];
      rawParams[key].push(val);
    });

    Object.entries(rawParams).forEach(([key, values]) => {
      if (key === "filter.v.price.gte") {
        activePriceFilter.$gte = parseFloat(values[0]);
        return;
      }
      if (key === "filter.v.price.lte") {
        activePriceFilter.$lte = parseFloat(values[0]);
        return;
      }

      let mongoKey = KEY_MAP[key] || null;
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
        const uniqueValues = [...new Set(values)];
        const expandedValues = [];
        uniqueValues.forEach(v => {
          // Resolve store name to GID if it's the in_store_available filter
          const resolvedValue = (mongoKey === "variants.metafields.in_store_available" && nameToGidMap[v]) 
            ? nameToGidMap[v] 
            : v;
            
          expandedValues.push(resolvedValue);
          expandedValues.push(JSON.stringify([resolvedValue]));
        });
        const val = expandedValues.length > 1 ? { $in: expandedValues } : expandedValues[0];

        if (mongoKey.startsWith("variants.")) {
          activeVariantFilters[mongoKey] = val;
        } else {
          activeProductFilters[mongoKey] = val;
        }
      }
    });

    // 5. Aggregation Helper
    const baseMatch = await buildBaseMatch();

    const getFacetedCounts = async (field, isMetafieldArray = false) => {
      const isVariantField = field.startsWith("variants.");
      
      // Start with baseMatch (Collection/Handle)
      const pipeline = [{ $match: { ...baseMatch } }];

      // Apply Price Filter (if any) to all facet counts
      if (Object.keys(activePriceFilter).length > 0) {
        pipeline[0].$match.price = activePriceFilter;
      }

      // Add product-level filters (exclude current field if it matches)
      Object.entries(activeProductFilters).forEach(([activeField, val]) => {
        if (activeField !== field) {
          pipeline[0].$match[activeField] = val;
        }
      });

      if (isVariantField) {
        // For variant-level facets (e.g. In Store, Metal Purity): 
        // We unwind first to count specific variants, then apply OTHER variant filters.
        pipeline.push({ $unwind: "$variants" });
        
        Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
          if (activeField !== field) {
            pipeline.push({ $match: { [activeField]: val } });
          }
        });
      } else {
        // For product-level facets (e.g. Shop For, Material Type):
        // Use $elemMatch for active variant filters to ensure we only count products 
        // that have AT LEAST ONE variant matching ALL active variant filters.
        const variantElemMatch = {};
        Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
          const vKey = activeField.replace("variants.", "");
          variantElemMatch[vKey] = val;
        });

        if (Object.keys(variantElemMatch).length > 0) {
          pipeline[0].$match.variants = { $elemMatch: variantElemMatch };
        }
      }

      // Shared logic for fields that might be JSON-encoded arrays
      if (isMetafieldArray) {
        if (field.includes("diamonds") || field.includes("gemstones")) {
          const arrayPath = field.split(".").slice(0, -1).join(".");
          // If it's a variant field, variants is already unwound
          pipeline.push({ $unwind: { path: `$${arrayPath}`, preserveNullAndEmptyArrays: false } });
        } else {
          pipeline.push({
            $addFields: {
              [field]: {
                $cond: {
                  if: { $and: [
                    { $eq: [{ $type: `$${field}` }, "string"] },
                    { $regexMatch: { input: `$${field}`, regex: /^\[.*\]$/ } }
                  ]},
                  then: { $function: {
                    body: "function(s) { try { return JSON.parse(s); } catch(e) { return s; } }",
                    args: [`$${field}`],
                    lang: "js"
                  }},
                  else: `$${field}`
                }
              }
            }
          });
          pipeline.push({ $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: false } });
        }
      }

      pipeline.push({ $group: { _id: { shopifyId: "$shopifyId", val: `$${field}` } } });
      pipeline.push({ $group: { _id: "$_id.val", count: { $sum: 1 } } });

      const data = await productsCollection.aggregate(pipeline).toArray();

      return data.filter(d => d._id).map(d => {
        let cleanVal = d._id;
        if (typeof cleanVal === "string" && cleanVal.startsWith("[") && cleanVal.endsWith("]")) {
          try {
            const parsed = JSON.parse(cleanVal);
            if (Array.isArray(parsed)) cleanVal = parsed[0];
          } catch (e) {}
        }
        if (Array.isArray(cleanVal)) cleanVal = cleanVal[0];
        return { label: cleanVal, value: cleanVal, count: d.count };
      });
    };

    const results = {};
    const isCategoryHandle = handle && handle.startsWith("all-");

    const categories = [
      { name: "In Store Available", field: "variants.metafields.in_store_available", isM: true },
      { name: "Ring Size", field: "variants.metafields.ring_size_inventory", isM: true },
      { name: "Shop For", field: "productMetafields.shop_for", isM: true },
      { name: "Weight", field: "productMetafields.weight", isM: true },
      { name: "Diamond Shape", field: "variants.metafields.diamonds.shape", isM: true },
      { name: "Gemstone Shape", field: "variants.metafields.gemstones.shape", isM: true },
      { name: "Carat range", field: "productMetafields.carat_range", isM: true },
      { name: "Material Type", field: "productMetafields.material_type", isM: true },
      { name: "Product Category", field: "type", hideIfCategory: true },
      { name: "Metal Purity", field: "variants.metafields.metal_purity", isM: true },
      { name: "Finishing", field: "productMetafields.finishing", isM: true },
      { name: "Fit", field: "productMetafields.fit", isM: true }
    ];

    const REVERSE_KEY_MAP = {};
    Object.entries(KEY_MAP).forEach(([shortKey, mongoKey]) => { REVERSE_KEY_MAP[mongoKey] = shortKey; });

    const filterPromises = categories.map(async (cat) => {
      if (cat.hideIfCategory && isCategoryHandle) return null;
      
      try {
        const counts = await getFacetedCounts(cat.field, cat.isM);
        if (counts.length === 0) return null;

        const mergedResults = {};
        counts.forEach(c => {
          let label = c.label;
          let value = c.value;
          
          if (cat.name === "In Store Available" && storeMap[value]) {
            label = storeMap[value];
            value = storeMap[value]; 
          }

          if (!mergedResults[label]) {
            mergedResults[label] = { 
                label: label, 
                value: value, 
                count: 0,
                urlKey: REVERSE_KEY_MAP[cat.field] || cat.field.split(".").pop()
            };
          }
          mergedResults[label].count += c.count;
        });

        return { name: cat.name, data: Object.values(mergedResults) };
      } catch (err) {
        console.error(`Error fetching counts for ${cat.name}:`, err);
        return null;
      }
    });

    const filterResults = await Promise.all(filterPromises);
    
    // 6. Calculate Price Range
    let priceData = null;
    try {
      // For price range, we want the range of products matching ALL active filters EXCEPT price itself
      const priceMatch = { ...baseMatch, ...activeProductFilters };
      const pricePipeline = [{ $match: priceMatch }];
      
      const variantElemMatch = {};
      Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
        const vKey = activeField.replace("variants.", "");
        variantElemMatch[vKey] = val;
      });

      if (Object.keys(variantElemMatch).length > 0) {
        pricePipeline[0].$match.variants = { $elemMatch: variantElemMatch };
      }

      pricePipeline.push({ $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } });
      
      const priceRangeResult = await productsCollection.aggregate(pricePipeline).toArray();
      if (priceRangeResult.length > 0) {
        priceData = {
          min: priceRangeResult[0].minPrice,
          max: priceRangeResult[0].maxPrice
        };
      }
    } catch (err) {
      console.error("Error calculating price range:", err);
    }

    // 7. Assemble Results in Specific Order
    filterResults.forEach((res, index) => {
      if (res) {
        results[res.name] = res.data;
      }
      // Insert Price at 4th position (after 3rd category: Shop For)
      if (index === 2 && priceData) {
        results["Price"] = priceData;
      }
    });

    // If Price hasn't been added (e.g. fewer than 3 categories), add it at the end
    if (!results["Price"] && priceData) {
      results["Price"] = priceData;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Filters Error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
