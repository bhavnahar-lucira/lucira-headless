const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function checkCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('shopify_collections');
    const result = await collection.findOne({ handle: "all-rings" });
    console.log('Collection all-rings:', result);
    
    const count = await collection.countDocuments();
    console.log('Total shopify_collections:', count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkCollections();
