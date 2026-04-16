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
    
    // Search for any product where at least one variant has gemstone metafields
    const products = await db.collection("products").find({
      "variants.metafields.gemstones": { $exists: true }
    }).toArray();
    
    console.log(`Found ${products.length} products with gemstone metafields.`);
    
    if (products.length > 0) {
        products.forEach(p => {
            console.log(`Product: ${p.handle}`);
            const variantWithGemstones = p.variants.find(v => v.metafields && v.metafields.gemstones);
            console.log("Gemstone data:", JSON.stringify(variantWithGemstones.metafields.gemstones, null, 2));
        });
    } else {
        // Maybe it's named differently? Let's check for any metafield with 'gem' in its name
        console.log("Checking for any metafield starting with 'gem'...");
        const allProducts = await db.collection("products").find({}).limit(100).toArray();
        let found = false;
        allProducts.forEach(p => {
            p.variants?.forEach(v => {
                const keys = Object.keys(v.metafields || {});
                const gemKeys = keys.filter(k => k.toLowerCase().includes('gem'));
                if (gemKeys.length > 0) {
                    console.log(`Product ${p.handle} has variant with gem keys: ${gemKeys}`);
                    console.log(`Value: ${JSON.stringify(v.metafields[gemKeys[0]], null, 2)}`);
                    found = true;
                }
            });
        });
        if (!found) console.log("No gem-related metafields found in first 100 products.");
    }
  } finally {
    await client.close();
  }
}

run();
