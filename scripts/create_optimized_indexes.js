const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb://admin:password123@localhost:27017/next_local_db?authSource=admin";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("next_local_db");
        const products = db.collection("products");

        console.log("Creating optimized indexes for product filtering...");

        // Base indexes for common queries
        await products.createIndex({ status: 1, isPublished: 1 });
        await products.createIndex({ collectionHandles: 1 });
        await products.createIndex({ handle: 1 });
        await products.createIndex({ price: 1 });
        await products.createIndex({ type: 1 });

        // Metafield indexes
        await products.createIndex({ "productMetafields.shop_for": 1 });
        await products.createIndex({ "productMetafields.weight": 1 });
        await products.createIndex({ "productMetafields.carat_range": 1 });
        await products.createIndex({ "productMetafields.material_type": 1 });
        await products.createIndex({ "productMetafields.finishing": 1 });
        await products.createIndex({ "productMetafields.fit": 1 });

        // Variant-level indexes
        await products.createIndex({ "variants.metafields.in_store_available": 1 });
        await products.createIndex({ "variants.metafields.ring_size_inventory": 1 });
        await products.createIndex({ "variants.metafields.metal_purity": 1 });
        await products.createIndex({ "variants.metafields.diamonds.shape": 1 });
        await products.createIndex({ "variants.metafields.gemstones.shape": 1 });

        // Compound indexes for common filter combinations
        await products.createIndex({ collectionHandles: 1, status: 1, price: 1 });

        console.log("Successfully created optimized indexes.");
    } catch (err) {
        console.error("Error creating indexes:", err);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
