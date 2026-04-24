"use client";

import { useState, useEffect, useCallback } from "react";
import ReviewsTable from "./ReviewsTable";
import { MessageSquare, Search, RefreshCw, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncProgress, setSyncProgress] = useState(0);

  const fetchReviews = useCallback(async (page = 1, q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/list?page=${page}&limit=10${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to fetch reviews", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1, query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchReviews]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncProgress(0);
    setSyncStatus("Starting sync...");
    
    try {
      const response = await fetch("/api/sync-reviews", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed to start");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setSyncStatus(data.message);
            if (data.progress !== undefined) setSyncProgress(data.progress);
            
            if (data.status === "complete") {
              fetchReviews(1);
              setTimeout(() => setSyncing(false), 2000);
            }
            if (data.status === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            console.error("Chunk parse error", e);
          }
        }
      }
    } catch (err) {
      setSyncStatus(`Error: ${err.message}`);
      setTimeout(() => setSyncing(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="text-zinc-400" />
            Customer Reviews
          </h1>
          <p className="text-zinc-500">Manage and browse reviews synced from Nector.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-2.5 rounded-2xl shadow-sm text-center">
            <div className="flex items-center gap-3">
              <span className="font-bold text-2xl">{pagination.total.toLocaleString()}</span>
              <span className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Total</span>
            </div>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-xl shadow-sm font-bold text-sm uppercase tracking-widest transition-all ${syncing ? 'opacity-80 cursor-not-allowed' : 'hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95'}`}
          >
            {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {syncing ? "Syncing..." : "Sync All"}
          </button>
        </div>
      </div>

      {/* Sync Status Overlay */}
      {syncing && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="animate-spin text-zinc-400" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{syncStatus}</span>
            </div>
            <span className="text-sm font-bold">{syncProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 dark:bg-white transition-all duration-500 ease-out"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Recent Feedback</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search reviewer, product, or content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all"
              />
            </div>
            {loading && <Loader2 size={18} className="text-zinc-400 animate-spin" />}
          </div>
        </div>
        
        <div className="p-2">
          <ReviewsTable 
            data={reviews} 
            pagination={pagination} 
            onPageChange={(p) => fetchReviews(p, query)} 
          />
        </div>
      </div>
    </div>
  );
}
