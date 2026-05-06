"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import SyncStatusMonitor from "@/components/dashboard/SyncStatusMonitor";

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // 1. Sync Pages & Blogs
      const response = await fetch("/api/sync/shopify", {
        method: "POST",
      });
      const data = await response.json();

      // 2. Sync Collections
      const colResponse = await fetch("/api/sync-collections", {
        method: "POST",
      });
      const colData = await colResponse.json();

      if (data.success && colData.success) {
        setResult({
          ...data,
          collectionsCount: colData.count
        });
      } else {
        setError(data.error || colData.error || "Failed to sync");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sync Shopify Data</h1>
        <p className="text-zinc-500">
          Sync your Shopify pages, blogs, and collections to the local database for use in the storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 h-fit">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <RefreshCw
                size={48}
                className={`text-zinc-400 ${loading ? "animate-spin" : ""}`}
              />
            </div>

            <h2 className="text-xl font-semibold mb-4">Manual Storefront Sync</h2>
            <p className="text-zinc-500 mb-8 max-w-md">
              Manually trigger a sync for pages, blogs, and collections. 
              Note: This is separate from the scheduled background sync.
            </p>

            <button
              onClick={handleSync}
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                loading
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              }`}
            >
              {loading ? "Syncing..." : error ? "Retry Sync" : "Start Manual Sync"}
            </button>

            {result && (
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg w-full max-w-md text-left">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Sync Successful!</span>
                </div>
                <ul className="text-sm text-green-600 dark:text-green-500 space-y-1 ml-8">
                  <li>• Synced {result.pagesCount} Pages</li>
                  <li>• Synced {result.blogsCount} Blogs</li>
                  <li>• Synced {result.collectionsCount} Collections</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg w-full max-w-md text-left">
                <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                  <AlertCircle size={20} />
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Scheduled Background Sync</h2>
          <SyncStatusMonitor />
        </div>
      </div>
    </div>
  );
}
