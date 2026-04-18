"use client";

import { useEffect } from "react";
import Link from "next/link";
import { pushPurchase } from "@/lib/gtm";

export default function SuccessPage() {
  useEffect(() => {
    // 1. Read purchase data stored from Payment Page
    const storedData = window.localStorage.getItem("gtm_purchase_data");
    
    if (storedData) {
      try {
        const purchaseData = JSON.parse(storedData);
        
        // 2. Fire the Purchase Event
        pushPurchase(purchaseData);
        
        // 3. Clear storage to prevent duplicate firing on refresh
        window.localStorage.removeItem("gtm_purchase_data");
      } catch (err) {
        console.error("GTM Purchase tracking failed:", err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
      <p className="text-zinc-600 mb-8 max-w-md">Thank you for your purchase. Your order has been placed and is being processed.</p>
      <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
        Continue Shopping
      </Link>
    </div>
  );
}
