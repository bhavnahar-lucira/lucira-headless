import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch menu structure (only valid fields for Admin API)
    const menusQuery = `
      query {
        menus(first: 25) {
          nodes {
            id
            title
            handle
            items {
              id
              title
              url
              type
              resourceId
              items {
                id
                title
                url
                type
                resourceId
                items {
                  id
                  title
                  url
                  type
                  resourceId
                  items {
                    id
                    title
                    url
                    type
                    resourceId
                  }
                }
              }
            }
          }
        }
      }
    `;

    console.log("Fetching menus structure from Shopify Admin API...");
    const menusData = await shopifyAdminFetch(menusQuery);
    const menus = menusData.menus.nodes;

    if (!menus || menus.length === 0) {
      return NextResponse.json({ success: false, error: "No menus found" }, { status: 404 });
    }

    // 2. Collect all unique resource IDs (Collections, Products, etc.)
    const resourceIds = new Set();
    const traverseItems = (items) => {
      for (const item of items) {
        if (item.resourceId) {
          resourceIds.add(item.resourceId);
        }
        if (item.items && item.items.length > 0) {
          traverseItems(item.items);
        }
      }
    };

    menus.forEach(menu => traverseItems(menu.items));
    const uniqueIds = Array.from(resourceIds);

    // 3. Fetch metafields for these resources in batches
    console.log(`Fetching metafields for ${uniqueIds.length} resources...`);
    const resourceMap = {};
    
    // Shopify 'nodes' query allows fetching multiple IDs at once
    if (uniqueIds.length > 0) {
      // Split into batches of 50 to avoid query limits
      for (let i = 0; i < uniqueIds.length; i += 50) {
        const batch = uniqueIds.slice(i, i + 50);
        const resourcesQuery = `
          query($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on Collection {
                id
                handle
                image {
                  url
                }
                metafields(first: 20) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage {
                        image {
                          url
                        }
                      }
                      ... on GenericFile {
                        url
                      }
                    }
                  }
                }
              }
              ... on Product {
                id
                handle
                featuredImage {
                  url
                }
                metafields(first: 20) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage {
                        image {
                          url
                        }
                      }
                    }
                  }
                }
              }
              ... on Page {
                id
                handle
                metafields(first: 10) {
                  nodes {
                    namespace
                    key
                    value
                    type
                  }
                }
              }
            }
          }
        `;
        
        const resourceData = await shopifyAdminFetch(resourcesQuery, { ids: batch });
        if (resourceData.nodes) {
          resourceData.nodes.forEach(node => {
            if (node) resourceMap[node.id] = node;
          });
        }
      }
    }

    // 4. Attach resource data back to menu items and save to MongoDB
    const enrichItems = (items) => {
      return items.map(item => {
        const enriched = { ...item };
        if (item.resourceId && resourceMap[item.resourceId]) {
          enriched.resource = resourceMap[item.resourceId];
        }
        if (item.items && item.items.length > 0) {
          enriched.items = enrichItems(item.items);
        }
        return enriched;
      });
    };

    const collection = db.collection("menus");
    for (const menu of menus) {
      const enrichedMenu = {
        ...menu,
        items: enrichItems(menu.items),
        updatedAt: new Date()
      };

      await collection.updateOne(
        { handle: menu.handle },
        { $set: enrichedMenu },
        { upsert: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${menus.length} menus with resource metafields.`,
      count: menus.length,
      menuTitles: menus.map(m => m.title)
    });

  } catch (error) {
    console.error("Sync Menu Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
