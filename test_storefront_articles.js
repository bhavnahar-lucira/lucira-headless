const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});
const token = env.STOREFRONT_TOKEN;
if (!token) {
  console.error('NO STOREFRONT_TOKEN');
  process.exit(1);
}
const SHOP = 'luciraonline';
const query = `query GetArticles($first:Int!,$after:String){
  articles(first:$first,after:$after){
    edges{
      node{
        id title handle content contentHtml excerpt excerptHtml
        authorV2{name} image{url} publishedAt blog{id handle}
      }
    }
    pageInfo{hasNextPage}
  }
}`;

fetch(`https://${SHOP}.myshopify.com/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query, variables: { first: 5, after: null } }),
})
  .then((r) => r.json())
  .then((d) => {
    console.log('Storefront API Response:');
    console.log(JSON.stringify(d, null, 2));
  })
  .catch((e) => {
    console.error(e);
  });