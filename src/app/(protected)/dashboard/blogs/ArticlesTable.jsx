"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import {
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  Hash,
  User,
} from "lucide-react";

function stripHtml(value) {
  return value?.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim() || "";
}

function truncateToWords(text, wordLimit) {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(" ")}...`;
}

function formatDate(value) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString();
}

function ArticleDetails({ blog }) {
  const articles = blog.articles || [];

  if (articles.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-500">
        No synced articles found for this blog.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {articles.map((article) => {
        const articleText = article.excerpt || stripHtml(article.excerptHtml) || article.content || stripHtml(article.contentHtml);

        return (
          <div
            key={article.id}
            className="grid gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 md:grid-cols-[120px_1fr]"
          >
            <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
              {article.image?.url ? (
                <Image
                  src={article.image.url}
                  alt={article.image.altText || article.title}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[11px] text-zinc-400">
                  No Image
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    {article.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Hash size={12} />
                      {article.handle}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {article.authorV2?.name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/blogs/${blog.handle}/${article.handle}`}
                  target="_blank"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  title="Open article"
                >
                  <Eye size={16} />
                </Link>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                {truncateToWords(articleText, 80) || "No article content available."}
              </p>

              <div className="mt-3 grid gap-2 text-[11px] text-zinc-400 sm:grid-cols-2">
                <div className="truncate">Article ID: {article.id}</div>
                <div className="truncate">Blog ID: {article.blogId || blog.id}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ArticlesTable({ data }) {
  const [openBlogIds, setOpenBlogIds] = useState(() => new Set());

  const toggleBlog = (blogId) => {
    setOpenBlogIds((current) => {
      const next = new Set(current);
      if (next.has(blogId)) {
        next.delete(blogId);
      } else {
        next.add(blogId);
      }
      return next;
    });
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Blog",
      cell: ({ row }) => {
        const blog = row.original;
        const isOpen = openBlogIds.has(blog.id);

        return (
          <div className="min-w-[280px]">
            <button
              type="button"
              onClick={() => toggleBlog(blog.id)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                <FileText size={16} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-zinc-900 dark:text-zinc-100">
                  {blog.title}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <Hash size={12} />
                  {blog.handle}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`ml-auto mt-1 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <ArticleDetails blog={blog} />}
          </div>
        );
      },
    },
    {
      accessorKey: "handle",
      header: "Handle",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
          {row.getValue("handle")}
        </span>
      ),
    },
    {
      accessorKey: "articles",
      header: "Articles",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {row.original.articles?.length || 0}
        </span>
      ),
    },
    {
      accessorKey: "id",
      header: "Shopify ID",
      cell: ({ row }) => (
        <div className="max-w-[260px] truncate text-xs text-zinc-500">
          {row.getValue("id")}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
