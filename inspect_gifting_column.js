const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function inspectGiftingColumn() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const menu = await db.collection("menus").findOne({ handle: "main-menu-official" });
    
    if (!menu) return;

    const gifting = menu.items.find(item => item.title.toUpperCase() === "GIFTING");
    if (!gifting) return;

    const shopFor = gifting.items.find(child => child.title.toLowerCase() === "shop for");
    if (shopFor) {
      console.log("Shop For column metafields:");
      const meta = shopFor.resource?.metafields?.nodes || [];
      meta.forEach(m => {
          console.log(`  [${m.namespace}.${m.key}] : ${m.value}`);
      });
    }

  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await client.close();
  }
}

inspectGiftingColumn();
