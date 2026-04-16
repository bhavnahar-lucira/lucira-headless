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
    const product = await db.collection("products").findOne({ handle: "gemstone-diamond-wide-band-ring" });
    
    if (product && product.variants && product.variants.length > 0) {
        console.log("First Variant pricingRef:");
        console.log(JSON.stringify(product.variants[0].pricingRef, null, 2));
    } else {
        console.log("Product or variants not found");
    }
  } finally {
    await client.close();
  }
}

run();
