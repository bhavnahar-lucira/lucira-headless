const clientPromise = require("./src/lib/mongodb");

async function cleanFallbackReviews() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");

    console.log("Cleaning up potential fallback reviews from products...");

    // We look for products that have the suspected fallback count of 495
    // and an average of 4.7, which matches the user's screenshot.
    const result = await productsCollection.updateMany(
      { 
        $or: [
          { "reviewStats.count": 495, "reviewStats.average": 4.7 },
          { "reviewStats.count": 495, "reviewStats.average": "4.7" }
        ]
      },
      { 
        $set: { 
          "reviewStats.count": 0, 
          "reviewStats.average": 0,
          "reviewStats.isFallback": true // Mark it so we know
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning fallback reviews:", error);
    process.exit(1);
  }
}

cleanFallbackReviews();
