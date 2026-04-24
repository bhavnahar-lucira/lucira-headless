"use client";

import { useState } from "react";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function PincodeSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/sync/pincodes", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to import pincodes");
      }
    } catch (err) {
      setError("An unexpected error occurred during import");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Import Pincode Data</h1>
        <p className="text-zinc-500">
          Update the local database with the latest delivery and payment availability for each pincode.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <MapPin
              size={48}
              className={`text-zinc-400 ${loading ? "animate-bounce" : ""}`}
            />
          </div>

          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Pincode Availability Data</h2>
          <p className="text-zinc-500 mb-8 max-w-md">
            This will read the pincode CSV file from your downloads folder and update the system's delivery rules.
          </p>

          <button
            onClick={handleImport}
            disabled={loading}
            className={`flex items-center gap-2 px-10 py-3 rounded-lg font-medium transition-all ${
              loading
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Importing...
              </>
            ) : error ? (
              "Retry Import"
            ) : (
              "Start Import"
            )}
          </button>

          {result && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl w-full max-w-md">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-3">
                <CheckCircle size={24} />
                <span className="font-bold">Import Successful!</span>
              </div>
              <p className="text-left text-sm text-green-600 dark:text-green-500 font-medium">
                Successfully processed and updated <span className="text-lg font-bold">{result.totalProcessed.toLocaleString()}</span> pincodes.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl w-full max-w-md text-left">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-400 mb-2">
                <AlertCircle size={24} />
                <span className="font-bold">Import Error</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500">
                {error}
              </p>
              <p className="mt-2 text-xs text-red-400">
                Ensure the file exists at: C:\Users\inter\Downloads\Pincodes_with_LatLong (1).csv
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
