"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentFailed() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-2xl font-semibold text-red-600">
        Payment Failed
      </h1>

      <p className="text-gray-600 text-center max-w-md">
        Your payment could not be completed. You can retry safely.
      </p>

      <Button className="h-14 px-10" onClick={() => router.push("/payment")}>
        Retry Payment
      </Button>
    </div>
  );
}
