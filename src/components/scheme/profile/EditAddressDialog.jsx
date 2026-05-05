"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function EditAddressDialog({
  customer,
  onUpdated,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    address: customer.address || "",
    pincode: customer.pin_code || "",
    city: customer.city_name || "",
    state: customer.state_name || "",
    country: customer.country_code || "",
  });

  const handleSubmit = async () => {
    if (loading) return;

    // ✅ Basic validation
    if (!form.address || !form.city || !form.state || !form.country) {
      return toast.error("Please fill all address fields");
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      return toast.error("Enter valid 6-digit pincode");
    }

    setLoading(true);

    const res = await fetch("/api/scheme/customer/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: customer.party_id,
        phone: customer.mobile,
        party_name:customer.party_name,
        email:customer.email,
        address: form.address,
        zip: form.pincode,
        city: form.city,
        state: form.state,
        country: form.country,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to update address");
      return;
    }

    toast.success("Address updated");
    setOpen(false);
    onUpdated?.(); // 🔁 SWR revalidate
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:cursor-pointer">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Input
            className="col-span-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <Input
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) =>
              setForm({ ...form, pincode: e.target.value })
            }
          />

          <Input
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm({ ...form, city: e.target.value })
            }
          />

          <Input
            placeholder="State"
            value={form.state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value })
            }
          />

          <Input
            placeholder="Country"
            value={form.country}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value })
            }
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
