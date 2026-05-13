const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SHOP_DOMAIN = process.env.SHOPIFY_STORE ? (process.env.SHOPIFY_STORE.includes('.') ? process.env.SHOPIFY_STORE : `${process.env.SHOPIFY_STORE}.myshopify.com`) : 'luciraonline.myshopify.com';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

async function test() {
  console.log('Testing Shopify connection...');
  console.log('SHOP_DOMAIN:', SHOP_DOMAIN);
  console.log('ADMIN_TOKEN defined:', !!ADMIN_TOKEN);

  const url = `https://${SHOP_DOMAIN}/admin/api/2024-10/shop.json`;
  console.log('Hitting URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify([...response.headers.entries()]));
    const text = await response.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
