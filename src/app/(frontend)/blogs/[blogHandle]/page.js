import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
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
    title: blog?.title || "Blogs",
  };
}

export default async function BlogListingPage({ params }) {
  const { blogHandle } = await params;
  const [blog, articles] = await Promise.all([
    getBlogByHandle(blogHandle),
    getArticlesByBlogHandle(blogHandle),
  ]);

  if (!blog && articles.length === 0) return notFound();

  return (
    <main className="bg-white">
      <section className="border-b border-zinc-200 py-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8d655f]">
          Lucira Jewelry
        </p>
        <h1 className="font-abhaya text-4xl font-extrabold text-zinc-950 sm:text-5xl">
          {blog?.title || blogHandle}
        </h1>
      </section>

      <section className="container-main py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const excerpt = article.excerpt || stripHtml(article.excerptHtml) || article.content || stripHtml(article.contentHtml);

            return (
              <Link
                key={article.id}
                href={`/blogs/${blogHandle}/${article.handle}`}
                className="group block overflow-hidden rounded-sm border border-zinc-200 bg-white transition-colors hover:border-[#8d655f]"
              >
                <div className="relative aspect-[4/3] bg-zinc-100">
                  {article.image?.url ? (
                    <Image
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar size={14} />
                    {formatDate(article.publishedAt) || "Not published"}
                  </div>
                  <h2 className="line-clamp-2 font-abhaya text-2xl font-extrabold leading-tight text-zinc-950">
                    {article.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                    {excerpt || "No article summary available."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
