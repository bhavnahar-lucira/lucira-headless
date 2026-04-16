import Link from "next/link";

export default function BlogCard({ article }) {
  return (
    <Link href={`/blogs/stories/${article.handle}`}>
      <div className="group cursor-pointer">

        {/* Image */}
        <div className="w-full h-[260px] overflow-hidden rounded-md">
          <img
            src={article.image?.url}
            alt={article.title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-3 space-y-2">

          {/* Meta (you can replace read time dynamically later) */}
          <p className="text-xs text-gray-500">
            
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
            })}
          </p>

          {/* Title */}
          <h2 className="text-[15px] font-semibold text-gray-900 leading-snug group-hover:underline">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {article.excerpt}
          </p>

        </div>
      </div>
    </Link>
  );
}