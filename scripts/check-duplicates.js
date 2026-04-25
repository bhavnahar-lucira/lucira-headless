const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function checkSpecificPincodes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection('pincodes');
    
    const pincodesToCheck = ["400066", "400071", "400062"];
    console.log('Checking pincodes:', pincodesToCheck);
    
    const results = await collection.find({ pincode: { $in: pincodesToCheck } }).toArray();
    
    console.log('Results:');
    results.forEach(res => {
      console.log(`Pincode: ${res.pincode}, Lat: ${res.latitude}, Long: ${res.longitude}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkSpecificPincodes();
