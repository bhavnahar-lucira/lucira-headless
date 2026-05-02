const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SHOP = process.env.SHOPIFY_STORE || "luciraonline.myshopify.com";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

async function fetchCollections() {
  const query = `
    query {
      collections(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            image { url altText }
            faqQuestion: metafield(namespace: "custom", key: "FaqQuestion") { value }
            faqAnswers: metafield(namespace: "custom", key: "FaqAnswers") { value }
            seoContent: metafield(namespace: "custom", key: "seocontent") { value }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  if (data.errors) {
    console.error("Shopify Errors:", data.errors);
    return [];
  }
  return data.data.collections.edges.map(e => e.node);
}

async function syncCollections() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('shopify_collections');

    console.log("Fetching collections from Shopify...");
    const shopifyCollections = await fetchCollections();
    console.log(`Fetched ${shopifyCollections.length} collections.`);

    const ops = shopifyCollections.map(col => ({
      updateOne: {
        filter: { handle: col.handle },
        update: {
          $set: {
            shopifyId: col.id,
            title: col.title,
            handle: col.handle,
            description: col.description,
            descriptionHtml: col.descriptionHtml,
            image: col.image,
            faqQuestion: col.faqQuestion?.value || null,
            faqAnswers: col.faqAnswers?.value || null,
            seoContent: col.seoContent?.value || null,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    if (ops.length > 0) {
      const result = await collection.bulkWrite(ops);
      console.log(`Successfully synced ${result.upsertedCount + result.modifiedCount} collections.`);
    } else {
      console.log("No collections to sync.");
    }

  } catch (error) {
    console.error("Sync Error:", error);
  } finally {
    await client.close();
  }
}

syncCollections();
