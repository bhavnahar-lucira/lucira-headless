"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditNomineeDialog from "./EditNomineeDialog";

export default function NomineeCard({ data, isLoading, error, onUpdated }) {
  if (isLoading) return <p>Loading nominee...</p>;
  if (error) return <p>Error loading nominee</p>;

  const customer = data?.Entities?.[0];
  if (!customer) return <p>No nominee data</p>;

  const nominee = customer.nominee || {};

  return (
    <Card className="mb-20">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Nominee Details</CardTitle>
        <EditNomineeDialog
          nominee={nominee}
          mobile={customer.mobile}
          onUpdated={onUpdated}
        />
      </CardHeader>

      <CardContent className="flex justify-between flex-col md:grid md:grid-cols-2 gap-4 text-sm">
        <p><b>Full Name:</b> {nominee.full_name || "-"}</p>
        <p><b>Age:</b> {nominee.age || "-"}</p>
        <p><b>Relation:</b> {nominee.relation || "-"}</p>
      </CardContent>
    </Card>
  );
}
