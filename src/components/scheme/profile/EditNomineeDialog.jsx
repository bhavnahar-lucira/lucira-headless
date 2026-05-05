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

export default function EditNomineeDialog({ nominee = {}, mobile, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: nominee.full_name || "",
    age: nominee.age || "",
    relation: nominee.relation || "",
  });

  const handleSubmit = async () => {
    setLoading(true);

    await fetch("/api/scheme/customer/nominee/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile,          // 🔒 identify user
        nominee: form,   // nominee payload
      }),
    });

    setLoading(false);
    setOpen(false);
    onUpdated(); // 🔁 SWR refresh
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:cursor-pointer">Edit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Nominee</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <Input
            className="col-span-3"
            placeholder="Full Name"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            placeholder="Age"
            type="number"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })}
          />
          <Input
            placeholder="Relation"
            value={form.relation}
            onChange={e => setForm({ ...form, relation: e.target.value })}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
