"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setSelectedAgentStore } from "@/redux/features/scheme/agentStoreSlice";

export function StoreForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const stores = useSelector((state) => state.agentStore.stores);

  const [selectedStoreCode, setSelectedStoreCode] = useState("");

  const chooseStore = async (e) => {
    e.preventDefault();

    if (!selectedStoreCode) return;

    const selectedStore = stores.find(
      (s) => String(s.company_code) === selectedStoreCode
    );

    dispatch(setSelectedAgentStore(selectedStore));

    router.replace("/admin/scheme");
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={chooseStore}>
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-2xl">Select Your Current Store</h1>

        <div className="flex flex-col gap-5 w-full">
          <Select
            value={selectedStoreCode}
            onValueChange={setSelectedStoreCode}
          >
            <SelectTrigger className="w-full h-15">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Store</SelectLabel>

                {stores.map((store) => (
                  <SelectItem
                    key={store.user_company_id}
                    value={String(store.company_code)}
                    disabled={store.is_disabled}
                  >
                    {store.mailing_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button type="submit" className="h-15 w-full uppercase text-lg">
            Select
          </Button>
        </div>
      </div>
    </form>
  );
}