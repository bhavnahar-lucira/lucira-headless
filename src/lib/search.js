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
        .split(/\s+/)
        .map((term) => term.trim())
        .filter(Boolean)
    ),
  };
}

function fieldClause(field, keyword) {
  const variants = keywordVariants(keyword).map(escapeRegex);
  return {
    [field]: {
      $regex: variants.join("|"),
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

  return {
    $and: keywords.map((keyword) => ({
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

export async function resolveSearchMatch(productsCollection, baseFilter = {}, query = "") {
  const { filter: intentFilter, normalizedQuery, keywords } = extractSearchIntent(query);
  const filters = [baseFilter, intentFilter];

  if (!keywords.length) {
    return {
      filter: mergeMongoFilters(...filters),
      normalizedQuery,
      keywords,
      strategy: "base",
    };
  }

  // Use MongoDB $text search for relevance scoring
  const textFilter = { $text: { $search: keywords.join(" ") } };
  const finalFilter = mergeMongoFilters(...filters, textFilter);

  return {
    filter: finalFilter,
    normalizedQuery,
    keywords,
    strategy: "text",
  };
}
