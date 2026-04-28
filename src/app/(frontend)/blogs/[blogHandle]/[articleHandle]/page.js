import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, Linkedin, User } from "lucide-react";
import { notFound } from "next/navigation";
import { getArticleByBlogAndHandle, getArticlesByBlogHandle } from "@/lib/blogs";

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

function readingTime(article) {
  const text = article.content || stripHtml(article.contentHtml);
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return `${Math.max(1, Math.ceil(words / 220))} Mins`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prepareArticleHtml(html) {
  if (!html) return { html: "", toc: [] };

  const toc = [];
  const usedIds = new Set();
  const preparedHtml = html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const label = stripHtml(content);
    if (!label) return match;

    const existingId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
    let id = existingId || slugify(label);
    let count = 2;

    while (usedIds.has(id)) {
      id = `${existingId || slugify(label)}-${count}`;
      count += 1;
    }

    usedIds.add(id);
    toc.push({ id, label, level: Number(level) });

    const nextAttrs = existingId ? attrs : `${attrs} id="${id}"`;
    return `<h${level}${nextAttrs}>${content}</h${level}>`;
  });

  return { html: preparedHtml, toc };
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2V8.6H15.2c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z"
      />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 3 5.78 3 10.68c0 2.27 1.27 5.1 3.3 6 .31.14.48.08.55-.22.05-.23.33-1.35.45-1.88.04-.17.02-.32-.12-.49-.67-.82-1.2-2.32-1.2-3.72 0-3.42 2.6-6.72 7.03-6.72 3.82 0 6.5 2.6 6.5 6.32 0 4.2-2.12 7.1-4.88 7.1-1.52 0-2.65-1.25-2.29-2.79.43-1.83 1.27-3.8 1.27-5.12 0-1.18-.63-2.16-1.94-2.16-1.54 0-2.78 1.59-2.78 3.73 0 1.36.46 2.28.46 2.28s-1.52 6.45-1.8 7.65c-.3 1.26-.18 3.03-.05 4.18.94.29 1.94.44 2.97.44 5.52 0 10-4.48 10-10S17.56 2 12.04 2Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  );
}

