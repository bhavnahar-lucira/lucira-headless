const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    
    console.log("--- Products with 'gemstone' in title, tags, or handle ---");
    const products = await db.collection("products").find({
      $or: [
        { title: { $regex: /gemstone/i } },
        { tags: { $regex: /gemstone/i } },
        { handle: { $regex: /gemstone/i } },
        { type: { $regex: /gemstone/i } }
      ]
    }).limit(10).toArray();

    console.log(`Found ${products.length} products total.`);
    
    products.forEach(p => {
      console.log(`\nTitle: ${p.title}`);
      console.log(`Type: ${p.type}`);
      console.log(`Tags: ${p.tags}`);
      console.log(`Handle: ${p.handle}`);
      const hasGemMeta = p.variants?.[0]?.metafields?.gemstones ? "YES" : "NO";
      console.log(`Has Gemstone Metafields: ${hasGemMeta}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
