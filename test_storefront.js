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

fetch(\`https://\${SHOP}.myshopify.com/api/2024-10/graphql.json\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query, variables: { first: 3, after: null } }),
})
  .then((r) => r.json())
  .then((d) => {
    console.log('=== STOREFRONT API ARTICLE RESPONSE ===');
    const article = d.data?.articles?.edges?.[0]?.node;
    if (article) {
      console.log('ID:', article.id);
      console.log('TITLE:', article.title);
      console.log('CONTENT (length):', article.content ? article.content.length : 'NULL');
      console.log('CONTENT_HTML (length):', article.contentHtml ? article.contentHtml.length : 'NULL');
      console.log('EXCERPT (length):', article.excerpt ? article.excerpt.length : 'NULL');
      console.log('EXCERPT_HTML (length):', article.excerptHtml ? article.excerptHtml.length : 'NULL');
      console.log('CONTENT PREVIEW:', article.content ? article.content.substring(0, 100) + '...' : 'EMPTY');
    } else {
      console.log('No articles found');
    }
  })
  .catch((e) => {
    console.error('Error:', e);
  });