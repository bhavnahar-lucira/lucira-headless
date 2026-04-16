const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});
const token = env.ADMIN_TOKEN || env.SHOPIFY_ADMIN_TOKEN;
if (!token) {
  console.error('No ADMIN_TOKEN or SHOPIFY_ADMIN_TOKEN set');
  process.exit(1);
}
const SHOP = 'luciraonline';
const query = `query IntrospectArticle { __type(name: \"Article\") { name fields { name type { name kind ofType { name kind } } } } }`;

fetch(`https://${SHOP}.myshopify.com/admin/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({ query }),
})
  .then((r) => r.json())
  .then((d) => console.log(JSON.stringify(d, null, 2)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
