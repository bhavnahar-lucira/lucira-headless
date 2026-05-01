import { shopifyStorefrontFetch } from "@/lib/shopify";
import CollectionPageClient from "./CollectionPageClient";

export const revalidate = 3600; // Revalidate every hour

async function getCollectionMetadata(handle) {
  const query = `
    query CollectionSEO($handle: String!) {
      collectionByHandle(handle: $handle) {
        title
        description
        seo { title description }
        image { url altText }
      }
    }
  `;
  
  const data = await shopifyStorefrontFetch(query, { handle });
  return data?.collectionByHandle;
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  if (handle === "all") {
    return {
      title: "All Lab Grown Diamond Jewelry | Lucira Jewelry",
      description: "Explore our complete collection of ethically sourced, lab-grown diamond jewelry. From stunning rings to elegant necklaces, find your perfect piece at Lucira.",
    };
  }

  const collection = await getCollectionMetadata(handle);
  if (!collection) return {};

  return {
    title: collection.seo?.title || `${collection.title} | Lucira Jewelry`,
    description: collection.seo?.description || collection.description?.slice(0, 160),
    openGraph: {
      title: collection.seo?.title || collection.title,
      description: collection.seo?.description || collection.description?.slice(0, 160),
      images: collection.image ? [collection.image.url] : [],
    },
  };
}

export default async function Page({ params }) {
  return <CollectionPageClient params={params} />;
}
