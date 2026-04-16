import clientPromise from "@/lib/mongodb";
import ArticlesTable from "./ArticlesTable";

async function getArticles() {
  const client = await clientPromise;
  const db = client.db();
  const articles = await db.collection("articles").find({}).sort({ publishedAt: -1 }).toArray();
  return JSON.parse(JSON.stringify(articles));
}

export default async function BlogsDashboard() {
  const articles = await getArticles();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blogs & Articles</h1>
          <p className="text-zinc-500">Manage your synced Shopify articles with a paginated TanStack Table.</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg">
          <span className="font-bold text-xl">{articles.length}</span>
          <span className="text-zinc-500 ml-2">Total Articles</span>
        </div>
      </div>

      <ArticlesTable data={articles} />
    </div>
  );
}
