"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export default function CollectionsDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [fetchingList, setFetchingList] = useState(true);
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchCollections = async (currentPage = page, q = searchQuery) => {
    setFetchingList(true);
    try {
      const res = await fetch(`/api/collection/list?page=${currentPage}&limit=10&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCollections(1, searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCollections(page, searchQuery);
  }, [page]);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/sync-collections", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        fetchCollections(1, "");
        setSearchQuery("");
        setPage(1);
      } else {
        setError(data.error || "Failed to sync");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor("title", {
      header: "Collection",
      cell: (info) => <div className="font-medium text-zinc-900 dark:text-zinc-100">{info.getValue()}</div>,
    }),
    columnHelper.accessor("handle", {
      header: "Handle",
      cell: (info) => <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">{info.getValue()}</code>,
    }),
    columnHelper.accessor("metafields", {
      header: "SEO Content",
      cell: (info) => {
        const metafields = info.getValue() || {};
        const hasSeo = metafields["custom.seocontent"] || metafields["custom.seo_content"];
        return hasSeo ? (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Yes</span>
        ) : (
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase rounded">No</span>
        );
      },
    }),
    columnHelper.accessor("metafields", {
      id: "faqs",
      header: "FAQs",
      cell: (info) => {
        const metafields = info.getValue() || {};
        const hasFaq = metafields["custom.faqquestion"] || metafields["custom.faq_section"];
        return hasFaq ? (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">Yes</span>
        ) : (
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase rounded">No</span>
        );
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: "Last Updated",
      cell: (info) => (
        <div className="text-sm text-zinc-500 text-right">
          {new Date(info.getValue()).toLocaleDateString()}
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: collections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shopify Collections</h1>
          <p className="text-zinc-500">
            Sync and manage your Shopify collections and their SEO/FAQ metadata.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 w-64"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            }`}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync Collections"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <CheckCircle size={20} />
            <span className="font-semibold">Successfully synced {result.count} collections!</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-semibold text-sm">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {fetchingList ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-zinc-300" />
                      <span>Loading collections...</span>
                    </div>
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Database size={24} className="text-zinc-300" />
                      <span>No collections found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 10, pagination.total)}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> collections
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-medium">{page}</span>
              <span className="text-sm text-zinc-400">/</span>
              <span className="text-sm text-zinc-400">{pagination.totalPages}</span>
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || pagination.totalPages === 0}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page === pagination.totalPages || pagination.totalPages === 0}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
