"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function EditProfileDialog({ customer, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: customer.party_name || "",
    email: customer.email || "",
  });
  console.log(customer);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    const res = await fetch("/api/scheme/customer/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: customer.party_id,
        phone:customer.mobile,
        party_name:form.full_name,
        email:form.email,
        address: customer.address || "",
        zip: customer.pin_code || "",
        city: customer.city_name || "",
        state: customer.state_name || "",
        country: customer.country_code || "",
      }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to update profile");
      return;
    }

    toast.success("Profile updated");
    setOpen(false);
    onUpdated?.();
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
            />

            <Input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
