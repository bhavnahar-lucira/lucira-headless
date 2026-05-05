"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { handleReceiptDownload } from "@/lib/scheme/schemeReceiptClient";

export default function SuccessPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("razorpay_subscription_data");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleBack = () => {
      router.replace("/dashboard/scheme");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [router]);

  if (!data) {
    return <p className="text-center mt-10">No payment data found</p>;
  }

  const { customer, amount } = data;
  const receiptEntityId =
    data?.receiptEntityId || data?.receiptResult?.EntityId || null;

  const onDownloadReceipt = async () => {
    try {
      setDownloading(true);
      await handleReceiptDownload({
        customer,
        receiptEntityId,
        enrollmentEntityId: data?.enrollmentResult?.EntityId,
      });
      toast.success("Receipt downloaded successfully.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold text-green-600 text-center">
            Payment Successful
          </h1>

          <div className="text-center">
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Mobile:</strong> {customer.mobile}</p>
            <p><strong>Monthly Amount:</strong> {amount}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onDownloadReceipt}
            disabled={downloading}
            className="w-[80%] mx-auto h-14 rounded-lg flex uppercase tracking-wider"
          >
            {downloading ? "Preparing Receipt..." : "Download Receipt PDF"}
          </Button>

          <Button asChild className="w-[80%] mx-auto h-14 rounded-lg flex mt-8 uppercase tracking-wider">
            <Link href="/admin/schemes">
              Check Enrolled Scheme Details
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
