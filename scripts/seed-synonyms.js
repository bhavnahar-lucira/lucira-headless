const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const synonymData = [
  { title: "14KT", synonyms: ["14KT Collection", "14KT", "14 carat", "14carat", "14caratdiamond", "14 kt", "14karat", "14 karat"] },
  { title: "18KT Collection", synonyms: ["18KT Collection", "18KT", "18 KT", "18 carrat", "18caratdiamond", "18 carat"] },
  { title: "9KT Collection", synonyms: ["9", "9 Karat", "9K", "9kt", "Nine Carat", "9carat", "carrat", "9carat diamond", "9KTdiamond", "9 kt", "9KT Collection"] },
  { title: "All Jewelry", synonyms: ["Jewelry", "combo", "labgrown", "All Jewelry", "coins", "gh vs"] },
  { title: "bow", synonyms: ["Ribbion", "bow"] },
  { title: "Bracelets", synonyms: ["Bracelet", "Kada", "Bangle", "Chudi", "Bangdi", "wrist band", "hathband", "breselet", "breslets", "kangan", "braclet", "bracelte", "braslet", "breslet"] },
  { title: "Carat Range", synonyms: ["1 ct", "0.50 ct", "0.50ct", "1ct", "1 carat", "0.50 carat", "0.50 - 1.00 ct"] },
  { title: "Casual Rings", synonyms: ["Casual Ring", "Casual Rings", "cocketal", "valentines ring", "Cocktail ring"] },
  { title: "Chain Bracelets", synonyms: ["anklet", "anklets", "Chain Bracelets", "bajubandh", "bajuband", "Payal", "rakhi"] },
  { title: "champagne color", synonyms: ["shampange", "Champion", "champaign", "champane", "champayne", "shampagne", "champaigne", "champan", "shampane", "champangne", "champang"] },
  { title: "Cotton Candy", synonyms: ["enamel", "enamal"] },
  { title: "Couple Bands", synonyms: ["Couple Bands", "couple band"] },
  { title: "Earrings", synonyms: ["Butti", "कान के बाली", "jhumka", "Jumka", "Jhumkha", "kanphool", "कानफूल", "hoop", "chandbali", "baali", "studd", "studs", "studds", "Stud", "long earrings", "earrings", "ear cuffs", "kan ke baali", "bali earrings", "dangle"] },
  { title: "Fast Shipping", synonyms: ["fast sh", "Fast", "Quick", "quick delivery", "Fast Shipping"] },
  { title: "Gemstone Jewelry", synonyms: ["ruby", "Gemstone", "sapphire", "rubies", "colostone", "colorstone", "color stone", "sapphires", "saphires", "colourstone"] },
  { title: "Heart", synonyms: ["hreat", "Heart", "haret", "drilled heart"] },
  { title: "Mangalsutra", synonyms: ["Hand mangalsutra", "mangalsutra bracelet", "chain mangalsutra", "Mangalsutra", "mangal sutra ring", "mangal sutra"] },
  { title: "Men", synonyms: ["mens", "man", "men", "male", "gent", "gents", "men's"] },
  { title: "Mens Ring", synonyms: ["Band", "Men band", "boy", "Boys", "Mens ring", "mens rings", "Men's Ring"] },
  { title: "Necklaces", synonyms: ["necklace", "neckless", "Haar", "maala", "Mala", "nackless", "necklesh", "choker", "chocker", "Chain Necklaces", "Chain Pendants", "kundan", "tennis necklaces", "ranihara", "rani haar", "rani har"] },
  { title: "Nosepins", synonyms: ["Nose Pins", "nose pin", "noce ring", "noce rings", "ear cuff", "nose ring", "nathuni", "nosepins", "nath", "nose rings", "bali nosepin"] },
  { title: "Pendant", synonyms: ["Pendant", "Pendent", "Pendants", "Pendents", "locket", "loket"] },
  { title: "Rings", synonyms: ["Anguthi", "Anghuti", "Ring", "unguthi", "Diamond Rings", "aguti"] },
  { title: "Rings 1.00 - 1.49 ct", synonyms: ["Rings 1.00 - 1.49 ct", "1.00", "1.34", "1.49", "carat", "ct", "1.40 ct", "1.4ct", "1.4 ct"] },
  { title: "Sports Collection", synonyms: ["Sports Collection", "Sports edition", "bezel", "on the move", "sports collections", "sport", "sports"] },
  { title: "Tennis Bracelets", synonyms: ["Tennis Bracelets", "Baju Bandh", "baju band"] },
  { title: "Toi et Moi", synonyms: ["Two", "Two stone", "tohe mohe"] },
  { title: "Trilogy", synonyms: ["Triology", "Trio", "Three stone", "three"] },
  { title: "Unique", synonyms: ["unique", "unieke"] },
  { title: "White Gold", synonyms: ["silver bracelet", "white gold bracelets", "white bracelet", "white gold", "silver bracelets", "silver rings", "silver ring", "Silver earring", "silver earrings", "silver"] },
  { title: "Women", synonyms: ["women", "ladies", "Lady", "womens", "girl", "female", "ladiess"] }
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection("search_synonyms");

    console.log("Clearing existing synonyms...");
    await collection.deleteMany({});

    console.log(`Inserting ${synonymData.length} synonym groups...`);
    const dataWithTimestamps = synonymData.map(d => ({
      ...d,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await collection.insertMany(dataWithTimestamps);
    console.log("Seed successful!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await client.close();
  }
}

seed();
