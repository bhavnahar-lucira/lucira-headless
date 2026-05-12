import { fetchWithRetry } from "@/utils/helpers";

const PROXY_URL = 'https://api.lucirajewelry.com/nector-reviews/nector-proxy.php';

/**
 * GET reviews via proxy
 */
export async function apiFetch(url) {
  // Add cache: 'no-store' to ensure we get fresh data after submission
  const res = await fetchWithRetry(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Proxy HTTP ' + res.status);
  return res.json();
}

/**
 * POST review via proxy
 */
export async function submitReview(payload) {
  const res = await fetchWithRetry(PROXY_URL, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

/**
 * Upload single image via proxy (?action=upload)
 */
export async function uploadSingleImage(file, reviewId) {
  const formData = new FormData();
  formData.append('parent_type', 'reviews');
  formData.append('parent_id',   reviewId);
  formData.append('file',        file);

  const res = await fetchWithRetry(`${PROXY_URL}?action=upload`, {
    method : 'POST',
    body   : formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  const result = await res.json().catch(() => ({}));
  console.log(`[NectorReviews] Upload response for "${file.name}":`, result);
  if (!res.ok) throw new Error(result?.message || `Upload HTTP ${res.status}`);
  return result;
}

/**
 * Extract _id from create-review response
 */
export function extractReviewId(result) {
  console.log('[NectorReviews] Extracting ID from:', JSON.stringify(result, null, 2));
  return (
    result?.data?.review?._id ||
    result?.data?.item?._id   ||
    result?.data?._id         ||
    result?.data?.id          ||
    result?.review?._id       ||
    result?._id               ||
    null
  );
}

/**
 * Parse list response
 */
export function parseResponse(json) {
  const d = json?.data ?? {};
  return {
    items : Array.isArray(d.items)      ? d.items : [],
    count : typeof d.count === 'number' ? d.count : (parseInt(d.count) || 0),
    stats : Array.isArray(d.stats)      ? d.stats : [],
  };
}

/**
 * Paginated fetch through proxy
 */
export async function fetchAllPages(baseProxyUrl) {
  const LIMIT = 100;
  let page = 1, allItems = [], totalCount = 0, stats = [];
  while (true) {
    // Build URL cleanly using URL API to avoid string concat bugs
    const urlObj = new URL(baseProxyUrl);
    urlObj.searchParams.set('limit', LIMIT.toString());
    urlObj.searchParams.set('page', page.toString());
    
    const json   = await apiFetch(urlObj.toString());
    const parsed = parseResponse(json);
    
    if (page === 1) { 
      totalCount = parsed.count; 
      stats = parsed.stats; 
    }
    
    if (!parsed.items.length) break;
    
    allItems = allItems.concat(parsed.items);
    
    if (parsed.items.length < LIMIT || allItems.length >= totalCount) break;
    page++;
  }
  return { items: allItems, count: totalCount, stats };
}

/**
 * Load reviews for a product or fallback to all
 */
export async function loadNectorReviews(productId, options = {}) {
  const { noFallback = false } = options;
  try {
    // Extract numeric ID if it's a Shopify GID
    const cleanId = productId ? productId.toString().split("/").pop() : null;

    // If productId is provided, try fetching product-specific reviews first
    if (cleanId) {
      const productUrlObj = new URL(PROXY_URL);
      productUrlObj.searchParams.set("product_id", cleanId);
      const parsed = await fetchAllPages(productUrlObj.toString());

      if (parsed.items.length > 0) {
        return { ...parsed, isProductView: true, usedFallback: false };
      }
    }

    if (noFallback) {
      return {
        items: [],
        count: 0,
        stats: [],
        isProductView: !!cleanId,
        usedFallback: false,
      };
    }

    // Fallback: all reviews
    const fallback = await fetchAllPages(PROXY_URL);
    if (fallback.items.length > 0) {
      return { ...fallback, isProductView: false, usedFallback: !!cleanId };
    }

    return {
      items: [],
      count: 0,
      stats: [],
      isProductView: false,
      usedFallback: false,
    };
  } catch (err) {
    console.error("[NectorReviews] Error loading reviews:", err);
    throw err;
  }
}

export const fetchNectorReviews = async (productId, options = {}) => {
  const data = await loadNectorReviews(productId, options);

  // Calculate average if not provided
  let average = data.average || 0;
  if (!average && data.items?.length > 0) {
    const sum = data.items.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0);
    average = (sum / data.items.length).toFixed(1);
  }

  return {
    ...data,
    average,
    list: data.items, // For legacy compatibility with API routes
  };
};
