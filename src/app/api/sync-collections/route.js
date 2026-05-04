import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    let hasNextPage = true;
    let cursor = null;
    const allCollections = [];

    while (hasNextPage) {
      const query = `
        query GetCollections($first: Int!, $after: String) {
          collections(first: $first, after: $after) {
            edges {
              node {
                id
                title
                handle
                description
                descriptionHtml
                image {
                  url
                  altText
                }
                metafields(first: 50) {
                  edges {
                    node {
                      namespace
                      key
                      value
                    }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const data = await shopifyAdminFetch(query, {
        first: 50,
        after: cursor,
      });

      const collections = data.collections.edges.map((edge) => {
        const node = edge.node;
        const metafields = {};
        node.metafields.edges.forEach((mEdge) => {
          const m = mEdge.node;
          metafields[`${m.namespace}.${m.key}`] = m.value;
        });

        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          descriptionHtml: node.descriptionHtml,
          image: node.image,
          metafields,
          updatedAt: new Date(),
        };
      });

      allCollections.push(...collections);
      hasNextPage = data.collections.pageInfo.hasNextPage;
      if (hasNextPage) {
        cursor = data.collections.pageInfo.endCursor;
      }
    }

    if (allCollections.length > 0) {
      const collectionStore = db.collection("collections");
      const ops = allCollections.map((col) => ({
        updateOne: {
          filter: { handle: col.handle },
          update: { $set: col },
          upsert: true,
        },
      }));
      await collectionStore.bulkWrite(ops);
    }

    return NextResponse.json({
      success: true,
      count: allCollections.length,
    });
  } catch (error) {
    console.error("Collection sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
