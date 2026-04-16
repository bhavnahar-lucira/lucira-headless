"use client";

import Link from "next/link";
import Image from "next/image";
import { DataTable } from "@/components/ui/DataTable";
import { Eye, User, Calendar } from "lucide-react";

// Helper to truncate text to ~100 words
function truncateToWords(text, wordLimit) {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}

export default function ArticlesTable({ data }) {
  const columns = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-20 aspect-video rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative">
          {row.getValue("image")?.url ? (
            <Image 
              src={row.getValue("image").url} 
              alt={row.original.title} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title & Blog",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{row.getValue("title")}</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Blog: {row.original.blogHandle}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "authorV2",
      header: "Author",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
          <User size={14} />
          <span>{row.getValue("authorV2")?.name || "Unknown"}</span>
        </div>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
          <Calendar size={14} />
          <span>{new Date(row.getValue("publishedAt")).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: "Content Snippet (~100 words)",
      cell: ({ row }) => {
        const rawContent = row.original.content || row.original.contentHtml?.replace(/<[^>]*>?/gm, '') || "";
        return (
          <div className="max-w-md text-zinc-500 text-xs leading-relaxed line-clamp-3">
            {truncateToWords(rawContent, 100)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link 
          href={`/blogs/${row.original.blogHandle}/${row.original.handle}`} 
          target="_blank"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors inline-block"
        >
          <Eye size={18} className="text-zinc-400" />
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