export async function generateMetadata({ params }) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticleByBlogAndHandle(blogHandle, articleHandle);

  if (!article) {
    return {
      title: "Blog not found",
    };
  }

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || stripHtml(article.excerptHtml),
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt || stripHtml(article.excerptHtml),
      images: article.image?.url ? [article.image.url] : [],
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const { blogHandle, articleHandle } = await params;
  const [article, relatedArticles] = await Promise.all([
    getArticleByBlogAndHandle(blogHandle, articleHandle),
    getArticlesByBlogHandle(blogHandle),
  ]);

  if (!article) return notFound();

  const publishedDate = formatDate(article.publishedAt);
  const readTime = readingTime(article);
  const { html: bodyHtml, toc } = prepareArticleHtml(article.contentHtml || article.content);
  const related = relatedArticles
    .filter((item) => item.handle !== article.handle)
    .slice(0, 3);
  const encodedUrl = encodeURIComponent(`https://www.lucirajewelry.com/blogs/${blogHandle}/${articleHandle}`);
  const encodedTitle = encodeURIComponent(article.title);

  return (
    <main className="bg-white">
      <section className="container-main py-12">
        <div className="mx-auto mb-10 h-px w-28 bg-[#8d655f]" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          <div>
            <h1 className="max-w-4xl font-figtree text-3xl font-medium uppercase leading-tight tracking-[0.12em] text-black sm:text-[31px]">
              {article.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-black">
              {article.authorV2?.name && (
                <span className="inline-flex items-center gap-2">
                  <User size={14} className="fill-zinc-500 text-zinc-500" />
                  {article.authorV2.name}
                </span>
              )}
              {publishedDate && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={14} className="fill-zinc-500 text-zinc-500" />
                  {publishedDate}
                </span>
              )}
              {readTime && (
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} className="fill-zinc-500 text-zinc-500" />
                  {readTime}
                </span>
              )}
            </div>
          </div>

          <div className="lg:pl-1">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.08em] text-black">
              Follow Us:
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                className="text-[#1877f2]"
                aria-label="Share on Facebook"
              >
                <FacebookIcon />
              </Link>
              <Link
                href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
                target="_blank"
                className="text-[#e60023]"
                aria-label="Share on Pinterest"
              >
                <PinterestIcon />
              </Link>
              <Link
                href="https://www.instagram.com/lucirajewelry"
                target="_blank"
                className="text-[#e4405f]"
                aria-label="Open Instagram"
              >
                <InstagramIcon />
              </Link>
              <Link
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                className="text-[#0a66c2]"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={20} fill="currentColor" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-11 grid gap-4 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          <div className="min-w-0">
            {article.image?.url && (
              <div className="relative mb-4 aspect-[1.71] overflow-hidden rounded-md bg-zinc-100">
                <Image
                  src={article.image.url}
                  alt={article.image.altText || article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 860px"
                  className="object-cover"
                />
              </div>
            )}

            <article className="blog-article-content footer-pages max-w-none [&_.article-content-block]:mb-5 [&_.article-image-block]:my-6 [&_.article-image-block_img]:w-full [&_.article-image-block_img]:rounded-md [&_.article-image-block_img]:object-cover [&_.image-with-text-block]:my-8 [&_.image-with-text-block]:grid [&_.image-with-text-block]:gap-5 [&_.image-with-text-block]:md:grid-cols-2 [&_.image-with-text-block.layout-row-reverse_.image-container-blog]:md:order-2 [&_.image-container-blog_img]:w-full [&_.image-container-blog_img]:rounded-md [&_.image-container-blog_img]:object-cover [&_.text-container]:self-center [&_.comparison-table-container]:my-8 [&_.comparison-table-container]:overflow-x-auto [&_.comparison-table]:w-full [&_.comparison-table]:min-w-[620px] [&_.comparison-table]:border-collapse [&_.comparison-table_th]:border [&_.comparison-table_th]:border-zinc-300 [&_.comparison-table_th]:p-3 [&_.comparison-table_td]:border [&_.comparison-table_td]:border-zinc-300 [&_.comparison-table_td]:p-3 [&_.image-text-products-section]:my-10 [&_.image-text-products-grid]:grid [&_.image-text-products-grid]:gap-3 [&_.image-text-products-grid]:sm:grid-cols-2 [&_.image-text-product-card]:rounded-xl [&_.image-text-product-card]:border [&_.image-text-product-card]:border-zinc-200 [&_.image-text-product-card]:bg-white [&_.image-text-product-card]:px-5 [&_.image-text-product-card]:py-4 [&_.image-text-product-link]:grid [&_.image-text-product-link]:grid-cols-[96px_1fr] [&_.image-text-product-link]:items-center [&_.image-text-product-link]:gap-5 [&_.image-text-product-link]:no-underline [&_.image-text-product-image_img]:max-h-24 [&_.image-text-product-image_img]:w-full [&_.image-text-product-image_img]:object-contain [&_.image-text-product-rating]:mb-1 [&_.image-text-product-rating]:flex [&_.image-text-product-rating]:items-center [&_.image-text-product-rating]:gap-2 [&_.star-rating]:flex [&_.star]:text-sm [&_.star]:leading-none [&_.star.filled]:text-[#ffab00] [&_.rating-text]:text-sm [&_.rating-text]:text-black [&_.image-text-product-title]:mb-1 [&_.image-text-product-title]:line-clamp-1 [&_.image-text-product-title]:text-base [&_.image-text-product-title]:font-normal [&_.image-text-product-title]:text-black [&_.image-text-product-price]:mb-3 [&_.current-price]:mr-2 [&_.current-price]:text-xl [&_.current-price]:font-bold [&_.current-price]:text-black [&_.compare-price]:text-sm [&_.compare-price]:text-zinc-400 [&_.compare-price]:line-through [&_.view-details-text]:text-sm [&_.view-details-text]:text-[#8d4b43] [&_.arrow-icon]:ml-2 [&_.arrow-icon]:text-[#8d4b43] [&_.product-card-list]:my-8 [&_.product-card-list]:grid [&_.product-card-list]:gap-4 [&_.product-card-list]:sm:grid-cols-2 [&_.product-card]:rounded-lg [&_.product-card]:border [&_.product-card]:border-zinc-200 [&_.product-card]:bg-white [&_.product-card]:p-4 [&_.product-card]:no-underline [&_.product-image-container_img]:mx-auto [&_.product-image-container_img]:max-h-36 [&_.product-image-container_img]:object-contain [&_.product-title]:mt-3 [&_.product-title]:text-sm [&_.product-title]:font-semibold [&_.product-title]:uppercase [&_.product-price]:mt-2 [&_.product-price]:font-bold [&_.product-price]:text-[#5a413f] [&_.view-product-button]:mt-3 [&_.view-product-button]:inline-flex [&_.view-product-button]:rounded [&_.view-product-button]:bg-[#5a413f] [&_.view-product-button]:px-3 [&_.view-product-button]:py-2 [&_.view-product-button]:text-xs [&_.view-product-button]:uppercase [&_.view-product-button]:text-white [&_.testimonial-card]:my-6 [&_.testimonial-card]:flex [&_.testimonial-card]:items-center [&_.testimonial-card]:gap-4 [&_.testimonial-card]:rounded-lg [&_.testimonial-card]:border [&_.testimonial-card]:border-zinc-200 [&_.testimonial-card]:bg-zinc-100 [&_.testimonial-card]:p-4 [&_.testimonial-avatar]:size-16 [&_.testimonial-avatar]:shrink-0 [&_.testimonial-avatar]:rounded-full [&_.testimonial-avatar]:bg-cover [&_.testimonial-avatar]:bg-center [&_.testimonial-name]:font-semibold [&_.testimonial-role]:text-xs [&_.testimonial-role]:text-zinc-500 [&_.testimonial-text]:text-sm">
              {bodyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              ) : (
                <p>No article content available.</p>
              )}
            </article>
          </div>

          {toc.length > 0 && (
            <aside className="rounded-md border border-zinc-200 bg-zinc-100 p-5 lg:sticky lg:top-28">
              <h2 className="mb-3 border-b border-black pb-3 font-figtree text-base font-medium uppercase tracking-[0.04em] text-black">
                Table of Content
              </h2>
              <ol className="list-disc space-y-2.5 pl-5 pt-4 text-[15px] leading-7 text-black">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                    <a href={`#${item.id}`} className="hover:text-[#8d655f]">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50 py-12">
          <div className="container-main">
            <h2 className="font-abhaya text-3xl font-extrabold text-zinc-950">
              More From {article.blogTitle || blogHandle}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${blogHandle}/${item.handle}`}
                  className="group block rounded-sm border border-zinc-200 bg-white p-4 transition-colors hover:border-[#8d655f]"
                >
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-sm bg-zinc-100">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-zinc-500">{formatDate(item.publishedAt)}</p>
                  <h3 className="line-clamp-2 font-semibold text-zinc-950">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
