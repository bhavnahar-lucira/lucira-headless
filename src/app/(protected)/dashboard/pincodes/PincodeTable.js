"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Edit2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PincodeTable({ data, pagination, onPageChange }) {
  const [editingPincode, setEditingPincode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ latitude: "", longitude: "" });

  const handleEdit = (pincodeData) => {
    setEditingPincode(pincodeData);
    setEditForm({
      latitude: pincodeData.latitude || "",
      longitude: pincodeData.longitude || "",
    });
  };

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/pincodes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: editingPincode.pincode,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
        }),
      });

      if (res.ok) {
        setEditingPincode(null);
        onPageChange(pagination.page); // Refresh current page
      }
    } catch (e) {
      console.error("Failed to save pincode", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Defensive pagination values
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  const columns = [
    {
      accessorKey: "pincode",
      header: "Pincode",
      cell: ({ getValue }) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-50">{getValue()}</span>
      ),
    },
    {
      accessorKey: "cod",
      header: "COD",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          {getValue() ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
          <span className="text-xs uppercase font-medium">{getValue() ? "Available" : "No"}</span>
        </div>
      ),
    },
    {
      accessorKey: "upi",
      header: "UPI",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          {getValue() ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
          <span className="text-xs uppercase font-medium">{getValue() ? "Available" : "No"}</span>
        </div>
      ),
    },
    {
      accessorKey: "latitude",
      header: "Latitude",
      cell: ({ getValue }) => (
        <span className="text-zinc-500 font-mono text-xs">{getValue() || "-"}</span>
      ),
    },
    {
      accessorKey: "longitude",
      header: "Longitude",
      cell: ({ getValue }) => (
        <span className="text-zinc-500 font-mono text-xs">{getValue() || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button 
          onClick={() => handleEdit(row.original)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <Edit2 size={16} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-zinc-500">
          Page {currentPage} of {totalPages} ({totalItems.toLocaleString()} total)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 border rounded-lg disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 border rounded-lg disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingPincode} onOpenChange={(open) => !open && setEditingPincode(null)}>
        <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Edit Coordinates: {editingPincode?.pincode}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Latitude</label>
              <input
                className="col-span-3 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                value={editForm.latitude}
                onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                placeholder="e.g. 19.1663"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Longitude</label>
              <input
                className="col-span-3 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                value={editForm.longitude}
                onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                placeholder="e.g. 72.8526"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPincode(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={isSaving} className="bg-black dark:bg-white text-white dark:text-black">
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
