"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import PincodeTable from "./PincodeTable";
import { MapPin, Search, FileDown, Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PincodesDashboard() {
  const [pincodes, setPincodes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  
  // Import modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPincodes = useCallback(async (page = 1, q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pincodes?page=${page}&limit=10${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      if (data.success) {
        setPincodes(data.pincodes || []);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to fetch pincodes", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPincodes(1, query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchPincodes]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError("Please select a CSV file first");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/sync/pincodes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImportResult(data);
        fetchPincodes(1); // Refresh data
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setImportError(data.error || "Failed to import pincodes");
      }
    } catch (err) {
      setImportError("An unexpected error occurred during import");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MapPin className="text-zinc-400" />
              Pincode Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage serviceability and payment availability by pincode.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={isImportOpen} onOpenChange={(open) => {
              setIsImportOpen(open);
              if (!open) resetImport();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-6 rounded-xl shadow-sm font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                  <FileDown size={18} />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Import Pincode CSV</DialogTitle>
                  <DialogDescription>
                    Select a CSV file containing pincode data. This will update the delivery and payment rules in the database.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedFile ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                  >
                    <Upload size={32} className={`mb-4 ${selectedFile ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
                    <span className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : "Click to select CSV file"}
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">
                      Max file size: 5MB
                    </span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>

                  {importResult && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <span className="font-bold">Imported {importResult.totalProcessed.toLocaleString()}</span> pincodes successfully.
                      </div>
                    </div>
                  )}

                  {importError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle size={20} className="text-red-600" />
                      <div className="text-sm text-red-700 dark:text-red-400 font-medium">
                        {importError}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="sm:justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImportOpen(false)}
                    disabled={importing}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={importing || !selectedFile}
                    className="bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg min-w-[100px]"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Saving...
                      </>
                    ) : "Save & Sync"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold italic">Serviceable Areas</h2>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by pincode..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all"
                />
              </div>
              {loading && <Loader2 size={18} className="text-zinc-400 animate-spin" />}
            </div>
          </div>
          
          <div className="p-2">
            <PincodeTable 
              data={pincodes} 
              pagination={pagination} 
              onPageChange={(p) => fetchPincodes(p, query)} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
