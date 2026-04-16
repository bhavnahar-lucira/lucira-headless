const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const product = await db.collection("products").findOne({ 'variants.metafields.gemstones': { $exists: true } });
    if (product) {
        console.log("Found product with gemstones:", product.handle);
        const variant = product.variants.find(v => v.metafields && v.metafields.gemstones);
        console.log("Gemstone data:", JSON.stringify(variant.metafields.gemstones, null, 2));
    } else {
        console.log("No product with gemstones found in DB");
    }
  } finally {
    await client.close();
  }
}

run();
