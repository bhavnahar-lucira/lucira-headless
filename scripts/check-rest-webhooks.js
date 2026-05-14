require('dotenv').config({ path: '.env.local' });

const SHOP_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

async function checkRestWebhooks() {
  const url = `https://${SHOP_DOMAIN}/admin/api/2024-01/webhooks.json`;
  console.log(`🔍 Checking REST webhooks for ${SHOP_DOMAIN}...`);

  try {
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    console.log('REST Webhooks Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ REST API check failed:', error.message);
  }
}

checkRestWebhooks();
