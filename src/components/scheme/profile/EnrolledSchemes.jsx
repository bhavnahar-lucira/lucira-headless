"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import useSWR from "swr";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleReceiptDownload } from "@/lib/scheme/schemeReceiptClient";

const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

function MobileSchemeCard({ scheme, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="rounded-xl border p-4 space-y-2 bg-background hover:bg-muted/50 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-primary">
          {scheme.scheme_display_name || "9+1 Scheme"}
        </span>
        <Badge className="bg-green-500">Active</Badge>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p><b>Customer:</b> {scheme.party_name}</p>
        <p><b>Code:</b> {scheme.scheme_unique_code}</p>
        <p><b>Amount:</b> Rs. {scheme.scheme_amount.toLocaleString()}</p>
      </div>
    </div>
  );
}

function MobileRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground font-semibold">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export default function EnrolledSchemes() {
  const customer = useSelector((s) => s.customer.customer);
  const partyID = customer?.party_id;

  const { data, error, isLoading } = useSWR(
    partyID ? `/api/scheme/enrollments?party_id=${partyID}` : null,
    fetcher
  );

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [downloadingKey, setDownloadingKey] = useState("");

  const { data: recordsData } = useSWR(
    customer?.mobile
      ? `/api/scheme/payment-records?mobile=${customer.mobile}`
      : null,
    fetcher
  );

  // Filter records locally for the selected scheme, checking all possible ID locations
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
        customer,
        enrollmentEntityId: scheme.scheme_enrollment_id,
        receiptEntityId,
      });
    } finally {
      setDownloadingKey("");
    }
  };

  if (isLoading) return <p>Loading schemes...</p>;
  if (error) return <p>Error loading schemes</p>;

  const schemes = data?.Entities || [];

  if (schemes.length === 0) {
    return (
      <Card className="text-center p-10">
        <CardHeader>
          <CardTitle>No Enrolled Scheme</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You have not enrolled in any scheme yet.
          </p>
          <Button asChild>
            <Link href="/scheme/enroll">Enroll Now</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedScheme) {
    return (
      <div className="space-y-6 mb-20">
        <Button
          variant="outline"
          onClick={() => setSelectedScheme(null)}
          className="hover:cursor-pointer"
        >
          Back to Schemes
        </Button>

        <Card className="px-0 py-0 bg-transparent border-0 shadow-none lg:bg-white lg:py-6 lg:shadow-sm">
          <CardHeader className="px-0 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>{selectedScheme.scheme_display_name}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Due Date</th>
                  <th className="p-2 text-left">Month Amount</th>
                  <th className="p-2 text-left">Paid On</th>
                  <th className="p-2 text-left">Delay</th>
                  <th className="p-2 text-left">Days Held</th>
                  <th className="p-2 text-left">Applied Rate</th>
                  <th className="p-2 text-left">Receipt</th>
                </tr>
              </thead>

              <tbody>
                {selectedScheme.scheme_monthly_details.map((row) => {
                  const pending = !row.payment_made;

                  const matchingRecord = paymentRecords.find((r) => {
                    const monthIds =
                      r.receipt_retrieve_result?.Entity?.month_ids ||
                      r.receipt_create_payload?.Entity?.month_ids ||
                      r.receipt_create_payload?.month_ids ||
                      [];
                    if (monthIds.map(String).includes(String(row.month_id))) return true;

                    // Fallback: if there's only one record and one paid installment, match them
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
                      className="border-b last:border-0"
                    >
                      <td className="p-2">
                        <Badge className={pending ? "bg-yellow-500" : "bg-green-500"}>
                          {pending ? "Pending" : "Paid"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {new Date(row.due_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">Rs. {row.month_amount}</td>
                      <td className="p-2">
                        {row.paid_on_date
                          ? new Date(row.paid_on_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-2">{row.delay_days ?? 0}</td>
                      <td className="p-2">{row.days_held ?? "-"}</td>
                      <td className="p-2">{row.applied_rate ?? "-"}</td>
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

          <CardContent className="space-y-4 px-0 lg:hidden">
            {selectedScheme.scheme_monthly_details.map((row) => {
              const pending = !row.payment_made;

              const matchingRecord = paymentRecords.find((r) => {
                const monthIds =
                  r.receipt_retrieve_result?.Entity?.month_ids ||
                  r.receipt_create_payload?.Entity?.month_ids ||
                  r.receipt_create_payload?.month_ids ||
                  [];
                if (monthIds.map(String).includes(String(row.month_id))) return true;

                const paidCount = selectedScheme.scheme_monthly_details.filter(m => m.payment_made).length;
                if (paymentRecords.length === 1 && paidCount === 1 && !pending) return true;

                return false;
              });

              const receiptId =
                matchingRecord?.receipt_entity_id ||
                matchingRecord?.receipt_create_result?.EntityId ||
                matchingRecord?.receipt_retrieve_result?.Entity?.scheme_payment_id;

              return (
                <div
                  key={row.scheme_monthly_details_id}
                  className="rounded-xl border p-4 space-y-3 text-sm bg-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">
                      Status
                    </span>
                    <Badge className={pending ? "bg-yellow-500" : "bg-green-500"}>
                      {pending ? "Pending" : "Paid"}
                    </Badge>
                  </div>

                  <MobileRow
                    label="Due Date"
                    value={new Date(row.due_date).toLocaleDateString()}
                  />
                  <MobileRow
                    label="Monthly Amount"
                    value={`Rs. ${row.month_amount}`}
                  />
                  <MobileRow
                    label="Paid On"
                    value={
                      row.paid_on_date
                        ? new Date(row.paid_on_date).toLocaleDateString()
                        : "-"
                    }
                  />
                  <MobileRow label="Delay (Days)" value={row.delay_days ?? 0} />
                  <MobileRow label="Days Held" value={row.days_held ?? "-"} />
                  <MobileRow
                    label="Applied Rate"
                    value={row.applied_rate ?? "-"}
                  />

                  {!pending && receiptId && (
                    <div className="pt-2 border-t mt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          downloadSchemeReceipt(selectedScheme, receiptId)
                        }
                        disabled={downloadingKey === String(receiptId)}
                      >
                        {downloadingKey === String(receiptId)
                          ? "Preparing Receipt..."
                          : "Download Receipt PDF"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button asChild className="w-full">
          <Link href="/scheme/enroll">Enroll New Scheme</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-6 mb-20">
      <Card className="px-0 py-0 bg-transparent border-0 shadow-none lg:bg-white lg:px-4 lg:py-6 lg:shadow-sm">
        <CardHeader className="px-0 lg:px-6">
          <CardTitle>Enrolled Schemes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 px-0 md:hidden">
          {schemes.map((scheme) => (
            <MobileSchemeCard
              key={scheme.scheme_enrollment_id}
              scheme={scheme}
              onSelect={() => setSelectedScheme(scheme)}
            />
          ))}
        </CardContent>

        <CardContent className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Scheme</th>
                <th className="p-2 text-left">Customer Name</th>
                <th className="p-2 text-left">Code</th>
                <th className="p-2 text-left">Scheme Amount</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {schemes.map((scheme) => (
                <tr
                  key={scheme.scheme_enrollment_id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="border-b cursor-pointer hover:bg-muted/50"
                >
                  <td className="p-2 text-primary">9+1</td>
                  <td className="p-2">{scheme.party_name}</td>
                  <td className="p-2">{scheme.scheme_unique_code}</td>
                  <td className="p-2">Rs. {scheme.scheme_amount.toLocaleString()}</td>
                  <td className="p-2">
                    <Badge className="bg-green-500">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Button asChild className="w-full">
        <Link href="/scheme/enroll">Enroll New Scheme</Link>
      </Button>
    </div>
  );
}
