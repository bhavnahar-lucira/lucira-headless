"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  CheckCircle2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import {
  fetchCustomerAddresses,
  deleteCustomerAddress,
  selectDefaultCustomerAddress,
  createCustomerAddress,
  updateCustomerAddress
} from "@/lib/api";

const emptyAddressForm = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "India",
  phone: "",
  gstin: "",
};

function normalizeAddressForm(address = {}) {
  return {
    ...emptyAddressForm,
    ...address,
    country: address.country || "India",
  };
}

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [makeDefault, setMakeDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await fetchCustomerAddresses();
      setAddresses(payload.addresses || []);
    } catch (error) {
      toast.error(error.message || "Unable to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingAddressId("");
    setAddressForm(emptyAddressForm);
    setMakeDefault(addresses.length === 0);
    setDialogOpen(true);
  };

  const openEditDialog = (address) => {
    setDialogMode("edit");
    setEditingAddressId(address.id);
    setAddressForm(normalizeAddressForm(address));
    setMakeDefault(Boolean(address.isDefault));
    setDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.firstName || !addressForm.address1 || !addressForm.zip) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setSaving(true);
      if (dialogMode === "create") {
        await createCustomerAddress({ address: addressForm, makeDefault });
        toast.success("Address added successfully");
      } else {
        await updateCustomerAddress({ addressId: editingAddressId, address: addressForm, makeDefault });
        toast.success("Address updated successfully");
      }
      setDialogOpen(false);
      loadAddresses();
    } catch (error) {
      toast.error(error.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      await deleteCustomerAddress(id);
      toast.success("Address removed successfully");
      loadAddresses();
    } catch (error) {
      toast.error(error.message || "Failed to remove address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await selectDefaultCustomerAddress(id);
      toast.success("Default address updated");
      loadAddresses();
    } catch (error) {
      toast.error(error.message || "Failed to set default address");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">Saved Addresses</h2>
          <p className="text-zinc-500 font-medium">Manage your shipping and billing locations for faster checkout.</p>
        </div>
        <button 
          onClick={openCreateDialog}
          className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Address
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-[3rem] border border-zinc-100">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading your locations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white rounded-[2rem] border-2 p-6 transition-all duration-300 relative group ${
                address.isDefault ? 'border-primary shadow-xl shadow-primary/5' : 'border-zinc-100 hover:border-zinc-200 shadow-sm'
              }`}
            >
              {address.isDefault && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-primary/20 flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  Default
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <MapPin size={20} />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditDialog(address)}
                      className="size-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    {!address.isDefault && (
                      <button 
                        onClick={() => handleDelete(address.id)}
                        className="size-8 rounded-lg bg-zinc-50 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-zinc-900 line-clamp-1">
                    {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-3">
                    {address.address1}{address.address2 ? `, ${address.address2}` : ""}, {address.city}, {address.province} {address.zip}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
                  <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
                    {address.phone || "No phone"}
                  </span>
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address.id)}
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="md:col-span-4 py-20 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-zinc-100">
              <div className="size-20 bg-zinc-50 text-zinc-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900">No addresses saved</h3>
                <p className="text-zinc-500 font-medium max-w-sm mx-auto">Add a shipping address to make your checkout experience seamless.</p>
              </div>
              <button 
                onClick={openCreateDialog}
                className="px-10 py-4 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                Add My First Address
              </button>
            </div>
          )}
        </div>
      )}

      {/* Address Dialog - Matching Shipping Page Style */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">
                  {dialogMode === "edit" ? "Edit Address" : "Add New Address"}
                </DialogTitle>
                <DialogDescription className="text-zinc-500 font-medium">
                  Provide your address details below for accurate delivery.
                </DialogDescription>
              </div>
              <button onClick={() => setDialogOpen(false)} className="size-10 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="First name" 
                  value={addressForm.firstName} 
                  onChange={(e) => setAddressForm({...addressForm, firstName: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
                <Input 
                  placeholder="Last name" 
                  value={addressForm.lastName} 
                  onChange={(e) => setAddressForm({...addressForm, lastName: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Address" 
                    value={addressForm.address1} 
                    onChange={(e) => setAddressForm({...addressForm, address1: e.target.value})} 
                    className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                  />
                </div>
                <Input 
                  placeholder="City" 
                  value={addressForm.city} 
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
                <Input 
                  placeholder="State" 
                  value={addressForm.province} 
                  onChange={(e) => setAddressForm({...addressForm, province: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
                <Input 
                  placeholder="PIN code" 
                  value={addressForm.zip} 
                  onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
                <Input 
                  placeholder="Phone" 
                  value={addressForm.phone} 
                  onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} 
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold" 
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-zinc-50 rounded-2xl">
                <Checkbox 
                  id="make-default" 
                  checked={makeDefault} 
                  onCheckedChange={(checked) => setMakeDefault(Boolean(checked))} 
                  className="border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="make-default" className="text-xs font-black text-zinc-600 uppercase tracking-widest cursor-pointer">
                  Set as my default address
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="px-8 h-14 border-zinc-200 text-zinc-600 font-bold rounded-2xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAddress}
              disabled={saving}
              className="px-12 h-14 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20"
            >
              {saving ? <Loader2 className="size-5 animate-spin" /> : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
