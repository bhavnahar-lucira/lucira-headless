const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function clean() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const products = db.collection("products");

    console.log("Cleaning fallback reviews (count: 495)...");
    const result = await products.updateMany(
      { "reviewStats.count": 495 },
      { $set: { "reviewStats.count": 0, "reviewStats.average": 0 } }
    );

    console.log(`Cleaned ${result.modifiedCount} products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

clean();
