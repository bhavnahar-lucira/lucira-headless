const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    
    const gemstoneData = [
      {
        color: "Pink",
        shape: "Marquise",
        pieces: "4",
        weight: "0.48"
      }
    ];

    const result = await db.collection("products").updateOne(
      { handle: "gemstone-diamond-wide-band-ring" },
      { $set: { "variants.$[].metafields.gemstones": gemstoneData } }
    );

    console.log(`Updated ${result.modifiedCount} products.`);
  } finally {
    await client.close();
  }
}

run();
