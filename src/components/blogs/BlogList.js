import BlogCard from "./BlogCard";

export default function BlogList({ articles }) {
  return (
    <div className="p-10px grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-6 gap-6">
      {articles.map((article) => (
        <BlogCard key={article.id} article={article} />
      ))}
    </div>
  );
}