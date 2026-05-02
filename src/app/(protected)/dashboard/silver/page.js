"use client";

import { useState, useEffect } from "react";
import { Save, Info, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SilverDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metalPrices, setMetalPrices] = useState({});
  const [silver10gm, setSilver10gm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/metal-prices");
      const data = await res.json();
      if (data.values) {
        setMetalPrices(data.values);
        // silver_price stored as per 1gm, so *10 gives 10gm rate
        const current10gm = (Number(data.values.silver_price) * 10) || 0;
        setSilver10gm(current10gm.toString());
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      setMessage({ type: "error", text: "Failed to load current rates." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      // Store as 1gm rate internally (10gm input / 10)
      const silver1gm = parseFloat(silver10gm) / 10;

      const newValues = {
        ...metalPrices,
        silver_price: silver1gm.toString(),
      };

      const res = await fetch("/api/dashboard/metal-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: newValues }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Silver rate updated successfully!" });
        setMetalPrices(newValues);
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: errorData.errors?.[0]?.message || "Failed to update rate." });
      }
    } catch (error) {
      console.error("Failed to save prices:", error);
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  // Derived values shown in preview
  const rate10gm = parseFloat(silver10gm || 0);
  const rate1kg = rate10gm * 100;   // 10gm × 100 = 1 Kg
  const rate1gm = rate10gm / 10;   // 10gm ÷ 10 = 1 gm

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Silver Rate Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Update today's silver rate for the entire storefront.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Last Synced</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === "success"
            ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400"
            : "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Input */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Daily Rate Settings</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Silver Rate (for 10 Grams)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                    <span className="text-lg font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    value={silver10gm}
                    onChange={(e) => setSilver10gm(e.target.value)}
                    placeholder="e.g. 2548"
                    className="block w-full pl-10 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all outline-none"
                  />
                </div>
                <p className="mt-3 text-sm text-zinc-500 flex items-center gap-2">
                  <Info size={14} />
                  Enter the 999 Silver rate per 10 grams. The 1 Kg rate is auto-calculated as 10 gm × 100.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !silver10gm}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white py-4 px-6 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 dark:shadow-none"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Updating Shopify...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Rate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview + Note */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors" />
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Live Preview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">10 Grams (Storefront)</p>
                <p className="text-2xl font-bold">₹ {rate10gm.toLocaleString('en-IN')}</p>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">1 Kilogram (Auto × 100)</p>
                <p className="text-xl font-bold text-zinc-300">₹ {rate1kg.toLocaleString('en-IN')}</p>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">1 Gram (Internal ÷ 10)</p>
                <p className="text-lg font-medium text-zinc-400">₹ {rate1gm.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6">
            <h4 className="text-amber-900 dark:text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Important Note
            </h4>
            <p className="text-amber-800/80 dark:text-amber-400/60 text-xs leading-relaxed">
              The 1 Kg rate is automatically derived as <strong>10 gm rate × 100</strong>. Updating this will immediately reflect on the Silver Rate page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
