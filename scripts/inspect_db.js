const { MongoClient } = require('mongodb');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/next_local_db";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("next_local_db");
    const products = await db.collection("products").find({}).limit(1).toArray();
    console.log("Sample product:", JSON.stringify(products[0], null, 2));

    const count = await db.collection("products").countDocuments();
    console.log("Total products:", count);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

test();
