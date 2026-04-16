const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
console.log('Testing URI:', uri);

async function test() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully');
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged successfully');
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.close();
  }
}

test();
