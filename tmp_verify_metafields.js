const { shopifyAdminFetch } = require('./src/lib/shopify');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const COLLECTION_ID = "gid://shopify/Collection/438139912410"; // Rings

const query = `
  query($id: ID!) {
    node(id: $id) {
      ... on Collection {
        id
        title
        handle
        metafields(first: 50) {
          nodes {
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

async function verifyMetafields() {
  try {
    const data = await shopifyAdminFetch(query, { id: COLLECTION_ID });
    console.log(`Collection: ${data.node.title}`);
    console.log("Metafields:");
    data.node.metafields.nodes.forEach(m => {
      console.log(`  [${m.namespace}.${m.key}] : ${m.value} (${m.type})`);
    });
  } catch (error) {
    console.error(error);
  }
}

verifyMetafields();
