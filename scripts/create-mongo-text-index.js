const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function createTextIndex() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('products');
    
    console.log('Creating text index on title, type, tags, and description...');
    const result = await collection.createIndex(
      { 
        title: "text", 
        type: "text", 
        tags: "text", 
        description: "text" 
      },
      {
        weights: {
          title: 10,
          type: 5,
          tags: 2,
          description: 1
        },
        name: "ProductTextIndex"
      }
    );
    
    console.log('Index created successfully:', result);
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    await client.close();
  }
}

createTextIndex();
