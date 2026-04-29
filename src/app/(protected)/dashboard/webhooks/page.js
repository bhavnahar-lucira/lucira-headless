"use client";

import { useState, useEffect } from "react";
import { 
  Webhook, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ created: 0, updated: 0, deleted: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Native formatters
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/dashboard/webhooks");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      case "failed":
        return <XCircle className="text-rose-500" size={18} />;
      default:
        return <Clock className="text-amber-500 animate-pulse" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Success</span>;
      case "failed":
        return <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">Failed</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">Processing</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Webhook className="text-zinc-400" size={24} />
            Webhook Logs
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Monitor real-time product updates from Shopify.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Logs"}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Created Today</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-500" size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.created}</div>
          <p className="text-[10px] text-zinc-400 font-bold">NEW PRODUCTS SYNCED</p>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Updated Today</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <RefreshCw className="text-blue-500" size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.updated}</div>
          <p className="text-[10px] text-zinc-400 font-bold">MODIFIED PRODUCTS</p>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deleted Today</span>
            <div className="p-2 bg-rose-50 rounded-lg">
              <XCircle className="text-rose-500" size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.deleted}</div>
          <p className="text-[10px] text-zinc-400 font-bold">REMOVED FROM STORE</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Event Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Changes</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8">
                      <div className="h-4 bg-zinc-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const duration = log.completedAt && log.startedAt 
                    ? ((new Date(log.completedAt) - new Date(log.startedAt)) / 1000).toFixed(2)
                    : null;

                  return (
                    <tr key={log._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{log.topic}</span>
                          <span className="text-[10px] font-medium text-zinc-400 font-mono mt-0.5">{log.eventId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.productHandle ? (
                          <div className="flex items-center gap-2 group">
                            <span className="text-sm font-semibold text-zinc-600 truncate max-w-[200px]">{log.productHandle}</span>
                            <a 
                              href={`/products/${log.productHandle}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-zinc-300 hover:text-primary transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-300 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md">
                          {typeof log.changes === 'string' 
                            ? log.changes 
                            : Array.isArray(log.changes) 
                              ? log.changes.map(c => c.field).join(", ") 
                              : "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                          {log.error && (
                            <div className="flex items-center gap-1.5 text-rose-500 mt-1">
                              <AlertTriangle size={12} />
                              <span className="text-[10px] font-bold truncate max-w-[250px]" title={log.error}>
                                {log.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-zinc-500">
                          {duration ? `${duration}s` : "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-zinc-900">
                            {timeFormatter.format(new Date(log.startedAt))}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                            {dateFormatter.format(new Date(log.startedAt))}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Webhook size={40} className="text-zinc-200" />
                      <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No webhook events found yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
