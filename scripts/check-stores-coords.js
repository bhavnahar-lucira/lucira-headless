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
    console.log('Stores Data:');
    stores.forEach(s => {
        console.log(`- ${s.name}: Lat: ${s.latitude}, Lng: ${s.longitude}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkStores();
