"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { Eye, FileText } from "lucide-react";

export default function PagesTable({ data }) {
  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-zinc-400" />
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "handle",
      header: "Handle",
      cell: ({ row }) => <span className="text-zinc-500 font-mono text-xs">{row.getValue("handle")}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => new Date(row.getValue("updatedAt")).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link 
          href={`/pages/${row.original.handle}`} 
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
