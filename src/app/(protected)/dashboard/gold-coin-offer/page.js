"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Gift } from "lucide-react";
import { toast } from "react-toastify";

export default function GoldCoinOfferPage() {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings/gold-coin");
      const data = await res.json();
      setEnabled(data.enabled ?? false);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/gold-coin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
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
          <h1 className="text-2xl font-bold text-zinc-900">Gold Coin Offer</h1>
          <p className="text-zinc-500 text-sm">Enable or disable the Free Gold Coin offer across the website</p>
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

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
              <Gift size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Enable Gold Coin Offer</h3>
              <p className="text-sm text-zinc-500">
                When enabled, the "Savings Banners Slider" on PDP and the "Gold Coin Offer Card" in Cart will be visible.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
              enabled ? "bg-primary" : "bg-zinc-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="text-sm font-bold text-blue-900 mb-2">Note:</h4>
        <ul className="text-sm text-blue-800 list-disc ml-5 space-y-1">
          <li>This toggle controls the visibility of promotional banners for the gold coin offer.</li>
          <li>It affects the PDP (Product Detail Page) Savings Banners.</li>
          <li>It affects the Cart page's Gold Coin offer card.</li>
        </ul>
      </div>
    </div>
  );
}
