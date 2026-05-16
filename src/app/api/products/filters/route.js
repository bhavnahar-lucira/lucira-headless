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

    const baseMatch = await buildBaseMatch();
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

    // 5. Build ONE Faceted Aggregation Pipeline
    const facetStages = {};

    categories.forEach(cat => {
      if (cat.hideIfCategory && isCategoryHandle) return;

      const field = cat.field;
      const isVariantField = field.startsWith("variants.");
      
      const pipeline = [];
      const match = { ...baseMatch };

      if (Object.keys(activePriceFilter).length > 0) {
        match.price = activePriceFilter;
      }

      Object.entries(activeProductFilters).forEach(([activeField, val]) => {
        if (activeField !== field) {
          match[activeField] = val;
        }
      });

      if (!isVariantField) {
        const variantElemMatch = {};
        Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
          variantElemMatch[activeField.replace("variants.", "")] = val;
        });
        if (Object.keys(variantElemMatch).length > 0) {
          match.variants = { $elemMatch: variantElemMatch };
        }
      }

      pipeline.push({ $match: match });

      if (isVariantField) {
        pipeline.push({ $unwind: "$variants" });
        const variantMatch = {};
        Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
          if (activeField !== field) {
            variantMatch[activeField] = val;
          }
        });
        if (Object.keys(variantMatch).length > 0) {
          pipeline.push({ $match: variantMatch });
        }
      }

      if (cat.isM) {
        // Safe Transition: Handle both legacy strings and new BSON arrays
        pipeline.push({
          $addFields: {
            [field]: {
              $cond: {
                if: { $eq: [{ $type: `$${field}` }, "string"] },
                then: {
                  $cond: {
                    if: { $regexMatch: { input: `$${field}`, regex: /^\[.*\]$/ } },
                    then: { $function: {
                      body: "function(s) { try { return JSON.parse(s); } catch(e) { return [s]; } }",
                      args: [`$${field}`],
                      lang: "js"
                    }},
                    else: [`$${field}`]
                  }
                },
                else: { $ifNull: [`$${field}`, []] }
              }
            }
          }
        });

        if (field.includes("diamonds") || field.includes("gemstones")) {
          const arrayPath = field.split(".").slice(0, -1).join(".");
          pipeline.push({ $unwind: { path: `$${arrayPath}`, preserveNullAndEmptyArrays: false } });
        } else {
          pipeline.push({ $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: false } });
        }
      }

      pipeline.push({ $group: { _id: { sid: "$shopifyId", v: `$${field}` } } });
      pipeline.push({ $group: { _id: "$_id.v", count: { $sum: 1 } } });

      facetStages[cat.name] = pipeline;
    });

    const pricePipeline = [];
    const priceMatch = { ...baseMatch, ...activeProductFilters };
    const priceVariantElemMatch = {};
    Object.entries(activeVariantFilters).forEach(([activeField, val]) => {
      priceVariantElemMatch[activeField.replace("variants.", "")] = val;
    });
    if (Object.keys(priceVariantElemMatch).length > 0) {
      priceMatch.variants = { $elemMatch: priceVariantElemMatch };
    }
    pricePipeline.push({ $match: priceMatch });
    pricePipeline.push({ $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } });
    facetStages["__priceRange"] = pricePipeline;

    const [facetResults] = await productsCollection.aggregate([{ $facet: facetStages }]).toArray();

    const results = {};
    categories.forEach((cat, index) => {
      const rawData = facetResults[cat.name];
      if (!rawData || rawData.length === 0) return;

      const mergedResults = {};
      rawData.forEach(d => {
        let cleanVal = d._id;
        if (cleanVal === null || cleanVal === undefined) return;

        if (Array.isArray(cleanVal)) cleanVal = cleanVal[0];
        if (cleanVal === null || cleanVal === undefined) return;

        let label = cleanVal;
        let value = cleanVal;

        if (cat.name === "In Store Available" && storeMap[value]) {
          label = storeMap[value];
          value = storeMap[value];
        }

        if ((cat.name === "Diamond Shape" || cat.name === "Gemstone Shape") && String(label).length < 3) return;

        if (!mergedResults[label]) {
          mergedResults[label] = {
            label, value, count: 0,
            urlKey: REVERSE_KEY_MAP[cat.field] || cat.field.split(".").pop()
          };
        }
        mergedResults[label].count += d.count;
      });

      const finalData = Object.values(mergedResults);
      if (finalData.length > 0) {
        results[cat.name] = finalData;
      }

      if (index === 2 && facetResults["__priceRange"]?.[0]) {
        results["Price"] = {
          min: facetResults["__priceRange"][0].min,
          max: facetResults["__priceRange"][0].max
        };
      }
    });

    if (!results["Price"] && facetResults["__priceRange"]?.[0]) {
      results["Price"] = {
        min: facetResults["__priceRange"][0].min,
        max: facetResults["__priceRange"][0].max
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Filters Error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
