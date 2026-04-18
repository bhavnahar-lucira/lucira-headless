const { MongoClient } = require('mongodb');
const uri = "mongodb://admin:password123@localhost:27017/next_local_db?authSource=admin";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('next_local_db');
    const p = await db.collection('products').findOne({ title: { $regex: "Princess Cut Diamond Men's Classic Ring", $options: 'i' } });
    if (p) {
      console.log("PRODUCT RELATIONS:");
      console.log("- Title:", p.title);
      console.log("- matchingProductIds:", p.matchingProductIds);
      console.log("- complementaryProductIds:", p.complementaryProductIds);
      
      if (p.matchingProductIds && p.matchingProductIds.length > 0) {
          const idFilters = p.matchingProductIds.map(id => ({
            shopifyId: { $regex: `${id}$` }
          }));
          const matching = await db.collection("products").find({ $or: idFilters }).toArray();
          console.log("- Found matching products in DB:", matching.length);
          matching.forEach(m => console.log(`  * ${m.title} (${m.shopifyId})`));
      }
    } else {
      console.log("Product not found");
    }
  } finally {
    await client.close();
  }
}
run();
