"use client";

import { useState, useEffect } from "react";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  LayoutGrid, 
  Store, 
  MessageSquare, 
  Menu 
} from "lucide-react";

export default function SyncPage() {
  // --- States from Dashboard Page ---
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [shopifyTotal, setShopifyTotal] = useState(0);
  
  // Progress tracking for resume
  const [lastSyncData, setLastSyncData] = useState({
    products: { cursor: null, totalProcessed: 0 },
    reviews: { skip: 0 }
  });

  // Specific results for the quick sync cards
  const [results, setResults] = useState({ pages: null, collections: null });

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

  useEffect(() => {
    fetchShopifyCount();
  }, []);

  const startSync = async (type, isRetry = false) => {
    // Reset specific results if doing a general sync
    if (type === 'pages' || type === 'collections') {
      handleSimpleSync(type);
      return;
    }

    setSyncing(true);
    setSyncType(type);
    setStatus(isRetry ? `Resuming ${type} sync...` : `Initiating ${type} sync...`);
    if (!isRetry) setProgress(0);
    setError(null);

    if (type === "menu") {
      try {
        const response = await fetch("/api/sync-menu", { method: "POST" });
        const data = await response.json();
        if (data.success) {
          setStatus(data.message);
          setProgress(100);
          setTimeout(() => setSyncing(false), 2000);
        } else {
          throw new Error(data.error || "Failed to sync menu");
        }
      } catch (err) {
        setError(err.message);
        setSyncing(false);
      }
      return;
    }

    const apiPaths = {
      products: "/api/sync-shopify",
      reviews: "/api/sync-reviews"
    };
    const apiPath = apiPaths[type];
    
    const body = {};
    if (isRetry) {
      if (type === "products") {
        body.cursor = lastSyncData.products.cursor;
        body.totalProcessed = lastSyncData.products.totalProcessed;
      } else if (type === "reviews") {
        body.skip = lastSyncData.reviews.skip;
      }
    }

    try {
      const response = await fetch(apiPath, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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
            
            if (data.status === "progress") {
              if (type === "products" && data.cursor) {
                setLastSyncData(prev => ({
                  ...prev,
                  products: { cursor: data.cursor, totalProcessed: data.totalProcessed }
                }));
              } else if (type === "reviews" && data.skip !== undefined) {
                setLastSyncData(prev => ({
                  ...prev,
                  reviews: { skip: data.skip }
                }));
              }
            }

            if (data.status === "error") {
              setError(data.message);
              setSyncing(false);
              return;
            }
            if (data.status === "complete") {
              setSyncing(false);
              setLastSyncData(prev => ({
                ...prev,
                [type]: type === "products" ? { cursor: null, totalProcessed: 0 } : { skip: 0 }
              }));
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

  const handleSimpleSync = async (type) => {
    setSyncing(true);
    setSyncType(type);
    setStatus(`Syncing ${type}...`);
    setProgress(0);
    setError(null);
    setResults(prev => ({ ...prev, [type]: null }));

    const apiPath = type === 'pages' ? "/api/sync/shopify" : "/api/sync/collections";

    try {
      const response = await fetch(apiPath, { method: "POST" });
      const data = await response.json();

      if (data.success) {
        setResults(prev => ({ ...prev, [type]: data }));
        setProgress(100);
        setStatus(`Sync Complete`);
        setTimeout(() => setSyncing(false), 2000);
      } else {
        throw new Error(data.error || "Failed to sync");
      }
    } catch (err) {
      setError(err.message);
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">General Sync Hub</h1>
        <p className="text-zinc-500">
          Synchronize your Shopify inventory, content, and metadata to MongoDB.
        </p>
      </div>

      {/* active Sync Status */}
      {(syncing || error) && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className={syncing && !error ? "animate-spin text-primary" : "text-zinc-400"} />
              <span className={`text-lg font-semibold ${error ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {error ? "Sync Failed" : status}
              </span>
            </div>
            {!error && <span className="text-xl font-bold font-mono">{progress}%</span>}
          </div>
          
          <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${error ? 'bg-red-500' : 'bg-primary dark:bg-white'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {error && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => startSync(syncType, true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm shrink-0"
              >
                <RefreshCw size={14} />
                Retry from failure
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Products Sync Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
            <Store size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Inventory Sync</h2>
          <p className="text-zinc-500 text-sm mb-4">Update local product catalog from Shopify.</p>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            {shopifyTotal} Products Available
          </div>
          <button
            onClick={() => startSync('products')}
            disabled={syncing}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all mt-auto"
          >
            Sync Products
          </button>
        </div>

        {/* Collections Sync Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
            <LayoutGrid size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Collections Sync</h2>
          <p className="text-zinc-500 text-sm mb-8">Sync FAQs, SEO Content, and Collection metadata.</p>
          <button
            onClick={() => startSync('collections')}
            disabled={syncing}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all mt-auto"
          >
            Sync Collections
          </button>
          {results.collections && (
            <div className="mt-4 text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> Updated {results.collections.count} items
            </div>
          )}
        </div>

        {/* Pages & Blogs Sync Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-600">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Content Sync</h2>
          <p className="text-zinc-500 text-sm mb-8">Synchronize all Shopify Pages and Blog Articles.</p>
          <button
            onClick={() => startSync('pages')}
            disabled={syncing}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all mt-auto"
          >
            Sync Pages/Blogs
          </button>
          {results.pages && (
            <div className="mt-4 text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> Synced {results.pages.pagesCount} pages
            </div>
          )}
        </div>

        {/* Reviews Sync Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-6 p-4 bg-pink-50 dark:bg-orange-900/20 rounded-full text-pink-600">
            <MessageSquare size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Reviews Sync</h2>
          <p className="text-zinc-500 text-sm mb-8">Import latest customer reviews and ratings.</p>
          <button
            onClick={() => startSync('reviews')}
            disabled={syncing}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all mt-auto"
          >
            Sync Reviews
          </button>
        </div>

        {/* Menu Sync Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600">
            <Menu size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Menu Sync</h2>
          <p className="text-zinc-500 text-sm mb-8">Update Store Navigation and Mega Menus.</p>
          <button
            onClick={() => startSync('menu')}
            disabled={syncing}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all mt-auto"
          >
            Sync Menus
          </button>
        </div>

      </div>
    </div>
  );
}


