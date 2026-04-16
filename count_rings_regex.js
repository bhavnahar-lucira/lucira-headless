const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function countAllRingsFilter() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('next_local_db');
    const filter = {
      $or: [
        { collectionHandles: { $regex: 'ring', $options: 'i' } },
        { type: { $regex: 'ring', $options: 'i' } },
        { tags: { $regex: 'ring', $options: 'i' } },
        { title: { $regex: 'ring', $options: 'i' } }
      ]
    };
    const count = await db.collection('products').countDocuments(filter);
    console.log('Total products matching all-rings filter:', count);
  } finally {
    await client.close();
  }
}

countAllRingsFilter();