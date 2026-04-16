const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});
const token = env.ADMIN_TOKEN || env.SHOPIFY_ADMIN_TOKEN;
if (!token) {
  console.error('NO ADMIN_TOKEN');
  process.exit(1);
}
const SHOP = 'luciraonline';
const articleId = 'gid://shopify/Article/664645271770';
const query = `query GetArticle($id:ID!){
  node(id:$id){
    ...on Article{
      id title handle body summary
      metafields(first:50){
        edges{
          node{ namespace key value type }
        }
      }
      author{name} image{url} publishedAt blog{id handle}
    }
  }
}`;

fetch(\`https://\${SHOP}.myshopify.com/admin/api/2024-10/graphql.json\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({ query, variables: { id: articleId } }),
})
  .then((r) => r.json())
  .then((d) => {
    const article = d.data?.node;
    if (article) {
      console.log('=== ARTICLE CONTENT CHECK ===');
      console.log('BODY:', article.body ? article.body.substring(0, 200) + '...' : 'EMPTY');
      console.log('SUMMARY:', article.summary ? article.summary.substring(0, 200) + '...' : 'EMPTY');
      console.log('METAFIELDS:');
      article.metafields.edges.forEach((edge) => {
        const mf = edge.node;
        if (mf.value && mf.value.length > 100) {
          console.log(\`  \${mf.namespace}.\${mf.key}: \${mf.value.substring(0, 150)}...\`);
        } else if (mf.value) {
          console.log(\`  \${mf.namespace}.\${mf.key}: \${mf.value}\`);
        }
      });
    } else {
      console.log('Article not found');
    }
  })
  .catch((e) => {
    console.error('Error:', e);
  });