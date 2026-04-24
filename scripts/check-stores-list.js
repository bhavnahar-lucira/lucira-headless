const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function checkStores() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('stores');
    const stores = await collection.find({}).toArray();
    console.log('Stores:', JSON.stringify(stores.map(s => ({ name: s.name, shopifyId: s.shopifyId })), null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkStores();
