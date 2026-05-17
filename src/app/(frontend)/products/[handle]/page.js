import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/ProductPageClient";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/seo";
import { shopifyStorefrontFetch } from "@/lib/shopify";

const PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      createdAt
      publishedAt
      featuredImage { url }
      images(first: 20) {
        edges {
          node {
            url
            altText
          }
        }
      }
      media(first: 20) {
        edges {
          node {
            mediaContentType
            ... on MediaImage {
              image {
                url
                altText
              }
            }
            ... on Video {
              sources {
                url
                mimeType
              }
            }
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
            image { url altText }
            metal_weight: metafield(namespace: "ornaverse", key: "metal_weight") { value }
            gross_weight: metafield(namespace: "ornaverse", key: "gross_weight") { value }
            top_width: metafield(namespace: "ornaverse", key: "top_width") { value }
            top_height: metafield(namespace: "ornaverse", key: "top_height") { value }
            diamonds_meta: metafield(namespace: "ornaverse", key: "diamonds") { value }
            gemstones_meta: metafield(namespace: "ornaverse", key: "gemstones") { value }
            components: metafield(namespace: "ornaverse", key: "components") { value }
            variant_config: metafield(namespace: "DI-GoldPrice", key: "variant_config") { value }
          }
        }
      }
      seo { title description }
      productMetafields: metafields(identifiers: [
        {namespace: "ornaverse", key: "weight"},
        {namespace: "ornaverse", key: "quality"},
        {namespace: "ornaverse", key: "carat_range"},
        {namespace: "ornaverse", key: "lead_time"},
        {namespace: "ornaverse", key: "components"},
        {namespace: "ornaverse", key: "bestsellers"}
      ]) {
        key
        value
      }
      category: metafield(namespace: "ornaverse", key: "category") { value }
      matching_products: metafield(namespace: "custom", key: "matching_product") { 
        value 
        reference {
          ... on Product {
            id title handle featuredImage { url }
            variants(first: 1) { edges { node { price { amount } compareAtPrice { amount } } } }
          }
        }
      }
      complementary_products: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") { 
        value
        references(first: 10) {
          edges {
            node {
              ... on Product {
                id title handle featuredImage { url }
                variants(first: 1) { edges { node { price { amount } compareAtPrice { amount } } } }
              }
            }
          }
        }
      }
    }
  }
