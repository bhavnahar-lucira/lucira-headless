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
          }
        }
      }
      seo { title description }
      category: metafield(namespace: "custom", key: "product_category") { value }
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
  const data = await shopifyStorefrontFetch(PRODUCT_QUERY, { handle });
  const product = data?.product;

  if (!product) return null;

  const getOpt = (options, keys) => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (options[lowerKey] !== undefined && options[lowerKey] !== null) return options[lowerKey];
    }
    return null;
  };

  // Map to the internal format expected by the frontend
  const mappedVariants = product.variants.edges.map(({ node: v }) => {
    const options = {};
    v.selectedOptions.forEach(o => { options[o.name.toLowerCase()] = o.value; });
    
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
      options
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
    category: product.category?.value || product.productType,
    complementaryProductIds: [], 
    matchingProductIds: []
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
