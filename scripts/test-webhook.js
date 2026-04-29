const crypto = require('crypto');
const axios = require('axios');

// This matches your .env.local secret
const SECRET = 'test_secret'; 
const TARGET_URL = 'http://localhost:3000/api/webhooks/shopify';

const payload = {
  id: 123456789,
  title: "Test Local Product",
  handle: "test-local-product",
  body_html: "This is a test description from a local script",
  vendor: "Lucira",
  product_type: "Ring",
  status: "active",
  tags: "test, local, webhook",
  variants: [
    {
      id: 987654321,
      title: "Gold / 10",
      price: "15000.00",
      sku: "TEST-SKU-001",
      inventory_quantity: 5
    }
  ]
};

const rawBody = JSON.stringify(payload);

// Generate the HMAC that your API expects
const hmac = crypto
  .createHmac('sha256', SECRET)
  .update(rawBody, 'utf8')
  .digest('base64');

async function sendWebhook() {
  console.log('🚀 Sending mock webhook to:', TARGET_URL);
  try {
    const response = await axios.post(TARGET_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'products/update',
        'X-Shopify-Hmac-Sha256': hmac,
        'X-Shopify-Event-Id': `test_event_${Date.now()}`,
        'X-Shopify-Shop-Domain': 'luciraonline.myshopify.com'
      }
    });
    console.log('✅ Status:', response.status, response.data);
    console.log('📊 Check your dashboard at http://localhost:3000/dashboard/webhooks');
  } catch (error) {
    console.error('❌ Failed:', error.response?.status, error.response?.data || error.message);
    console.log('\nTip: Make sure your server is running on port 3000 and SHOPIFY_WEBHOOK_SECRET=test_secret is in .env.local');
  }
}

sendWebhook();
