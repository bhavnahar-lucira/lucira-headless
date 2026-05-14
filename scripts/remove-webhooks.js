require('dotenv').config({ path: '.env.local' });

const SHOP_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

console.log('Environment Check:');
console.log('- SHOP_DOMAIN:', SHOP_DOMAIN);
console.log('- ADMIN_TOKEN:', ADMIN_TOKEN ? 'Present (Hidden)' : 'MISSING');

if (!SHOP_DOMAIN || !ADMIN_TOKEN) {
  console.error('❌ Missing environment variables. Please ensure .env.local has:');
  console.error('   SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

const GRAPHQL_URL = `https://${SHOP_DOMAIN}/admin/api/2024-01/graphql.json`;

const LIST_QUERY = `
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

const DELETE_MUTATION = `
mutation webhookSubscriptionDelete($id: ID!) {
  webhookSubscriptionDelete(id: $id) {
    deletedWebhookSubscriptionId
    userErrors {
      field
      message
    }
  }
}
`;

async function removeWebhooks() {
  console.log(`🔍 Fetching webhooks for ${SHOP_DOMAIN}...`);

  try {
    const listRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({ query: LIST_QUERY }),
    });

    const listData = await listRes.json();
    const edges = listData.data?.webhookSubscriptions?.edges || [];

    if (edges.length === 0) {
      console.log('✅ No webhooks found.');
      return;
    }

    console.log(`🗑️ Found ${edges.length} webhooks. Removing them...`);

    for (const edge of edges) {
      const { id, topic } = edge.node;
      console.log(`⏳ Deleting ${topic} (${id})...`);

      const delRes = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query: DELETE_MUTATION,
          variables: { id },
        }),
      });

      const delData = await delRes.json();
      if (delData.data?.webhookSubscriptionDelete?.userErrors?.length > 0) {
        console.error(`❌ Failed to delete ${topic}:`, delData.data.webhookSubscriptionDelete.userErrors);
      } else {
        console.log(`✅ Deleted ${topic}`);
      }
    }

    console.log('✨ All webhooks removed.');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

removeWebhooks();
