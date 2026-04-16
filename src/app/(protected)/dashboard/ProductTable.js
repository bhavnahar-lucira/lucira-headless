"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function ProductTable({ data, pagination, onPageChange }) {
  const [syncingIds, setSyncingIds] = useState(new Set());
  const [syncingVariantsIds, setSyncingVariantsIds] = useState(new Set());

  // Defensive pagination values
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  const syncReviews = async (productId, shopifyId) => {
    setSyncingIds(prev => new Set(prev).add(productId));
    try {
      const res = await fetch(`/api/reviews?productId=${shopifyId}`);
      if (res.ok) {
        onPageChange(currentPage);
      }
    } catch (e) {
      console.error("Failed to sync reviews", e);
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const syncVariants = async (productId, shopifyId) => {
    setSyncingVariantsIds(prev => new Set(prev).add(productId));
    try {
      const response = await fetch(`/api/sync-variants?shopifyId=${encodeURIComponent(shopifyId)}`, { method: "POST" });
      if (response.ok) {
        onPageChange(currentPage);
      }
    } catch (e) {
      console.error("Failed to sync variants", e);
    } finally {
      setSyncingVariantsIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const columns = [
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row, getValue }) => (
        <div className="w-12 h-12 rounded border overflow-hidden bg-zinc-50 relative">
          {getValue()?.[0]?.url ? (
            <Image src={getValue()[0].url} alt={row.original.title || "Product image"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-200" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{row.original.title}</span>
          <span className="text-xs text-zinc-500">{row.original.vendor}</span>
        </div>
      ),
    },
    {
      accessorKey: "reviewStats",
      header: "Reviews",
      cell: ({ row }) => {
        const reviews = row.original.reviewStats || row.original.reviews;
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              <Star size={14} fill={reviews?.average ? "currentColor" : "none"} />
              <span className="ml-1 text-sm font-medium">{reviews?.average || 0}</span>
            </div>
            <span className="text-xs text-zinc-400">({reviews?.count || 0})</span>
            <button
              onClick={() => syncReviews(row.original.id, row.original.shopifyId)}
              disabled={syncingIds.has(row.original.id)}
              className={`p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors ${syncingIds.has(row.original.id) ? 'animate-spin' : ''}`}
              title="Sync Reviews"
            >
              <RefreshCw size={14} className="text-zinc-400" />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "variants",
      header: "Stock",
      cell: ({ getValue }) => {
        const variants = getValue() || [];
        const total = variants.reduce((acc, v) => acc + (v.inventoryQuantity || v.inventory || 0), 0);
        return <span className="text-sm">{total} units ({variants.length} vars)</span>;
      },
    },
    {
      accessorKey: "handle",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncVariants(row.original.id, row.original.shopifyId)}
            disabled={syncingVariantsIds.has(row.original.id)}
            className={`p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg inline-block transition-colors ${syncingVariantsIds.has(row.original.id) ? 'animate-spin' : ''}`}
            title="Sync Variants"
          >
            <RefreshCw size={16} className="text-zinc-400" />
          </button>
          <a
            href={`/products/${row.original.handle}`}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg inline-block transition-colors"
            title="View Product Details"
          >
            <ExternalLink size={16} className="text-zinc-400" />
          </a>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500">
                  No products found. Sync from Shopify to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-zinc-500">
          Page {currentPage} of {totalPages} ({totalItems} total)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 border rounded-lg disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 border rounded-lg disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
