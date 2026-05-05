"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditAddressDialog from "./EditAddressDialog";

export default function AddressCard({ data, isLoading, error, onUpdated }) {
  if (isLoading) return <p>Loading address...</p>;
  if (error) return <p>Error loading address</p>;

  const customer = data?.Entities?.[0];
  if (!customer) return <p>No address found</p>;
  console.log(customer);
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Address</CardTitle>
        <EditAddressDialog customer={customer} onUpdated={onUpdated} />
      </CardHeader>

      <CardContent className="flex justify-between flex-col md:grid md:grid-cols-2 gap-4 text-sm">
        <p className="col-span-2">
          <b>Address:</b> {customer.address || "-"}
        </p>
        <p><b>Pincode:</b> {customer.pin_code || "-"}</p>
        <p><b>City:</b> {customer.city_name || "-"}</p>
        <p><b>State:</b> {customer.state_name || "-"}</p>
        <p><b>Country:</b> {customer.country_code || "-"}</p>
      </CardContent>
    </Card>
  );
}
