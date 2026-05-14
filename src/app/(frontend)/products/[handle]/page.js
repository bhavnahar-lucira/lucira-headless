import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/ProductPageClient";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return {};

  return {
    title: product.seo?.title || `${product.title} | Lucira Jewelry`,
    description: product.seo?.description || product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160),
    openGraph: {
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160),
      images: [product.image],
    },
    alternates: {
      canonical: `/products/${handle}`,
    },
  };
}

async function getProduct(handle) {
  const client = await clientPromise;
  const db = client.db("next_local_db");
  const product = await db.collection("products").findOne({ handle, status: "ACTIVE", isPublished: true });

  if (product) {
    // Convert MongoDB ObjectId to string for Client Component serialization
    product._id = product._id.toString();
    if (product.lastUpdated instanceof Date) product.lastUpdated = product.lastUpdated.toISOString();
    if (product.createdAt instanceof Date) product.createdAt = product.createdAt.toISOString();
  }

  return product;
}

function normalizeShopifyId(id) {
  if (!id) return null;
  if (String(id).includes("gid://shopify/Product/")) return String(id);
  return `gid://shopify/Product/${String(id).trim()}`;
}

async function getComplementaryProducts(product) {
  if (!product.complementaryProductIds || product.complementaryProductIds.length === 0) {
    return [];
  }

  const client = await clientPromise;
  const db = client.db("next_local_db");
  const normalizedIds = product.complementaryProductIds
    .map(normalizeShopifyId)
    .filter(Boolean);

  if (!normalizedIds.length) {
    return [];
  }

  const complementaryProducts = await db.collection("products")
    .find({ 
      shopifyId: { $in: normalizedIds },
      status: "ACTIVE",
      isPublished: true
    })
    .toArray();


  return complementaryProducts.map(p => {
    p._id = p._id.toString();
    if (p.lastUpdated instanceof Date) p.lastUpdated = p.lastUpdated.toISOString();
    if (p.createdAt instanceof Date) p.createdAt = p.createdAt.toISOString();
    return p;
  });
}

async function getMatchingProducts(product) {
  if (!product.matchingProductIds || product.matchingProductIds.length === 0) {
    return [];
  }

  const client = await clientPromise;
  const db = client.db("next_local_db");
  const normalizedIds = product.matchingProductIds
    .map(normalizeShopifyId)
    .filter(Boolean);

  if (!normalizedIds.length) {
    return [];
  }

  const matchingProducts = await db.collection("products")
    .find({ 
      shopifyId: { $in: normalizedIds },
      status: "ACTIVE",
      isPublished: true
    })
    .toArray();

  return matchingProducts.map(p => {
    p._id = p._id.toString();
    if (p.lastUpdated instanceof Date) p.lastUpdated = p.lastUpdated.toISOString();
    if (p.createdAt instanceof Date) p.createdAt = p.createdAt.toISOString();
    return p;
  });
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const [complementaryProducts, matchingProducts] = await Promise.all([
    getComplementaryProducts(product),
    getMatchingProducts(product)
  ]);

  const jsonLd = getProductSchema(product);
  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(product.category ? [{ name: product.category, url: `/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { name: product.title, url: `/products/${product.handle}` }
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
        product={product} 
        complementaryProducts={complementaryProducts} 
        matchingProducts={matchingProducts} 
      />
    </>
  );
}

