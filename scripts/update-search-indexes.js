const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function updateIndexes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('products');
    
    console.log('Creating unique index on shopifyId...');
    await collection.createIndex({ shopifyId: 1 }, { unique: true });

    console.log('Creating index on handle...');
    await collection.createIndex({ handle: 1 });

    console.log('Creating index on variants.sku...');
    await collection.createIndex({ "variants.sku": 1 });

    console.log('Creating index on title...');
    await collection.createIndex({ title: 1 });

    console.log('Dropping old text index if exists...');
    try {
      await collection.dropIndex("ProductTextIndex");
    } catch (e) {
      console.log('Old text index not found, skipping drop.');
    }

    console.log('Creating new text index with handle and sku included...');
    const result = await collection.createIndex(
      { 
        title: "text", 
        type: "text", 
        tags: "text", 
        description: "text",
        handle: "text",
        "variants.sku": "text"
      },
      {
        weights: {
          "variants.sku": 25,
          handle: 20,
          title: 10,
          type: 5,
          tags: 2,
          description: 1
        },
        name: "ProductTextIndex"
      }
    );
    
    console.log('Indexes updated successfully:', result);
  } catch (err) {
    console.error('Error updating indexes:', err);
  } finally {
    await client.close();
  }
}

updateIndexes();
