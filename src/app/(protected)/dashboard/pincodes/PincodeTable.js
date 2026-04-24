"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

export default function PincodeTable({ data, pagination, onPageChange }) {
  // Defensive pagination values
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  const columns = [
    {
      accessorKey: "pincode",
      header: "Pincode",
      cell: ({ getValue }) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-50">{getValue()}</span>
      ),
    },
    {
      accessorKey: "cod",
      header: "COD",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          {getValue() ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
          <span className="text-xs uppercase font-medium">{getValue() ? "Available" : "No"}</span>
        </div>
      ),
    },
    {
      accessorKey: "upi",
      header: "UPI",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          {getValue() ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
          <span className="text-xs uppercase font-medium">{getValue() ? "Available" : "No"}</span>
        </div>
      ),
    },
    {
      accessorKey: "latitude",
      header: "Latitude",
      cell: ({ getValue }) => (
        <span className="text-zinc-500 font-mono text-xs">{getValue() || "-"}</span>
      ),
    },
    {
      accessorKey: "longitude",
      header: "Longitude",
      cell: ({ getValue }) => (
        <span className="text-zinc-500 font-mono text-xs">{getValue() || "-"}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-400">
          {getValue() ? new Date(getValue()).toLocaleDateString() : "-"}
        </span>
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
                  No pincodes found. Click "Import" to add data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-zinc-500">
          Page {currentPage} of {totalPages} ({totalItems.toLocaleString()} total)
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
