"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function TopBarOffersPage() {
  const [announcements, setAnnouncements] = useState([{ text: "", url: "" }]);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (data.announcements && data.announcements.length > 0) {
        setAnnouncements(data.announcements);
      }
      setIsVisible(data.isVisible ?? true);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setAnnouncements([...announcements, { text: "", url: "" }]);
  };

  const handleRemove = (index) => {
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated.length > 0 ? updated : [{ text: "", url: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...announcements];
    updated[index][field] = value;
    setAnnouncements(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcements, isVisible }),
      });
      if (res.ok) {
        toast.success("Announcements saved successfully");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save announcements");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">TopBar Offers</h1>
          <p className="text-zinc-500 text-sm">Manage the sliding announcements in the header</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-100 px-4 py-2 rounded-lg border border-zinc-200">
            <span className="text-sm font-medium text-zinc-700">Show TopBar:</span>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isVisible ? "bg-primary" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isVisible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex gap-4 items-start">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Offer Text</label>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleChange(index, "text", e.target.value)}
                  placeholder="e.g. Free Shipping on All Orders"
                  className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">URL (Optional)</label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => handleChange(index, "url", e.target.value)}
                  placeholder="e.g. /collections/all"
                  className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={() => handleRemove(index)}
              className="mt-6 text-zinc-400 hover:text-red-500 transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Another Offer
        </button>
      </div>
    </div>
  );
}
