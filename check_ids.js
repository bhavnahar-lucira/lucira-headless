const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('next_local_db');
    const products = await db.collection('products').find({}).limit(5).toArray();
    console.log("DB SAMPLE PRODUCTS:");
    products.forEach(p => {
      console.log(`Title: ${p.title}`);
      console.log(`ShopifyId: ${p.shopifyId}`);
      console.log(`Collections: ${JSON.stringify(p.collectionHandles)}`);
      console.log('---');
    });
  } finally {
    await client.close();
  }
}
run();
