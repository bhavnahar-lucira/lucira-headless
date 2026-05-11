"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Search,
  AlertCircle,
  Loader2,
  Database
} from "lucide-react";

export default function SearchTermsPage() {
  const [synonyms, setSynonyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: "", synonyms: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSynonyms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/search-terms");
      const data = await res.json();
      if (data.success) {
        setSynonyms(data.synonyms);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch synonyms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSynonyms();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        title: item.title, 
        synonyms: item.synonyms.join(", ") 
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", synonyms: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ title: "", synonyms: "" });
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/search-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem?._id,
          title: formData.title,
          synonyms: formData.synonyms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchSynonyms();
        handleCloseModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to save synonym group");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this synonym group?")) return;

    try {
      const res = await fetch(`/api/dashboard/search-terms?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        fetchSynonyms();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed to delete synonym:", err);
    }
  };

  const filteredSynonyms = useMemo(() => {
    if (!searchQuery) return synonyms;
    const lowerQuery = searchQuery.toLowerCase();
    return synonyms.filter(
      item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.synonyms.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }, [synonyms, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search Synonyms</h1>
          <p className="text-zinc-500">
            Manage synonym groups to improve search results and collection matching.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search synonyms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 w-64"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Synonym Group
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-semibold text-sm">Group Title</th>
                <th className="px-6 py-4 font-semibold text-sm">Synonyms</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-zinc-300" />
                      <span>Loading synonyms...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSynonyms.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Database size={24} className="text-zinc-300" />
                      <span>No synonyms found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSynonyms.map((item) => (
                  <tr 
                    key={item._id} 
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.synonyms.map((s, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-md border border-zinc-200 dark:border-zinc-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-lg">
                {editingItem ? "Edit Synonym Group" : "Add Synonym Group"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                    Group Title (matches Collection Condition)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                    placeholder="e.g. Rings"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                    Synonyms (comma separated)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.synonyms}
                    onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                    placeholder="e.g. Band, Bandring, Finger Ring"
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Enter terms that users might search for to find this group.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {isSaving ? "Saving..." : "Save Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
