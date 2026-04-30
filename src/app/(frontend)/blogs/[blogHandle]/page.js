import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight } from "lucide-react";
import { getArticlesByBlogHandle, getBlogByHandle } from "@/lib/blogs";

function stripHtml(value) {
  return value?.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim() || "";
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }) {
  const { blogHandle } = await params;
  const blog = await getBlogByHandle(blogHandle);

  return {
    title: blog?.title || "Blogs | Lucira",
    description: blog?.metafields?.custom?.subtitle || "Explore stories of elegance and craftsmanship.",
  };
}

export default async function BlogListingPage({ params, searchParams }) {
  const { blogHandle } = await params;
  const { tag } = await searchParams;

  const [blog, articles] = await Promise.all([
    getBlogByHandle(blogHandle),
    getArticlesByBlogHandle(blogHandle),
  ]);

  if (!blog && articles.length === 0) return notFound();

  // Extract unique tags from all articles
  const allTags = Array.from(
    new Set(articles.flatMap((article) => article.tags || []))
  ).sort();

  // Filter articles by tag if selected
  const filteredArticles = tag
    ? articles.filter(article => article.tags?.includes(tag))
    : articles;

  return (
    <main className="bg-white min-h-screen pb-24">
      {/* Hero Section - Reduced Size */}
      <section className="py-2 lg:py-8 bg-[#FCFBFA] border-b border-zinc-100">
        <div className="container-main text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a68380] mb-4">
            The Lucira Journal
          </p>
          <h1 className="font-abhaya text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight">
            {blog?.title || "Stories"}
          </h1>
        </div>
      </section>

      {/* Filter Navigation */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="container-main">
          <div className="flex items-center lg:justify-center overflow-x-auto no-scrollbar py-4 lg:py-6 gap-6 lg:gap-12 px-4 lg:px-0">
            <Link
              href={`/blogs/${blogHandle}`}
              className={`whitespace-nowrap text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-1 ${
                !tag ? "text-[#a68380]" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              All
              {!tag && (
                <span className="absolute bottom-0 left-0 w-full h-px bg-[#a68380]"></span>
              )}
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/blogs/${blogHandle}?tag=${encodeURIComponent(t)}`}
                className={`whitespace-nowrap text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-1 ${
                  tag === t ? "text-[#a68380]" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {t}
                {tag === t && (
                  <span className="absolute bottom-0 left-0 w-full h-px bg-[#a68380]"></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container-main py-10 lg:py-16">
        {filteredArticles.length > 0 ? (
          <div className="grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {filteredArticles.map((article, index) => {
              const firstTag = article.tags?.[0] || "Blog";

              return (
                <Link
                  key={article.id}
                  href={`/blogs/${blogHandle}/${article.handle}`}
                  className="group flex flex-col h-full"
                >
                  {/* Image Container - Aspect 1/1.15 */}
                  <div className="relative aspect-[1/1.15] overflow-hidden rounded-lg mb-4 lg:mb-6">
                    {article.image?.url ? (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={index < 4}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="text-[9px] lg:text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500 mb-1 lg:mb-2">
                    {firstTag}
                  </div>

                  {/* Content Container */}
                  <div className="flex justify-between items-start gap-2 lg:gap-4">
                    <h2 className="font-abhaya text-sm lg:text-xl font-bold leading-tight text-zinc-900 group-hover:text-[#a68380] transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h2>

                    {/* Arrow Icon in Circle */}
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border border-zinc-200 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-[#a68380] group-hover:bg-[#a68380]/5">
                      <ChevronRight size={14} className="text-zinc-400 lg:size-4 group-hover:text-[#a68380] transition-transform duration-300 group-hover:-rotate-45" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h3 className="font-abhaya text-3xl font-bold text-zinc-900 mb-4">No stories found</h3>
            <p className="text-zinc-500 mb-8 font-light">We haven't shared any stories under "{tag}" yet.</p>
            <Link
              href={`/blogs/${blogHandle}`}
              className="inline-block px-8 py-3 border border-[#a68380] text-[#a68380] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#a68380] hover:text-white transition-all duration-300"
            >
              Back to All Stories
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
