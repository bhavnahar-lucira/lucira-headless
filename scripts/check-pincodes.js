const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function checkPincodes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('pincodes');
    const sample = await collection.findOne({});
    console.log('Sample Pincode:', JSON.stringify(sample, null, 2));
    const count = await collection.countDocuments();
    console.log('Total Pincodes:', count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkPincodes();
