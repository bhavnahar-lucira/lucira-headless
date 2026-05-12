const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function createIndex() {
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    console.log("Creating index for redirects collection...");
    const result = await collection.createIndex({ path: 1 }, { unique: true });
    console.log("Path Index created:", result);

    const shopifyIdResult = await collection.createIndex({ shopifyId: 1 }, { unique: true });
    console.log("ShopifyId Index created:", shopifyIdResult);

  } catch (error) {
    console.error("Error creating index:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

createIndex();
