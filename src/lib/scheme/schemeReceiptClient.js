"use client";

import { toast } from "react-toastify";
import { downloadReceiptPdf } from "@/lib/scheme/receiptPdf";

export async function fetchAndDownloadReceipt({
  customer,
  receiptEntityId,
  enrollmentEntityId,
}) {
  let finalReceiptEntityId = receiptEntityId;

  if (!finalReceiptEntityId && customer?.mobile && enrollmentEntityId) {
    const recordRes = await fetch(
      `/api/scheme/payment-records?mobile=${encodeURIComponent(customer.mobile)}&enrollment_entity_id=${encodeURIComponent(enrollmentEntityId)}`
    );
    const recordData = await recordRes.json();

    if (recordRes.ok) {
      finalReceiptEntityId =
        recordData?.records?.[0]?.receipt_entity_id ||
        recordData?.records?.[0]?.receipt_create_result?.EntityId ||
        null;
    }
  }

  if (!finalReceiptEntityId) {
    throw new Error("Receipt is not available yet.");
  }

  const retrieveRes = await fetch("/api/scheme/schemes/receipt/retrieve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      EntityId: Number(finalReceiptEntityId),
    }),
  });

  const retrieveData = await retrieveRes.json();

  if (!retrieveRes.ok) {
    throw new Error(
      retrieveData?.error?.Message ||
        retrieveData?.error ||
        "Failed to retrieve receipt"
    );
  }

  await downloadReceiptPdf(retrieveData);

  await fetch("/api/scheme/payment-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer,
      receipt_entity_id: finalReceiptEntityId,
      receipt_retrieve_result: retrieveData,
      receipt_pdf_downloaded_at: new Date().toISOString(),
      payment_status: "success",
    }),
  });

  return {
    receiptEntityId: finalReceiptEntityId,
    retrieveData,
  };
}

export async function handleReceiptDownload(options) {
  try {
    return await fetchAndDownloadReceipt(options);
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Unable to download receipt");
    throw error;
  }
}
