"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductTable from "./ProductTable";
import { RefreshCw, LayoutDashboard, Store, MessageSquare, Menu, Search } from "lucide-react";

export default function Dashboard() {
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState(""); // "products", "reviews", or "menu"
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [shopifyTotal, setShopifyTotal] = useState(0);
  
  // Progress tracking for resume
  const [lastSyncData, setLastSyncData] = useState({
    products: { cursor: null, totalProcessed: 0 },
    reviews: { skip: 0 }
  });

  const [products, setProducts] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [productQuery, setProductQuery] = useState("");

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

  // Fetch menus from our MongoDB
  const fetchMenus = async () => {
    setLoadingMenus(true);
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (e) {
      console.error("Failed to fetch menus", e);
    } finally {
      setLoadingMenus(false);
    }
  };

  // Fetch products from our MongoDB
  const fetchLocalProducts = useCallback(async (page = 1, q = "") => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products/search?page=${page}&limit=10${q ? `&q=${encodeURIComponent(q)}` : ""}`);
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
    fetchMenus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLocalProducts(1, productQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [productQuery, fetchLocalProducts]);

  const startSync = async (type = "products", isRetry = false) => {
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
          fetchMenus(); // Refresh menus list
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
            
            // Save progress for retries
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
              if (type === "products") fetchLocalProducts(1);
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
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => startSync("menu")} 
              disabled={syncing}
              className={`flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold text-sm uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Menu size={18} className="text-zinc-400" />
              Sync Menu
            </button>

            <button 
              onClick={() => startSync("reviews")} 
              disabled={syncing}
              className={`flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold text-sm uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MessageSquare size={18} className="text-zinc-400" />
              Sync Reviews
            </button>

            <button 
              onClick={() => startSync("products")} 
              disabled={syncing}
              className={`flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all ${syncing ? 'opacity-80 cursor-not-allowed' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95'}`}
            >
              <Store size={20} className="text-zinc-400" />
              <div className="flex flex-col text-left">
                <span className="text-lg text-zinc-500 font-medium uppercase tracking-wider">Shopify Products</span>
                <span className="text-xl font-bold text-black">{shopifyTotal}</span>
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
            
            {error && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-500">{error}</p>
                <button 
                  onClick={() => startSync(syncType, true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
                >
                  <RefreshCw size={14} />
                  Retry from failure
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product Table Section */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Imported Inventory</h2>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all"
                />
              </div>
              {loadingProducts && <span className="text-xs text-zinc-500 animate-pulse whitespace-nowrap">Updating...</span>}
            </div>
          </div>
          
          <div className="p-2">
            <ProductTable 
              data={products} 
              pagination={pagination} 
              onPageChange={(p) => fetchLocalProducts(p)} 
            />
          </div>
        </div>

        {/* Menus Section */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Synced Menus</h2>
            {loadingMenus && <span className="text-xs text-zinc-500 animate-pulse">Loading menus...</span>}
          </div>
          
          <div className="p-6">
            {menus.length === 0 && !loadingMenus ? (
              <p className="text-zinc-500 text-center py-10">No menus synced yet. Click "Sync Menu" to start.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu) => (
                  <div 
                    key={menu.id} 
                    onClick={() => setSelectedMenu(menu)}
                    className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg group-hover:text-black dark:group-hover:text-white">{menu.title}</h3>
                      <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
                        {menu.handle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Menu size={14} />
                      <span>{menu.items?.length || 0} top-level items</span>
                    </div>
                    <div className="pt-2 text-[10px] text-zinc-400 uppercase tracking-widest flex justify-between">
                      <span>Last Synced</span>
                      <span>{new Date(menu.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Menu Details Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{selectedMenu.title}</h2>
                <p className="text-sm text-zinc-500 font-mono">{selectedMenu.handle}</p>
              </div>
              <button 
                onClick={() => setSelectedMenu(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <RefreshCw size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <MenuTree items={selectedMenu.items} />
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedMenu(null)}
                className="px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuTree({ items, level = 0 }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-6 border-l border-zinc-200 dark:border-zinc-800 pl-4" : ""}`}>
      {items.map((item) => (
        <div key={item.id} className="group">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <span className="text-sm font-medium">{item.title}</span>
            {item.type && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-bold">
                {item.type}
              </span>
            )}
            {item.resource?.metafields?.nodes?.length > 0 && (
              <span className="text-[10px] text-green-600 dark:text-green-500 font-bold italic">
                +{item.resource.metafields.nodes.length} metafields
              </span>
            )}
          </div>
          {item.items && <MenuTree items={item.items} level={level + 1} />}
        </div>
      ))}
    </div>
  );
}
