"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "./EditProfileDialog";

export default function ProfileForm({ data, isLoading, error, onUpdated }) {
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile</p>;

  const customer = data?.Entities?.[0];
  if (!customer) return <p>No data</p>;
 console.log(customer);
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Profile Details</CardTitle>
        <EditProfileDialog customer={customer} onUpdated={onUpdated} />
      </CardHeader>

      <CardContent className="flex justify-between flex-col md:grid md:grid-cols-2 gap-4 text-sm">
        <p><b>Full Name:</b> {customer.party_name}</p>
        <p><b>Email:</b> {customer.email || "-"}</p>
        <p><b>Mobile:</b> {customer.mobile}</p>
        <p><b>PAN:</b> {customer.pan_no || "-"}</p>
      </CardContent>
    </Card>
  );
}
