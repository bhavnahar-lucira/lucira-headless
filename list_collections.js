const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017/next_local_db";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("next_local_db");
        const collections = await db.collection("shopify_collections").find({}).toArray();
        console.log("Collections in DB:");
        collections.forEach(c => {
            console.log(`- ${c.title} (handle: ${c.handle})`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
