import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch menu structure
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

    // 2. Collect unique resource IDs
    const resourceIds = new Set();
    const traverseItems = (items) => {
      for (const item of items) {
        if (item.resourceId) resourceIds.add(item.resourceId);
        if (item.items && item.items.length > 0) traverseItems(item.items);
      }
    };
    menus.forEach(menu => traverseItems(menu.items));
    const uniqueIds = Array.from(resourceIds);

    // 3. Fetch resource details (with fields from Liquid file)
    const resourceMap = {};
    if (uniqueIds.length > 0) {
      for (let i = 0; i < uniqueIds.length; i += 50) {
        const batch = uniqueIds.slice(i, i + 50);
        const resourcesQuery = `
          query($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on Collection {
                id
                handle
                productsCount {
                  count
                }
                image { url }
                metafields(first: 25) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage { image { url } }
                      ... on GenericFile { url }
                    }
                  }
                }
              }
              ... on Product {
                id
                handle
                featuredImage { url }
                metafields(first: 25) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage { image { url } }
                      ... on GenericFile { url }
                    }
                  }
                }
              }
              ... on Page {
                id
                handle
                metafields(first: 25) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage { image { url } }
                      ... on GenericFile { url }
                    }
                  }
                }
              }
              ... on Article {
                id
                handle
                image { url }
                metafields(first: 25) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage { image { url } }
                      ... on GenericFile { url }
                    }
                  }
                }
              }
              ... on Blog {
                id
                handle
                metafields(first: 25) {
                  nodes {
                    namespace
                    key
                    value
                    type
                    reference {
                      ... on MediaImage { image { url } }
                      ... on GenericFile { url }
                    }
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

    // 4. Enrich and Save
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
      await collection.updateOne({ handle: menu.handle }, { $set: enrichedMenu }, { upsert: true });
    }

    return NextResponse.json({ success: true, count: menus.length });
  } catch (error) {
    console.error("Sync Menu Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
