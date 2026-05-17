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

      const { filter } = await resolveSearchMatch(db, match, searchParams.get("q") || "");
      return filter;
    };

    const baseMatch = await buildBaseMatch();

    // 2. Definitive Field Mapping
    const KEY_MAP = {
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

    // 3. Store Mapping
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

    // 4. Current Active Filters
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
          const resolvedValue = (mongoKey === "variants.metafields.in_store_available" && nameToGidMap[v]) 
            ? nameToGidMap[v] 
            : v;
          expandedValues.push(resolvedValue);
          // Keep backward compatibility for stringified arrays during transition
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

    // 5. Build Faceted Aggregation Pipeline
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

    const isCategoryHandle = handle && handle.startsWith("all-");
    const activeCategories = categories.filter(cat => !(cat.hideIfCategory && isCategoryHandle));

    const facets = {};

    // Price Facet
    facets["Price"] = [
      { $match: { ...activeProductFilters } },
      ...(Object.keys(activeVariantFilters).length > 0 ? [{
        $match: {
          variants: {
            $elemMatch: Object.entries(activeVariantFilters).reduce((acc, [k, v]) => {
              acc[k.replace("variants.", "")] = v;
              return acc;
            }, {})
          }
        }
      }] : []),
      { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      { $project: { _id: 0, min: 1, max: 1 } }
    ];

    // Field Facets
    activeCategories.forEach(cat => {
      const isVariantField = cat.field.startsWith("variants.");
      const facetMatch = { ...activeProductFilters };
      if (activePriceFilter.$gte || activePriceFilter.$lte) facetMatch.price = activePriceFilter;

      // Remove current field from filters for its own facet
      if (facetMatch[cat.field]) delete facetMatch[cat.field];

      const pipeline = [{ $match: facetMatch }];

      if (isVariantField) {
        pipeline.push({ $unwind: "$variants" });
        const variantFilters = { ...activeVariantFilters };
        if (variantFilters[cat.field]) delete variantFilters[cat.field];
        
        Object.entries(variantFilters).forEach(([f, v]) => {
          pipeline.push({ $match: { [f]: v } });
        });
      } else {
        const variantFilters = { ...activeVariantFilters };
        if (Object.keys(variantFilters).length > 0) {
          pipeline.push({
            $match: {
              variants: {
                $elemMatch: Object.entries(variantFilters).reduce((acc, [k, v]) => {
                  acc[k.replace("variants.", "")] = v;
                  return acc;
                }, {})
              }
            }
          });
        }
      }

      // Handle arrays (now BSON native)
      if (cat.isM) {
        if (cat.field.includes("diamonds") || cat.field.includes("gemstones")) {
          const arrayPath = cat.field.split(".").slice(0, -1).join(".");
          pipeline.push({ $unwind: { path: `$${arrayPath}`, preserveNullAndEmptyArrays: false } });
        } else {
          // Backward compatible unwind: handle both single value, BSON array, and stringified array
          pipeline.push({
            $addFields: {
              [cat.field]: {
                $cond: {
                  if: { $eq: [{ $type: `$${cat.field}` }, "string"] },
                  then: {
                    $cond: {
                      if: { $regexMatch: { input: `$${cat.field}`, regex: /^\[.*\]$/ } },
                      then: { $split: [{ $substr: [`$${cat.field}`, 2, { $subtract: [{ $strLenCP: `$${cat.field}` }, 4] }] }, '","'] },
                      else: [`$${cat.field}`]
                    }
                  },
                  else: {
                    $cond: {
                      if: { $eq: [{ $type: `$${cat.field}` }, "array"] },
                      then: `$${cat.field}`,
                      else: [`$${cat.field}`]
                    }
                  }
                }
              }
            }
          });
          pipeline.push({ $unwind: `$${cat.field}` });
        }
      }

      pipeline.push({ $group: { _id: { shopifyId: "$shopifyId", val: `$${cat.field}` } } });
      pipeline.push({ $group: { _id: "$_id.val", count: { $sum: 1 } } });
      pipeline.push({ $match: { _id: { $ne: null } } });

      facets[cat.name] = pipeline;
    });

    const finalPipeline = [
      { $match: baseMatch },
      { $facet: facets }
    ];

    const [aggregationResult] = await productsCollection.aggregate(finalPipeline).toArray();

    // 6. Format Results
    const REVERSE_KEY_MAP = {};
    Object.entries(KEY_MAP).forEach(([shortKey, mongoKey]) => { REVERSE_KEY_MAP[mongoKey] = shortKey; });

    const results = {};
    const priceData = aggregationResult.Price?.[0] || null;

    activeCategories.forEach((cat, index) => {
      const facetData = aggregationResult[cat.name] || [];
      if (facetData.length === 0) return;

      const mergedResults = {};
      facetData.forEach(d => {
        let label = d._id;
        let value = d._id;

        // Clean up label/value if it's still a stringified array (edge case)
        if (typeof label === "string" && label.startsWith("[\"") && label.endsWith("\"]")) {
          label = label.substring(2, label.length - 2);
          value = label;
        }

        if (cat.name === "In Store Available" && storeMap[value]) {
          label = storeMap[value];
          value = storeMap[value];
        }

        if ((cat.name === "Diamond Shape" || cat.name === "Gemstone Shape") &&
            (String(label || "").trim().length < 3)) {
          return;
        }

        if (!mergedResults[label]) {
          mergedResults[label] = {
            label: label,
            value: value,
            count: 0,
            urlKey: REVERSE_KEY_MAP[cat.field] || cat.field.split(".").pop()
          };
        }
        mergedResults[label].count += d.count;
      });

      results[cat.name] = Object.values(mergedResults);

      // Insert Price at 4th position
      if (index === 2 && priceData) results["Price"] = priceData;
    });

    if (!results["Price"] && priceData) results["Price"] = priceData;

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Filters Error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
