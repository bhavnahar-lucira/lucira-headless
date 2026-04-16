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
        const products = db.collection("products");

        const counts = await products.aggregate([
            { $match: { collectionHandles: "jewelry" } },
            { $unwind: "$variants" },
            { $unwind: "$variants.metafields.in_store_available" },
            { $group: { _id: "$variants.metafields.in_store_available", productIds: { $addToSet: "$_id" } } },
            { $project: { store: "$_id", count: { $size: "$productIds" } } },
            { $sort: { store: 1 } }
        ]).toArray();

        console.log("In Store Available Counts (per unique product):");
        console.log(JSON.stringify(counts, null, 2));

        // Let's check a few products where in_store might be different across variants
        const multiVariant = await products.findOne({
            "variants.1": { $exists: true },
            "variants.metafields.in_store_available": { $exists: true }
        });
        
        if (multiVariant) {
            console.log("\nSample multi-variant product:", multiVariant.handle);
            multiVariant.variants.forEach((v, i) => {
                console.log(`Variant ${i} (${v.color || v.title}):`, v.metafields?.in_store_available);
            });
        }

    } finally {
        await client.close();
    }
}

checkStores();
