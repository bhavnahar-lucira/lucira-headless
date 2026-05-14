const SEARCHABLE_FALLBACK_FIELDS = ["title", "type", "tags", "collectionHandles", "description"];

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function keywordVariants(keyword = "") {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return [];

  const variants = [normalized];

  if (normalized.endsWith("ies") && normalized.length > 3) {
    variants.push(`${normalized.slice(0, -3)}y`);
  } else if (normalized.endsWith("es") && normalized.length > 2) {
    variants.push(normalized.slice(0, -2));
  } else if (normalized.endsWith("s") && normalized.length > 1) {
    variants.push(normalized.slice(0, -1));
  } else if (normalized.endsWith("y") && normalized.length > 1) {
    variants.push(`${normalized.slice(0, -1)}ies`);
  } else {
    variants.push(`${normalized}s`);
  }

  return unique(variants);
}

export function extractSearchIntent(query = "") {
  let workingQuery = query.trim();
  const filter = {};
  const lowerQuery = workingQuery.toLowerCase();

  const underMatch = lowerQuery.match(/(?:under|below|less than|under\s?than)\s?(\d+(?:\.\d+)?)\s?(k|thousand|lakh|l)?/i);
  const aboveMatch = lowerQuery.match(/(?:above|more than|greater than|over)\s?(\d+(?:\.\d+)?)\s?(k|thousand|lakh|l)?/i);

  const applyAmount = (match, operator) => {
    let amount = parseFloat(match[1]);
    const unit = (match[2] || "").toLowerCase();

    if (unit === "k" || unit === "thousand") amount *= 1000;
    if (unit === "lakh" || unit === "l") amount *= 100000;

    if (!Number.isNaN(amount)) {
      filter.price = { [operator]: amount };
      workingQuery = workingQuery.replace(new RegExp(match[0], "i"), "").trim();
    }
  };

  if (underMatch) {
    applyAmount(underMatch, "$lte");
  } else if (aboveMatch) {
    applyAmount(aboveMatch, "$gte");
  }

  return {
    filter,
    normalizedQuery: workingQuery,
    keywords: unique(
      workingQuery
        .toLowerCase()
        .split(/[\s-]+/) // Split by spaces or hyphens
        .map((term) => term.trim())
        .filter(Boolean)
    ),
  };
}

function fieldClause(field, keyword) {
  const variants = keywordVariants(keyword);

  // Optimization: For tags and collectionHandles, direct equality is much faster and uses indexes.
  if (field === "tags" || field === "collectionHandles") {
    // We include variants (singular/plural) to increase match probability without regex
    return { [field]: { $in: variants } };
  }

  const regexPattern = variants.map(escapeRegex).join("|");
  return {
    [field]: {
      $regex: regexPattern,
      $options: "i",
    },
  };
}

export function buildTitleKeywordMatch(keywords = []) {
  if (!keywords.length) return null;

  return {
    $and: keywords.map((keyword) => fieldClause("title", keyword)),
  };
}

export function buildFallbackKeywordMatch(keywords = []) {
  if (!keywords.length) return null;

  // Broad OR match across keywords for better coverage when specific search fails
  return {
    $or: keywords.map((keyword) => ({
      $or: SEARCHABLE_FALLBACK_FIELDS.map((field) => fieldClause(field, keyword)),
    })),
  };
}

export function mergeMongoFilters(...filters) {
  const normalized = filters.filter(Boolean);
  if (!normalized.length) return {};
  if (normalized.length === 1) return normalized[0];

  return { $and: normalized };
}

