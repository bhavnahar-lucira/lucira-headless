const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkStores() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const stores = await client.db().collection('stores').find({}).toArray();
    console.log('Stores in DB:');
    stores.forEach(s => {
      console.log(`Name: ${s.name}, ID: ${s.shopifyId}, Pincode: ${s.pincode}`);
    });
  } finally {
    await client.close();
  }
}
checkStores();
