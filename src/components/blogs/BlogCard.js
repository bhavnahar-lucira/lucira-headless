import Link from "next/link";

export default function BlogCard({ article }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      
      {/* Image */}
      <div className="w-full h-56 overflow-hidden">
        <img
          src={article.image?.url}
          alt={article.title}
          className=" object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {article.title}
        </h2>

        <p className="text-sm text-gray-600 line-clamp-3">
          {article.excerpt}
        </p>

        <Link
          href={`/blogs/stories/${article.handle}`}
          className="mt-auto text-sm font-medium text-blue-600 hover:text-blue-800 transition"
        >
          Read More →
        </Link>

      </div>
    </div>
  );
}