export async function resolveSearchMatch(db, baseFilter = {}, query = "") {
  const productsCollection = db.collection("products");
  const activeFilter = { status: "ACTIVE", isPublished: true };
  const combinedBaseFilter = { ...baseFilter, ...activeFilter };
  
  const { filter: intentFilter, normalizedQuery, keywords } = extractSearchIntent(query);
  const filters = [combinedBaseFilter, intentFilter];

  // 0. Check for synonyms and matched collections
  let matchedCollections = [];
  const trimmedQuery = query.trim();

  if (trimmedQuery.length >= 2) {
    try {
      const synonymsCollection = db.collection("search_synonyms");
      const collectionsStore = db.collection("collections");
      
      const escapedQuery = escapeRegex(trimmedQuery);
      const queryRegex = new RegExp(escapedQuery, "i");
      
      // Find synonym groups that match the query
      // Optimized: Use exact match for title if possible, or prefix match
      const synonymGroups = await synonymsCollection.find({
        $or: [
          { title: trimmedQuery },
          { title: queryRegex },
          { synonyms: trimmedQuery.toLowerCase() },
          { synonyms: { $regex: escapedQuery, $options: "i" } }
        ]
      }).toArray();

      const groupTitles = synonymGroups.map(g => g.title);
      const handleFriendlyQuery = trimmedQuery.toLowerCase().replace(/\s+/g, "-");

      // Find collections matching either the direct query or any of the synonym group titles
      matchedCollections = await collectionsStore.find({
        $or: [
          { title: queryRegex },
          { handle: handleFriendlyQuery },
          { title: { $in: groupTitles } },
          { handle: { $in: groupTitles.map(t => t.toLowerCase().replace(/\s+/g, "-")) } },
          { "ruleSet.rules.condition": { $in: groupTitles } },
          { "ruleSet.rules.condition": queryRegex },
          { "metafields.custom.seo_keywords": { $in: groupTitles } },
          { "metafields.custom.seo_keywords": queryRegex }
        ]
      }).limit(10).toArray();
    } catch (err) {
      console.error("Synonym lookup error:", err);
    }
  }

  if (!keywords.length) {
    return {
      filter: mergeMongoFilters(...filters),
      normalizedQuery,
      keywords,
      strategy: "base",
      matchedCollections,
    };
  }

  // 1. Check for exact match for title, handle, SKU or TAG first
  const handleFriendlyQuery = normalizedQuery.replace(/\./g, "-").replace(/\s+/g, "-");

  const exactMatchFilter = {
    $or: [
      { title: trimmedQuery },
      { title: { $regex: new RegExp(`^${escapeRegex(trimmedQuery)}$`, "i") } },
      { handle: trimmedQuery },
      { handle: normalizedQuery },
      { handle: handleFriendlyQuery },
      { "variants.sku": trimmedQuery },
      { "variants.sku": trimmedQuery.toUpperCase() },
      { "variants.sku": { $regex: escapeRegex(trimmedQuery), $options: "i" } },
      { tags: { $regex: `^${escapeRegex(trimmedQuery)}$`, $options: "i" } }
    ]
  };

  const exactMatchCount = await productsCollection.countDocuments(mergeMongoFilters(...filters, exactMatchFilter));
  if (exactMatchCount > 0) {
    return {
      filter: mergeMongoFilters(...filters, exactMatchFilter),
      normalizedQuery,
      keywords,
      strategy: "base",
      matchedCollections,
    };
  }

  // 2. If no exact match, proceed with text search (covers title, description, tags, type via $text index)
  const hasIntent = Object.keys(intentFilter).length > 0;
  const primaryPhrase = hasIntent ? normalizedQuery : trimmedQuery;
  
  const phrases = unique([primaryPhrase, keywords.join(" ")]);
  const searchString = phrases.map(p => `\"${p}\"`).join(" ") + " " + keywords.join(" ");
  
  const textFilter = { $text: { $search: searchString } };
  const searchMatch = textFilter;

  const finalFilter = mergeMongoFilters(...filters, searchMatch);

  // We also return a broad fallback filter in case the primary search yields no results
  const fallbackFilter = mergeMongoFilters(...filters, buildFallbackKeywordMatch(keywords));

  return {
    filter: finalFilter,
    fallbackFilter,
    normalizedQuery,
    keywords,
    strategy: "text",
    matchedCollections,
  };
}
