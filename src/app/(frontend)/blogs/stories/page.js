import { shopifyStorefrontFetch } from "@/lib/shopify";
import { GET_ARTICLES } from "@/lib/queries";
import InfiniteBlogList from "@/components/blogs/InfiniteBlogList";

export default async function BlogsPage() {
  const data = await shopifyStorefrontFetch(GET_ARTICLES, {
    cursor: null,
  });

  const articles = data.articles.edges.map(e => e.node);

  return (
    <div className="max-w-7xl mx-auto p-10">
      {/* <h1 className="text-3xl font-bold mb-8">Blogs</h1> */}

      <InfiniteBlogList
        initialArticles={articles}
        initialCursor={data.articles.edges.at(-1)?.cursor}
        hasNextPage={data.articles.pageInfo.hasNextPage}
      />
    </div>
  );
}