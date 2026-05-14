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

const reviewCache = new Map();

export const fetchNectorReviews = async (productId, options = {}) => {
  if (!productId) return { count: 0, average: 0, list: [], items: [], stats: [], isProductView: false, usedFallback: false };

  // If running in the browser, call the local API route instead of Nector directly
  // This avoids exposing API keys and handles the missing process.env in the client
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error fetching reviews via local API:", e.message);
      return { count: 0, average: 0, list: [], items: [], stats: [], isProductView: true, usedFallback: false };
    }
  }

  // Convert shopify ID to simple ID
  const id = productId.split("/").pop();

  if (reviewCache.has(id)) {
    return reviewCache.get(id);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s for bulk sync

    const res = await fetch(
      `https://cachefront.nector.io/api/v2/merchant/reviews?page=1&limit=10&sort=image_count&sort_op=DESC&reference_product_id=${id}&reference_product_source=shopify`,
      {
        headers: {
          "x-apikey": process.env.NECTOR_API_KEY,
          "x-workspaceid": process.env.NECTOR_WORKSPACE_ID,
          "x-source": "web",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok) {
      console.error(`Nector API Error for ${id}:`, res.status, json);
      return { count: 0, average: 0, list: [], stats: [] };
    }

    const data = json?.data || {};
    const stats = data.stats || [];
    const count = data.count || 0;
    const items = data.items || []; // The API uses 'items'

    let total = 0;
    let ratingCount = 0;

    stats.forEach(s => {
      total += Number(s.rating) * Number(s.count);
      ratingCount += Number(s.count);
    });

    const reviews = {
      count,
      average: ratingCount ? Number((total / ratingCount).toFixed(1)) : 0,
      stats: stats.map(s => ({ rating: Number(s.rating), count: Number(s.count) })),
      items: items.map(r => ({
        id: r._id,
        name: r.name || "Verified Buyer",
        rating: r.rating,
        text: r.description, // API uses 'description'
        date: r.posted_at || r.created_at,
        images: r.uploads?.filter(u => u.type === "image" && u.link).map(u => u.link) || [],
        videos: r.uploads?.filter(u => u.type === "video" && u.link).map(u => u.link) || [],
        image_count: r.image_count || 0,
        video_count: r.video_count || 0,
        title: r.title || r.reference_product_name || "",
        uploads: r.uploads // Keep raw uploads for components that expect them
      })),
      isProductView: !!id,
      usedFallback: false
    };

    // Add list alias for sync logic
    reviews.list = reviews.items;

    reviewCache.set(id, reviews);
    setTimeout(() => reviewCache.delete(id), 5 * 60 * 1000);

    return reviews;
  } catch (e) {
    console.error(`Error fetching Nector reviews for ${id}:`, e.message);
    return { count: 0, average: 0, list: [], items: [], stats: [], isProductView: !!id, usedFallback: false };
  }
};

export const loadNectorReviews = fetchNectorReviews;


