const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Sends a GET request to a URL to trigger server-side rendering and caching.
 */
async function warmUrl(url) {
  try {
    const start = Date.now();
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CacheWarmer/1.0',
      },
    });
    const duration = Date.now() - start;
    console.log(`[${res.status}] ${url} (${duration}ms)`);
  } catch (err) {
    console.error(`❌ Failed to warm ${url}:`, err.message);
  }
}

async function run() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in environment variables.");
    process.exit(1);
  }

  console.log(`🚀 Starting Cache Warming on ${BASE_URL}...`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("next_local_db");

    // 1. Get Product Handles
    console.log("Fetching product handles...");
    const products = await db.collection("products")
      .find({ status: "ACTIVE", isPublished: true }, { projection: { handle: 1 } })
      .toArray();
    const productUrls = products.map(p => `${BASE_URL}/products/${p.handle}`);

    // 2. Get Collection Handles
    console.log("Fetching collection handles...");
    const collections = await db.collection("shopify_collections")
      .find({}, { projection: { handle: 1 } })
      .toArray();
    const collectionUrls = collections.map(c => `${BASE_URL}/collections/${c.handle}`);
    collectionUrls.push(`${BASE_URL}/collections/all`);

    // 3. Get Blog Article Handles
    console.log("Fetching article handles...");
    const articles = await db.collection("articles")
      .find({}, { projection: { handle: 1, blogHandle: 1 } })
      .toArray();
    const articleUrls = articles.map(a => `${BASE_URL}/blogs/${a.blogHandle}/${a.handle}`);

    // 4. Get Custom Page Handles
    console.log("Fetching custom page handles...");
    const pages = await db.collection("pages")
      .find({}, { projection: { handle: 1 } })
      .toArray();
    const customPageUrls = pages.map(p => `${BASE_URL}/pages/${p.handle}`);

    // 5. Static and Key Pages
    const staticUrls = [
      `${BASE_URL}/`,
      `${BASE_URL}/login`,
      `${BASE_URL}/register`,
      `${BASE_URL}/reviews`,
      `${BASE_URL}/search`,
    ];

    const allUrls = [...new Set([...staticUrls, ...collectionUrls, ...productUrls, ...articleUrls, ...customPageUrls])];
    console.log(`📋 Total URLs to warm: ${allUrls.length}`);

    // Batching to avoid overwhelming the server (concurrency: 5)
    const batchSize = 5;
    for (let i = 0; i < allUrls.length; i += batchSize) {
      const batch = allUrls.slice(i, i + batchSize);
      console.log(`Warming batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allUrls.length / batchSize)}...`);
      await Promise.all(batch.map(url => warmUrl(url)));
      
      // Small delay between batches to stay under rate limits
      if (i + batchSize < allUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log("✅ Cache warming completed successfully.");
  } catch (error) {
    console.error("❌ Critical error during cache warming:", error);
  } finally {
    await client.close();
  }
}

run();
