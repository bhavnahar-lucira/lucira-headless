import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  
  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch (e) {
          isClosed = true;
        }
      };

      try {
        const client = await clientPromise;
        const db = client.db("next_local_db");
        const storesCollection = db.collection("stores");

        const stores = await storesCollection.find({}).toArray();
        if (stores.length === 0) {
          sendUpdate({ status: "error", message: "No stores found. Sync stores first." });
          if (!isClosed) controller.close();
          return;
        }

        sendUpdate({ status: "starting", message: `Calculating in-stock products for ${stores.length} stores...`, progress: 0 });

        let processedCount = 0;
        for (const store of stores) {
          if (isClosed) break;
          
          sendUpdate({ status: "progress", message: `Checking stock for ${store.name}...`, progress: Math.round((processedCount / stores.length) * 100) });
          
          let inStockCount = 0;
          let hasNextInventoryPage = true;
          let inventoryCursor = null;
          let safetyLimit = 0;

          // Fetch all pages of inventory levels
          while (hasNextInventoryPage && !isClosed && safetyLimit < 500) { // Safety limit of 125,000 items per store
            safetyLimit++;
            const invQuery = `
              query getInventory($locationId: ID!, $cursor: String) {
                location(id: $locationId) {
                  inventoryLevels(first: 250, after: $cursor) {
                    pageInfo { hasNextPage endCursor }
                    edges { 
                        node { 
                            quantities(names: ["available"]) {
                                quantity
                            }
                        } 
                    }
                  }
                }
              }
            `;

            const invResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": ACCESS_TOKEN,
              },
              body: JSON.stringify({ 
                query: invQuery, 
                variables: { 
                    locationId: store.shopifyId, 
                    cursor: inventoryCursor 
                } 
              }),
            });

            if (!invResponse.ok) throw new Error(`Shopify API Error (${invResponse.status})`);

            const invResult = await invResponse.json();
            if (invResult.errors) throw new Error(invResult.errors[0]?.message || "GraphQL Error");

            const invData = invResult.data?.location?.inventoryLevels;
            
            // Only count items that have available quantity > 0
            if (invData?.edges) {
                for (const edge of invData.edges) {
                    const available = edge.node.quantities?.[0]?.quantity || 0;
                    if (available > 0) {
                        inStockCount++;
                    }
                }
            }

            hasNextInventoryPage = invData?.pageInfo?.hasNextPage;
            inventoryCursor = invData?.pageInfo?.endCursor;
            
            // Throttling protection
            if (hasNextInventoryPage) await new Promise(r => setTimeout(r, 250));
          }

          await storesCollection.updateOne(
            { shopifyId: store.shopifyId },
            { $set: { productCount: inStockCount, updatedAt: new Date() } }
          );

          processedCount++;
        }

        if (!isClosed) {
            sendUpdate({ status: "complete", message: `Inventory update complete!`, progress: 100 });
            controller.close();
        }
      } catch (error) {
        console.error("Inventory Sync Error:", error);
        sendUpdate({ status: "error", message: `Sync Failed: ${error.message}` });
        if (!isClosed) controller.close();
      }
    },
    cancel() {
      isClosed = true;
    }
  });

  return new Response(stream, { 
    headers: { 
      "Content-Type": "application/x-ndjson", 
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    } 
  });
}
