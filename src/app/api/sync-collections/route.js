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
                ruleSet {
                  rules {
                    column
                    condition
                    relation
                  }
                }
                metafields(first: 50) {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                      reference {
                        ... on Collection {
                          products(first: 10) {
                            edges {
                              node {
                                title
                                handle
                                featuredImage {
                                  url
                                }
                                priceRangeV2 {
                                  minVariantPrice {
                                    amount
                                    currencyCode
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
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
        let bestsellerProducts = null;

        node.metafields.edges.forEach((mEdge) => {
          const m = mEdge.node;
          metafields[`${m.namespace}.${m.key}`] = m.value;

          // Capture bestseller products if this is the specific metafield
          if (m.namespace === "custom" && m.key === "bestseller_products" && m.reference?.products) {
            bestsellerProducts = m.reference.products.edges.map(pEdge => ({
              title: pEdge.node.title,
              handle: pEdge.node.handle,
              image: pEdge.node.featuredImage?.url || null,
              price: pEdge.node.priceRangeV2.minVariantPrice.amount,
              currency: pEdge.node.priceRangeV2.minVariantPrice.currencyCode
            }));
          }
        });

        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          descriptionHtml: node.descriptionHtml,
          image: node.image,
          ruleSet: node.ruleSet,
          metafields,
          bestsellerProducts,
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
