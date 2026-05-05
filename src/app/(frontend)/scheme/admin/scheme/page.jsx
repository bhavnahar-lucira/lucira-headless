"use client";

import { useState } from "react";
import useSWR from "swr";
import { agentFetch } from "@/lib/scheme/agentApi";
import { DataTable } from "@/components/scheme/agent/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { handleReceiptDownload } from "@/lib/scheme/schemeReceiptClient";

/* ================= FETCHER ================= */
const fetcher = async (url) => {
  const isAgentApi = url.startsWith("/api/scheme/agent-");
  if (isAgentApi) {
    const res = await agentFetch(url, { method: "POST" });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

export default function AgentSchemeList() {
  const { data, error, isLoading } = useSWR(
    "/api/scheme/agent-schemes",
    fetcher
  );

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [downloadingKey, setDownloadingKey] = useState("");

  // Use mobile for more reliable fetching, similar to the user-side profile
  const { data: recordsData } = useSWR(
    selectedScheme?.mobile
      ? `/api/scheme/payment-records?mobile=${selectedScheme.mobile}`
      : null,
    fetcher
  );

  // Filter records locally for the selected scheme enrollment ID
  const paymentRecords = (recordsData?.records || []).filter(r => {
    const eid = 
      r.enrollment_entity_id || 
      r.receipt_retrieve_result?.Entity?.scheme_enrollment_id || 
      r.enrolled_scheme?.scheme_enrollment_id;
    return String(eid) === String(selectedScheme?.scheme_enrollment_id);
  });

  const downloadSchemeReceipt = async (scheme, receiptEntityId = null) => {
    const key = receiptEntityId
      ? String(receiptEntityId)
      : String(scheme.scheme_enrollment_id);

    try {
      setDownloadingKey(key);
      await handleReceiptDownload({
        customer: {
          party_id: scheme.party_id,
          mobile: scheme.mobile,
          name: scheme.party_name,
        },
        enrollmentEntityId: scheme.scheme_enrollment_id,
        receiptEntityId,
      });
    } finally {
      setDownloadingKey("");
    }
  };

  if (isLoading) return <p>Loading schemes…</p>;
  if (error) return <p>Error loading schemes</p>;

  const schemes = data?.Entities || [];

  /* =====================================================
     🔎 DETAIL VIEW
  ===================================================== */

  if (selectedScheme) {
    return (
      <div className="space-y-6 mt-5 mb-20">
        <Button
          variant="outline"
          onClick={() => setSelectedScheme(null)}
        >
          ← Back to Schemes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedScheme.scheme_unique_code} |{" "}
              {selectedScheme.scheme_display_name}
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>                  
                  <th className="p-2 text-left">Due Date</th>
                  <th className="p-2 text-left">Month Amount</th>
                  <th className="p-2 text-left">Paid On</th>
                  <th className="p-2 text-left">Delay</th>
                  <th className="p-2 text-left">Days Held</th>
                  <th className="p-2 text-left">Applied Rate</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Receipt</th>
                </tr>
              </thead>

              <tbody>
                {selectedScheme.scheme_monthly_details?.map((row) => {
                  const pending = !row.payment_made;

                  // Match with records from MongoDB
                  const matchingRecord = paymentRecords.find((r) => {
                    const monthIds =
                      r.receipt_retrieve_result?.Entity?.month_ids ||
                      r.receipt_create_payload?.Entity?.month_ids ||
                      r.receipt_create_payload?.month_ids ||
                      [];
                    if (monthIds.map(String).includes(String(row.month_id))) return true;

                    // Fallback for single record match
                    const paidCount = selectedScheme.scheme_monthly_details.filter(m => m.payment_made).length;
                    if (paymentRecords.length === 1 && paidCount === 1 && !pending) return true;

                    return false;
                  });

                  const receiptId =
                    matchingRecord?.receipt_entity_id ||
                    matchingRecord?.receipt_create_result?.EntityId ||
                    matchingRecord?.receipt_retrieve_result?.Entity?.scheme_payment_id;

                  return (
                    <tr
                      key={row.scheme_monthly_details_id}
                      className="border-b"
                    > 
                      <td className="p-2">
                        {new Date(row.due_date).toLocaleDateString()}
                      </td>

                      <td className="p-2">
                        ₹{row.month_amount}
                      </td>

                      <td className="p-2">
                        {row.paid_on_date
                          ? new Date(row.paid_on_date).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-2">
                        {row.delay_days ?? 0}
                      </td>

                      <td className="p-2">
                        {row.days_held ?? "-"}
                      </td>

                      <td className="p-2">
                        {row.applied_rate ?? "-"}
                      </td>
                      <td className="p-2">
                        <Badge
                          className={
                            pending
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }
                        >
                          {pending ? "Pending" : "Paid"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {!pending && receiptId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadSchemeReceipt(selectedScheme, receiptId)
                            }
                            disabled={downloadingKey === String(receiptId)}
                          >
                            {downloadingKey === String(receiptId)
                              ? "..."
                              : "Download Receipt"}
                          </Button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =====================================================
     📋 LIST VIEW
  ===================================================== */

  const columns = [
    {
      accessorKey: "scheme_display_name",
      header: "Scheme",
    },
    {
      accessorKey: "party_name",
      header: "Customer",
    },
    {
      accessorKey: "scheme_unique_code",
      header: "Code",
    },
    {
      accessorKey: "scheme_amount",
      header: "Amount",
      cell: ({ row }) =>
        `₹${row.original.scheme_amount?.toLocaleString()}`,
    },
    {
      id: "status",
      header: "Status",
      cell: () => (
        <Badge className="bg-green-500">Active</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-5">
      <Card>
        <CardHeader>
          <CardTitle>Store Scheme Enrollments</CardTitle>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={columns}
            data={schemes}
            onRowClick={(row) => setSelectedScheme(row.original)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
