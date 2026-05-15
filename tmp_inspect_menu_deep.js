const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

async function inspectMenuDeep() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const menu = await db.collection("menus").findOne({ handle: "main-menu-official" });

    if (!menu) {
      console.log("Menu not found");
      return;
    }

    function checkItem(item, level = 0) {
        const indent = "  ".repeat(level);
        const metafields = item.resource?.metafields?.nodes || [];
        const menuIcon = metafields.find(m => m.namespace === "custom" && m.key === "menu_links_image_icon");
        const megaMenuImage = metafields.find(m => m.namespace === "custom" && m.key === "mega_menu_image");
        const icon = metafields.find(m => m.namespace === "custom" && m.key === "icon");
        
        console.log(`${indent}- ${item.title} (level ${level}):`);
        if (menuIcon) {
            console.log(`${indent}  menu_links_image_icon: ${menuIcon.value}`);
            if (menuIcon.reference) {
                const url = menuIcon.reference.image?.url || menuIcon.reference.url;
                console.log(`${indent}  menu_links_image_icon_url: ${url}`);
            } else {
                console.log(`${indent}  menu_links_image_icon: NO REFERENCE`);
            }
        }
        if (megaMenuImage) console.log(`${indent}  mega_menu_image: ${megaMenuImage.value}`);
        if (icon) console.log(`${indent}  icon: ${icon.value}`);
        
        if (!menuIcon && !megaMenuImage && !icon && level > 0) {
            // console.log(`${indent}  NO ICONS`);
        }

        if (item.items && item.items.length > 0) {
            item.items.forEach(child => checkItem(child, level + 1));
        }
    }

    console.log("Inspecting Menu Hierarchy:");
    menu.items.forEach(item => checkItem(item, 0));

  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

inspectMenuDeep();
