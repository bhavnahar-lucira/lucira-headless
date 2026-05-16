const { MongoClient } = require('mongodb');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createOptimizedIndexes() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/next_local_db";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const products = db.collection('products');

    console.log('Creating optimized indexes for filters...');

    // Base filter indexes
    await products.createIndex({ collectionHandles: 1 });
    await products.createIndex({ status: 1, isPublished: 1 });

    // Product-level filter indexes
    await products.createIndex({ "productMetafields.shop_for": 1 });
    await products.createIndex({ "productMetafields.weight": 1 });
    await products.createIndex({ "productMetafields.carat_range": 1 });
    await products.createIndex({ "productMetafields.material_type": 1 });
    await products.createIndex({ "productMetafields.finishing": 1 });
    await products.createIndex({ "productMetafields.fit": 1 });
    await products.createIndex({ type: 1 });
    await products.createIndex({ price: 1 });

    // Variant-level filter indexes
    await products.createIndex({ "variants.metafields.in_store_available": 1 });
    await products.createIndex({ "variants.metafields.ring_size_inventory": 1 });
    await products.createIndex({ "variants.metafields.metal_purity": 1 });
    await products.createIndex({ "variants.metafields.diamonds.shape": 1 });
    await products.createIndex({ "variants.metafields.gemstones.shape": 1 });

    console.log('Optimized indexes created successfully.');
  } catch (err) {
    console.warn('Could not create indexes (likely DB connection issue in CI):', err.message);
  } finally {
    await client.close();
  }
}

createOptimizedIndexes();
