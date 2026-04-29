require('dotenv').config({ path: '.env.local' });

const SHOP_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // e.g., https://your-domain.com/api/webhooks/shopify

if (!SHOP_DOMAIN || !ADMIN_TOKEN || !WEBHOOK_URL) {
  console.error('❌ Missing environment variables. Please ensure .env.local has:');
  console.error('   SHOPIFY_STORE, SHOPIFY_ADMIN_TOKEN, and WEBHOOK_URL');
  process.exit(1);
}

const GRAPHQL_URL = `https://${SHOP_DOMAIN}/admin/api/2024-01/graphql.json`;

const REGISTER_MUTATION = `
mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
    webhookSubscription {
      id
      topic
      format
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const CHECK_QUERY = `
{
  webhookSubscriptions(first: 50) {
    edges {
      node {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
}
`;

async function registerWebhook() {
  console.log(`🔍 Checking existing webhooks for ${SHOP_DOMAIN}...`);

  try {
    // 1. Check if already exists
    const checkRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({ query: CHECK_QUERY }),
    });

    const checkData = await checkRes.json();
    const existing = checkData.data?.webhookSubscriptions?.edges || [];
    
    const alreadyRegistered = existing.find(edge => 
      edge.node.topic === 'METAFIELDS_UPDATE' && 
      edge.node.endpoint.callbackUrl === WEBHOOK_URL
    );

    if (alreadyRegistered) {
      console.log(`✅ Webhook for METAFIELDS_UPDATE is already registered at ${WEBHOOK_URL}`);
      return;
    }

    // 2. Register new webhook
    console.log(`🚀 Registering METAFIELDS_UPDATE webhook to ${WEBHOOK_URL}...`);
    const regRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: REGISTER_MUTATION,
        variables: {
          topic: 'METAFIELDS_UPDATE',
          webhookSubscription: {
            callbackUrl: WEBHOOK_URL,
            format: 'JSON',
          },
        },
      }),
    });

    const regData = await regRes.json();

    if (regData.data?.webhookSubscriptionCreate?.userErrors?.length > 0) {
      console.error('❌ Error registering webhook:', regData.data.webhookSubscriptionCreate.userErrors);
    } else if (regData.data?.webhookSubscriptionCreate?.webhookSubscription) {
      console.log('✅ Success! Webhook ID:', regData.data.webhookSubscriptionCreate.webhookSubscription.id);
    } else {
      console.error('❌ Unexpected response:', JSON.stringify(regData, null, 2));
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

registerWebhook();
