"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductTable from "./ProductTable";
import { RefreshCw, LayoutDashboard, Store, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState(""); // "products" or "reviews"
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [shopifyTotal, setShopifyTotal] = useState(0);
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch count of products available on Shopify
  const fetchShopifyCount = async () => {
    try {
      const res = await fetch("/api/sync-shopify");
      const data = await res.json();
      setShopifyTotal(data.count || 0);
    } catch (e) {
      console.error("Failed to fetch Shopify count", e);
    }
  };

  // Fetch products from our MongoDB
  const fetchLocalProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products/search?page=${page}&limit=10`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch (e) {
      console.error("Failed to fetch local products", e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchShopifyCount();
    fetchLocalProducts();
  }, [fetchLocalProducts]);

  const startSync = async (type = "products") => {
    setSyncing(true);
    setSyncType(type);
    setStatus(`Initiating ${type} sync...`);
    setProgress(0);
    setError(null);

    const apiPath = type === "products" ? "/api/sync-shopify" : "/api/sync-reviews";

    try {
      const response = await fetch(apiPath, { method: "POST" });
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
            if (data.status === "error") {
              setError(data.message);
              setSyncing(false);
              return;
            }
            if (data.status === "complete") {
              setSyncing(false);
              fetchLocalProducts(1); // Refresh list after complete
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
              <LayoutDashboard className="text-zinc-400" />
              Store Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Synchronize and manage your Shopify inventory.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => startSync("reviews")} 
              disabled={syncing}
              className={`flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold text-sm uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MessageSquare size={18} className="text-zinc-400" />
              Sync Reviews
            </button>

            <Link 
              href="/products" 
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold text-sm uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Store size={18} className="text-zinc-400" />
              View Store
            </Link>

            <button 
              onClick={() => startSync("products")} 
              disabled={syncing}
              className={`flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all ${syncing ? 'opacity-80 cursor-not-allowed' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95'}`}
            >
              <Store size={20} className="text-zinc-400" />
              <div className="flex flex-col text-left">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Shopify Products</span>
                <span className="text-lg font-bold tabular-nums leading-tight">{shopifyTotal}</span>
              </div>
              <div className={`ml-4 p-2 rounded-lg ${syncing && syncType === "products" ? 'animate-spin' : ''}`}>
                <RefreshCw size={18} />
              </div>
            </button>
          </div>
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
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* Product Table Section */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Imported Inventory</h2>
            {loadingProducts && <span className="text-xs text-zinc-500 animate-pulse">Updating list...</span>}
          </div>
          
          <div className="p-2">
            <ProductTable 
              data={products} 
              pagination={pagination} 
              onPageChange={(p) => fetchLocalProducts(p)} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