`;

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return {};

  const cleanDescription = product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "";

  return {
    title: product.seo?.title || `${product.title} | Lucira Jewelry`,
    description: product.seo?.description || cleanDescription,
    openGraph: {
      title: product.seo?.title || product.title,
      description: product.seo?.description || cleanDescription,
      images: [product.image],
    },
    alternates: {
      canonical: `/products/${handle}`,
    },
  };
}

async function getProduct(handle) {
  const data = await shopifyStorefrontFetch(PRODUCT_QUERY, { handle }, { cache: 'no-store' });
  const product = data?.product;

  if (!product) return null;

  const getOpt = (options, keys) => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (options[lowerKey] !== undefined && options[lowerKey] !== null) return options[lowerKey];
    }
    return null;
  };

  // Map product metafields
  const productMetafields = {};
  product.productMetafields?.forEach(m => {
    if (m) productMetafields[m.key] = m.value;
  });

  // Map to the internal format expected by the frontend
  const mappedVariants = product.variants.edges.map(({ node: v }) => {
    const options = {};
    v.selectedOptions.forEach(o => { options[o.name.toLowerCase()] = o.value; });
    
    // Parse components for technical details
    const comps = v.components?.value ? JSON.parse(v.components.value) : null;
    const metalComp = comps?.components?.find(c => c.item_group_name === "Gold");
    const diamondComps = comps?.components?.filter(c => c.item_group_name === "Diamond") || [];
    const gemstoneComps = comps?.components?.filter(c => c.item_group_name === "Gemstone" || c.item_group_name === "Color Stone") || [];

    let metal_purity = metalComp?.karat_code ? `${metalComp.karat_code}K` : null;
    let metal_color = metalComp?.stone_color_code && metalComp.stone_color_code !== "NA" ? metalComp.stone_color_code : null;
    
    if (!metal_color) {
      if (v.title.toLowerCase().includes('rose')) metal_color = 'Rose Gold';
      else if (v.title.toLowerCase().includes('white')) metal_color = 'White Gold';
      else if (v.title.toLowerCase().includes('yellow')) metal_color = 'Yellow Gold';
      else if (v.title.toLowerCase().includes('platinum')) metal_color = 'Platinum';
    }

    const diamonds = diamondComps.map(d => ({
      quality: d.quality_code && d.quality_code !== "NA" ? d.quality_code : (d.purity || "VVS-VS, EF"),
      shape: d.shape_code,
      pieces: d.pieces,
      weight: d.weight
    }));

    const gemstones = gemstoneComps.map(g => ({
      color: g.stone_color_code,
      shape: g.shape_code,
      pieces: g.pieces,
      weight: g.weight
    }));

    return {
      id: v.id.split("/").pop(),
      shopifyId: v.id,
      title: v.title,
      sku: v.sku,
      price: Number(v.price.amount),
      compare_price: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
      inStock: v.availableForSale === true && Number(v.quantityAvailable || 0) > 0,
      inventoryQuantity: v.quantityAvailable || 0,
      image: v.image?.url,
      size: options.size || null,
      color: getOpt(options, ["color", "metal", "metal color", "material color"]),
      options,
      metafields: {
        metal_purity,
        metal_color,
        metal_weight: v.metal_weight?.value || metalComp?.weight,
        gross_weight: v.gross_weight?.value,
        top_width: v.top_width?.value,
        top_height: v.top_height?.value,
        diamonds: diamonds.length > 0 ? diamonds : (v.diamonds_meta?.value ? JSON.parse(v.diamonds_meta.value) : []),
        gemstones: gemstones.length > 0 ? gemstones : (v.gemstones_meta?.value ? JSON.parse(v.gemstones_meta.value) : []),
        components: v.components?.value,
        variant_config: v.variant_config?.value
      }
    };
  });

  const media = product.media.edges.map(({ node: m }) => {
    if (m.mediaContentType === "IMAGE") {
      return {
        type: "IMAGE",
        url: m.image.url,
        alt: m.image.altText || ""
      };
    } else if (m.mediaContentType === "VIDEO") {
      return {
        type: "VIDEO",
        url: m.sources?.[0]?.url,
        mimeType: m.sources?.[0]?.mimeType,
        preview: product.featuredImage?.url,
        sources: m.sources,
        alt: product.title
      };
    }
    return null;
  }).filter(Boolean);

  const images = product.images.edges.map(({ node: img }) => ({
    url: img.url,
    alt: img.altText || ""
  }));

  // Map matching product IDs for 'View Similar' logic
  const matchingProductIds = (product.matching_products?.references?.edges || [])
    .map(({ node }) => node.id.split("/").pop());

  return {
    ...product,
    id: product.id.split("/").pop(),
    shopifyId: product.id,
    type: product.productType, // Alias for component compatibility
    description: product.descriptionHtml || product.description,
    image: product.featuredImage?.url,
    images,
    media,
    variants: mappedVariants,
    productMetafields,
    category: product.category?.value || product.productType,
    complementaryProductIds: [], 
    matchingProductIds: matchingProductIds,
    hasSimilar: true
  };
}

function mapShopifyProduct(p) {
    if (!p) return null;
    return {
        id: p.id.split("/").pop(),
        shopifyId: p.id,
        title: p.title,
        handle: p.handle,
        image: p.featuredImage?.url,
        price: Number(p.variants?.edges?.[0]?.node?.price?.amount || 0),
        compare_price: Number(p.variants?.edges?.[0]?.node?.compareAtPrice?.amount || 0),
        reviewStats: { count: 0, average: 0 }
    };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const rawProduct = await getProduct(handle);

  if (!rawProduct) {
    notFound();
  }

  // Handle complementary/matching products from metafield references
  const complementaryProducts = (rawProduct.complementary_products?.references?.edges || [])
    .map(({ node }) => mapShopifyProduct(node))
    .filter(Boolean);

  const matchingProducts = rawProduct.matching_products?.reference 
    ? [mapShopifyProduct(rawProduct.matching_products.reference)]
    : [];

  const jsonLd = getProductSchema(rawProduct);
  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(rawProduct.category ? [{ name: rawProduct.category, url: `/collections/${rawProduct.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { name: rawProduct.title, url: `/products/${rawProduct.handle}` }
  ];
  const breadcrumbLd = getBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductPageClient 
        product={rawProduct} 
        complementaryProducts={complementaryProducts} 
        matchingProducts={matchingProducts} 
      />
    </>
  );
}
