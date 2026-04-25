"use client";

import { useState, useEffect } from "react";
import { Store, RefreshCw, MapPin, Phone, CheckCircle2, XCircle, Package } from "lucide-react";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState(""); // "stores" or "inventory"
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      setStores(data.stores || []);
    } catch (e) {
      console.error("Failed to fetch stores", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const startStoreSync = async () => {
    setSyncing(true);
    setSyncType("stores");
    setStatus("Fetching locations from Shopify...");
    setProgress(0);
    setError(null);

    try {
      const response = await fetch("/api/sync-stores", { method: "POST" });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to sync stores");
      
      setStatus(data.message);
      setProgress(100);
      setTimeout(() => {
        setSyncing(false);
        fetchStores();
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSyncing(false);
    }
  };

  const startInventorySync = async () => {
    setSyncing(true);
    setSyncType("inventory");
    setStatus("Initiating inventory count...");
    setProgress(0);
    setError(null);

    try {
      const response = await fetch("/api/sync-inventory-counts", { method: "POST" });
      if (!response.ok) throw new Error("Failed to start inventory sync");

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
              fetchStores();
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
    <div className="p-6 sm:p-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Store className="text-zinc-400" />
            Store Locations
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your physical store locations and their inventory counts.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={startStoreSync} 
                disabled={syncing}
                className={`flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-2 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95 ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <MapPin size={18} className={syncing && syncType === "stores" ? "animate-pulse" : ""} />
                Fetch Stores
            </button>

            <button 
                onClick={startInventorySync} 
                disabled={syncing || stores.length === 0}
                className={`flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95 ${syncing || stores.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <RefreshCw size={18} className={syncing && syncType === "inventory" ? "animate-spin" : ""} />
                Sync Counts
            </button>
        </div>
      </div>

      {/* Sync Status Overlay */}
      {(syncing || error) && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 max-w-2xl">
          <div className="flex justify-between items-center">
            <span className={`font-semibold ${error ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {error ? "Sync Failed" : status}
            </span>
            {!error && syncType === "inventory" && <span className="text-sm font-bold">{progress}%</span>}
          </div>
          
          {syncType === "inventory" && (
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                className={`h-full transition-all duration-500 ease-out ${error ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
                style={{ width: `${progress}%` }}
                />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-500">{error}</p>
              <button 
                onClick={syncType === "stores" ? startStoreSync : startInventorySync}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {loading && !syncing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
          <Store size={48} className="mx-auto text-zinc-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Stores Found</h3>
          <p className="text-zinc-500 mb-6">You haven't synced your Shopify locations yet.</p>
          <button 
            onClick={startStoreSync}
            className="px-8 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-bold"
          >
            Fetch Stores from Shopify
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <div 
              key={store.shopifyId} 
              className="group bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl group-hover:text-black dark:group-hover:text-white transition-colors">{store.name}</h3>
                    <p className="text-xs font-mono text-zinc-400">{store.shopifyId}</p>
                  </div>
                  {store.isActive ? (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      <XCircle size={12} />
                      Inactive
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                    <MapPin size={18} className="shrink-0 text-zinc-400" />
                    <div className="text-sm leading-relaxed">
                      <p>{store.address1}</p>
                      {store.address2 && <p>{store.address2}</p>}
                      <p>{store.city}, {store.provinceCode} {store.zip}</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{store.country}</p>
                    </div>
                  </div>

                  {store.phone && (
                    <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                      <Phone size={18} className="shrink-0 text-zinc-400" />
                      <span className="text-sm">{store.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <Package size={18} className="shrink-0 text-zinc-400" />
                    <span className="text-sm font-medium">
                      {store.productCount !== undefined ? `${store.productCount} Products` : 'Count not synced'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Pincode</span>
                  <p className={`text-sm font-bold ${store.pincode ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    {store.pincode || 'Not Found'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Coordinates</span>
                  <p className={`text-sm font-bold ${store.latitude ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    {store.latitude ? `${store.latitude.toFixed(4)}, ${store.longitude.toFixed(4)}` : 'No GPS Data'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
