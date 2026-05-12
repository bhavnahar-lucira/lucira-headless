"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "react-toastify";

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ path: "", target: "" });
  const [isImporting, setIsImporting] = useState(false);

  const fetchRedirects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/redirects?page=${page}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setRedirects(data.redirects);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.error || "Failed to fetch redirects");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching redirects");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/dashboard/redirects/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Synced ${data.count} redirects from Shopify`);
        fetchRedirects();
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch (error) {
      toast.error("Sync error occurred");
    } finally {
      setSyncing(false);
    }
  };

  const handleAddRedirect = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dashboard/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRedirect)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Redirect added successfully");
        setNewRedirect({ path: "", target: "" });
        setIsAddModalOpen(false);
        fetchRedirects();
      } else {
        toast.error(data.error || "Failed to add redirect");
      }
    } catch (error) {
      toast.error("Error adding redirect");
    }
  };

  const handleDelete = async (shopifyId) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;
    try {
      const res = await fetch(`/api/dashboard/redirects?shopifyId=${shopifyId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Redirect deleted");
        fetchRedirects();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Delete error occurred");
    }
  };

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const lines = content.split("\n");
      const bulkData = [];

      // Assume first line is header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parse (handling comma-separated)
        const parts = line.split(",");
        if (parts.length >= 2) {
          bulkData.push({
            path: parts[0].trim(),
            target: parts[1].trim()
          });
        }
      }

      if (bulkData.length === 0) {
        toast.warning("No valid data found in CSV");
        setIsImporting(false);
        return;
      }

      try {
        const res = await fetch("/api/dashboard/redirects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bulk: bulkData })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Imported ${data.imported} redirects`);
          if (data.errors) {
            console.warn("Some imports failed:", data.errors);
            toast.warning(`${data.errors.length} redirects failed to import. Check console for details.`);
          }
          fetchRedirects();
        } else {
          toast.error(data.error || "Import failed");
        }
      } catch (error) {
        toast.error("Import error occurred");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">URL Redirects</h1>
          <p className="text-zinc-500">Manage your store's URL redirections for products and collections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync with Shopify"}
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Upload size={18} />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" disabled={isImporting} />
          </label>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <Plus size={18} />
            Add Redirect
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by path or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-400 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Redirect From</th>
                <th className="px-6 py-4">Redirect To</th>
                <th className="px-6 py-4 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-8"></div></td>
                  </tr>
                ))
              ) : redirects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-zinc-500">
                    No redirects found. Try syncing or adding one.
                  </td>
                </tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        {r.path}
                        <a href={r.path} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-2">
                        {r.target}
                        {r.target.startsWith("/") && (
                          <a href={r.target} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(r.shopifyId)}
                        className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Redirect"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold">Add New Redirect</h3>
              <p className="text-sm text-zinc-500">Create a permanent 301 redirect.</p>
            </div>
            <form onSubmit={handleAddRedirect} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Redirect From (Path)</label>
                <input
                  type="text"
                  required
                  placeholder="/old-url"
                  value={newRedirect.path}
                  onChange={(e) => setNewRedirect({ ...newRedirect, path: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Redirect To (Target)</label>
                <input
                  type="text"
                  required
                  placeholder="/new-url or https://..."
                  value={newRedirect.target}
                  onChange={(e) => setNewRedirect({ ...newRedirect, target: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Create Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl flex flex-col items-center">
            <RefreshCw className="animate-spin text-zinc-400 mb-4" size={32} />
            <p className="font-medium">Importing redirects...</p>
            <p className="text-sm text-zinc-500 mt-2">This may take a minute for large files.</p>
          </div>
        </div>
      )}
    </div>
  );
}
