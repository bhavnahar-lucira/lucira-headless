"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Star, User, MessageCircle } from "lucide-react";

export default function ReviewsTable({ data }) {
  const columns = [
    {
      accessorKey: "productTitle",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
            {row.getValue("productTitle") || "General Review"}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {row.original.productId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Reviewer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-zinc-400" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center text-amber-500">
          <Star size={16} fill="currentColor" />
          <span className="ml-1 font-bold">{row.getValue("rating")}</span>
        </div>
      ),
    },
    {
      accessorKey: "text",
      header: "Review Content",
      cell: ({ row }) => (
        <div className="flex gap-2 max-w-[400px]">
          <MessageCircle size={16} className="text-zinc-400 shrink-0 mt-1" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
            "{row.getValue("text")}"
          </p>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date");
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
