import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/ProductPageClient";

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
  };
}

async function getProduct(handle) {
  const client = await clientPromise;
  const db = client.db("next_local_db");
  const product = await db.collection("products").findOne({ handle });

  if (product) {
    // Convert MongoDB ObjectId to string for Client Component serialization
    product._id = product._id.toString();
    if (product.lastUpdated instanceof Date) product.lastUpdated = product.lastUpdated.toISOString();
    if (product.createdAt instanceof Date) product.createdAt = product.createdAt.toISOString();
  }

  return product;
}

async function getComplementaryProducts(product) {
  if (!product.complementaryProductIds || product.complementaryProductIds.length === 0) {
    return [];
  }

  const client = await clientPromise;
  const db = client.db("next_local_db");
  
  // Support both full GID and numeric ID strings using regex for shopifyId
  const idFilters = product.complementaryProductIds.map(id => ({
    shopifyId: { $regex: `${id}$` }
  }));

  const complementaryProducts = await db.collection("products")
    .find({ $or: idFilters })
    .toArray();

  console.log(`Product: ${product.handle}, Found ${complementaryProducts.length} complementary products.`);

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
  
  const idFilters = product.matchingProductIds.map(id => ({
    shopifyId: { $regex: `${id}$` }
  }));

  const matchingProducts = await db.collection("products")
    .find({ $or: idFilters })
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

  return (
    <ProductPageClient 
      product={product} 
      complementaryProducts={complementaryProducts} 
      matchingProducts={matchingProducts} 
    />
  );
}

