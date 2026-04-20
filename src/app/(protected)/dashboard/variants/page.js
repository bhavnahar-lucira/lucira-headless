"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, LayoutDashboard, Database, Box } from "lucide-react";

export default function VariantsSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastSkip, setLastSkip] = useState(0);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocalProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?limit=1000`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error("Failed to fetch local products", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocalProducts();
  }, [fetchLocalProducts]);

  const startSync = async (isRetry = false) => {
    setSyncing(true);
    setStatus(isRetry ? "Resuming variant sync..." : "Initiating variant sync...");
    if (!isRetry) setProgress(0);
    setError(null);

    try {
      const response = await fetch("/api/sync-variants", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip: isRetry ? lastSkip : 0 })
      });
      if (!response.ok) throw new Error("Failed to start sync");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setStatus(data.message);
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.skip !== undefined) setLastSkip(data.skip);

            if (data.status === "error") {
              setError(data.message);
              setSyncing(false);
              return;
            }
            if (data.status === "complete") {
              setSyncing(false);
              setLastSkip(0);
            }
          } catch (e) {
            console.error("Error parsing JSON chunk", e);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Box className="text-zinc-400" />
              Variant Synchronization
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Refresh variant prices, options, and metadata from Shopify.
            </p>
          </div>
          
          <button 
            onClick={() => startSync()} 
            disabled={syncing}
            className={`flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl shadow-lg transition-all ${syncing ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
            <span className="font-bold">Sync All Variants</span>
          </button>
        </div>

        {/* Sync Status Overlay/Panel */}
        {(syncing || error) && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${error ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {error ? "Sync Failed" : status}
              </span>
              {!error && <span className="text-sm font-bold">{progress}%</span>}
            </div>
            
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${error ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {error && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-500">{error}</p>
                <button 
                  onClick={() => startSync(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
                >
                  <RefreshCw size={14} />
                  Retry from failure
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Database size={18} className="text-zinc-400" />
              <h3 className="font-bold">Local Products</h3>
            </div>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Box size={18} className="text-zinc-400" />
              <h3 className="font-bold">Total Variants</h3>
            </div>
            <p className="text-3xl font-bold">
              {products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Why Sync Variants?</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc list-inside">
            <li>Update prices based on live gold rates and variant configurations.</li>
            <li>Refresh stock levels and inventory quantities.</li>
            <li>Synchronize new variant-level metafields (e.g. ring size, metal weight).</li>
            <li>Fix synchronization gaps if full product sync fails.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
