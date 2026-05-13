export const resolveShopifyImage = (url) => {
  if (!url) return "";
  if (url.startsWith("shopify://shop_images/")) {
    const filename = url.replace("shopify://shop_images/", "");
    return `https://luciraonline.myshopify.com/cdn/shop/files/${filename}`;
  }
  return url;
};

export const resolveShopifyLink = (url) => {
  if (!url) return "#";
  if (url.startsWith("shopify://collections/")) {
    return `/collections/${url.replace("shopify://collections/", "")}`;
  }
  if (url.startsWith("shopify://products/")) {
    return `/products/${url.replace("shopify://products/", "")}`;
  }
  return url;
};

/**
 * Fetch with basic retry logic for network errors
 */
export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
  try {
    const res = await fetch(url, options);
    // If it's a 5xx error, we might want to retry as well
    if (!res.ok && res.status >= 500 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}