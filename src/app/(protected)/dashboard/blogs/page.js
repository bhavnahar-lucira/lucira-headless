import clientPromise from "@/lib/mongodb";
import ArticlesTable from "./ArticlesTable";

async function getBlogsWithArticles() {
  const client = await clientPromise;
  const db = client.db("next_local_db");
  const [blogs, articles] = await Promise.all([
    db.collection("blogs").find({}).sort({ title: 1 }).toArray(),
    db.collection("articles").find({}).sort({ publishedAt: -1 }).toArray(),
  ]);

  const articlesByBlog = articles.reduce((acc, article) => {
    const key = article.blogId || article.blogHandle || "uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {});

  const blogsWithArticles = blogs.map((blog) => ({
    ...blog,
    articles: articlesByBlog[blog.id] || articlesByBlog[blog.handle] || [],
  }));

  const uncategorizedArticles = articlesByBlog.uncategorized || [];
  if (uncategorizedArticles.length > 0) {
    blogsWithArticles.push({
      id: "uncategorized",
      title: "Uncategorized",
      handle: "uncategorized",
      articles: uncategorizedArticles,
    });
  }

  return JSON.parse(JSON.stringify(blogsWithArticles));
}

export default async function BlogsDashboard() {
  const blogs = await getBlogsWithArticles();
  const totalArticles = blogs.reduce((total, blog) => total + (blog.articles?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blogs & Articles</h1>
          <p className="text-zinc-500">View every synced Shopify blog with its article details.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg">
            <span className="font-bold text-xl">{blogs.length}</span>
            <span className="text-zinc-500 ml-2">Blogs</span>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg">
            <span className="font-bold text-xl">{totalArticles}</span>
            <span className="text-zinc-500 ml-2">Articles</span>
          </div>
        </div>
      </div>

      <ArticlesTable data={blogs} />
    </div>
  );
}
