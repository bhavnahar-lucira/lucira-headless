export const resolveShopifyImage = (url) => {
  if (!url) return "";
  if (url.startsWith("shopify://shop_images/")) {
    const filename = url.replace("shopify://shop_images/", "");
    return `https://www.lucirajewelry.com/cdn/shop/files/${filename}`;
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
