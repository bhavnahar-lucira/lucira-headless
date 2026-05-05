"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { loadRazorpay } from "@/lib/scheme/loadRazorpay";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/scheme/fetcher";
import { toast } from "react-toastify";
import { Info } from "lucide-react";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentPage() {
  const { width } = useWindowSize();
  const formatINR = (value) => new Intl.NumberFormat("en-IN").format(value);
  const router = useRouter();
  const { user } = useAuth();

  const customer = useSelector((s) => s.customer.customer);
  const enrollment = useSelector((s) => s.enrollment.enrollment);

  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [failureSent, setFailureSent] = useState(false);  

  const methods = [
    { id: "upi", label: "UPI", icon: "⚡" },
    { id: "credit", label: "Credit Card", icon: "💳" },
    { id: "debit", label: "Debit Card", icon: "💳" },
    { id: "netbanking", label: "Net Banking", icon: "🏦" },
  ];

  const amount =
    enrollment?.amount ??
    customer?.enrollment_draft?.amount ??
    user?.enrollment_draft?.amount ??
    null;
  const tenure = 9;
  const MAX_AMOUNT = 19000;


  console.log("nominee_name");
  console.log(enrollment);
  console.log("customer test");
  console.log(customer);

  /* ================= Payment guard chec ================= */
  const mobile = customer?.mobile;
  const { data, error, isLoading, mutate } = useSWR(
    mobile ? ["/api/scheme/customer/get", { mobile }] : null,
    ([url, body]) => fetcher(url, body)
  );

  const profile = data?.Entities?.[0];
  const partyId = customer?.party_id;

  const hasAmount = Number(amount) > 0;
  const isReady = !isLoading && data !== undefined;
  const nomineeName =
    enrollment?.nominee_name ??
    customer?.enrollment_draft?.nominee_name ??
    "";
  const hasNominee = nomineeName.trim() !== "";
  const nomineeAge =
    enrollment?.nominee_age ??
    customer?.enrollment_draft?.nominee_age ??
    "";

  useEffect(() => {
    if (!isReady) return;
    console.log("Payment guard check");
    console.log({ hasAmount, amount, nomineeName });

    if (!hasAmount || !hasNominee) {
      router.replace("/scheme/enroll");
    } else ("yes")
  }, [isReady, hasAmount, hasNominee, router]);

  const savePaymentRecord = async (payload) => {
    try {
      const res = await fetch("/api/scheme/payment-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          enrollment_draft: customer?.enrollment_draft || null,
          payment_context: {
            amount,
            tenure,
            method,
            source: "frontend_payment_page",
          },
          ...payload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save payment record");
      }

      return await res.json();
    } catch (error) {
      console.error("Payment record save failed:", error);
      return null;
    }
  };


  const activeCustomer = customer || (profile ? {
    party_id: profile.party_id,
    party_name: profile.party_name,
    mobile: profile.mobile,
    email: profile.email,
    address: profile.address || profile.address_1,
    pin_code: profile.pin_code,
    city_name: profile.city_name,
    state_name: profile.state_name,
    country_code: profile.country_code,
  } : null);

  /* ================= PAY ================= */
  const handlePay = async () => {
    try {
      setFailureSent(false);
      setLoading(true);
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      /* -----------------------------------------
         0️⃣ CHECK EXISTING FAILED SUBSCRIPTION
      ------------------------------------------ */
      const storedFailure = JSON.parse(
        localStorage.getItem("rzp_failed_payment")
      );

      let subscription;

      if (storedFailure?.subscription?.id) {
        subscription = storedFailure.subscription;
      } else {
        /* -----------------------------------------
          1️⃣ CREATE PLAN
       ------------------------------------------ */
        const planRes = await fetch("/api/scheme/razorpay/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, tenure }),
        });
        const plan = await planRes.json();
        /* -----------------------------------------
          2️⃣ CREATE SUBSCRIPTION
       ------------------------------------------ */
        const subRes = await fetch("/api/scheme/razorpay/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: plan.id,
            total_count: tenure,
            customer,
          }),
        });

        subscription = await subRes.json();
      }

      /* -----------------------------------------
           3️⃣ OPEN RAZORPAY CHECKOUT
      ------------------------------------------ */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Vault Of Dreams",
        description: "Monthly AutoPay Enrollment",
        prefill: {
          name: customer.name,
          contact: customer.mobile,
        },

        handler: async (response) => {
          let paymentVerified = false;

          const finalizeSuccessfulPayment = async (message, extras = {}) => {
            try {
              await saveDraft(null);
            } catch (draftErr) {
              console.error("Draft cleanup failed:", draftErr);
            }
            localStorage.setItem(
              "razorpay_subscription_data",
              JSON.stringify({
                subscription,
                payment: response,
                customer,
                amount,
                tenure,
                ...extras,
                createdAt: new Date().toISOString(),
              })
            );

            localStorage.removeItem("rzp_failed_payment");

            toast.success(message);
            router.replace("/scheme/payment-success");
            };

            try {
            const { razorpay_payment_id } = response;

            /* 1️⃣ VERIFY SIGNATURE */
            const verifyRes = await fetch("/api/scheme/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            paymentVerified = true;

            /* 2️⃣ CREATE ENROLLMENT */
            const now = new Date();
            
            const months = Array.from({ length: tenure }).map((_, i) => {
              const d = new Date(now);
              d.setMonth(d.getMonth() + i);
              return {
                month_id: d.getMonth() + 1,
                month_amount: Number(amount),
                due_date: d.toDateString(), // "Mon May 04 2026" format
              };
            });

            const enrollmentPayload = {
              document_date: now.toUTCString(), // "Mon, 04 May 2026 13:13:29 GMT" format
              party_id: String(partyId),
              scheme_id: "3",
              sales_person_id: "1",
              scheme_amount: Number(amount),
              total_amount: Number(amount) * 10, // Example showed amount * 10
              scheme_bonus_value: Number(amount),
              tenure: 9,
              total_allocated_weight: null,
              invested_amount: 0,
              benifit_amount: 0,
              total_payable: 0,
              nominee: nomineeName || "test",
              nominee_age: Number(nomineeAge) || 36,
              subscription_id: "", // Successful example had empty string
              scheme_monthly_details: months,
              document_id: 125,
              bonus_type: "1",
              bonus_value: 1,
              mobile: mobile,
              party_name: profile?.party_name || activeCustomer.party_name || "",
              email: profile?.email || activeCustomer.email || user?.email || "",
              phone_code: "",
              scheme_code: "Vault of dream",
              max_installment_amount: null,
              company_id: 1
            };

            const enrollRes = await fetch("/api/scheme/enrollments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(enrollmentPayload),
              credentials: "include"
            });

            if (!enrollRes.ok) {
              throw new Error("Enrollment creation failed");
            }

            const enrollResult = await enrollRes.json();

            console.log(enrollResult);

            //get enrolled scheme 
            const schemesRes = await fetch(`/api/scheme/enrollments?party_id=${partyId}`);
            if (!schemesRes.ok) {
              throw new Error("Failed to fetch enrollments");
            }

            const schemesResult = await schemesRes.json();
            const schemes = schemesResult?.Entities ?? [];
            const enrollmentId = enrollResult?.EntityId;           

            const matchedScheme = schemes.find(
              (s) => String(s.scheme_enrollment_id) === String(enrollmentId)
            );

              console.log("matchedScheme item");
              console.log(matchedScheme);

            if (!matchedScheme) {
              throw new Error("Enrolled scheme not found");
            }
            
            /* FIND NEXT UNPAID MONTH */
            const unpaidMonth = matchedScheme.scheme_monthly_details.find(
              (m) => !m.payment_made
            );

            if (!unpaidMonth) throw new Error("No pending installment");

            const monthIds = [String(unpaidMonth.month_id)];

            /* 3️⃣ CREATE SCHEME RECEIPT */
           const receiptPayload = {
            Entity: {
              document_no: 123,
              document_date: new Date().toISOString(),
              document_id:99,
              mobile: customer.mobile,
              party_id: partyId.toString(),
              party_name: data?.Entities?.[0]?.party_name,
              email: data?.Entities?.[0]?.email,
              phone_code: "91",
              pan_no:null,
              address: data?.Entities?.[0]?.address,

              scheme_enrollment_id: enrollmentId.toString(),              
              month_ids: monthIds, // ✅ ONLY CURRENT MONTH

              amount,
              gold_rate: 0,
              weight: 0,
              scheme_receipt_details: [
                {
                  mode_id: 4, // ONLINE
                  card_type: null,
                  amount,
                  cheque_no: null,
                  cheque_date: null,
                  ref_no: razorpay_payment_id,
                  ledger_id: 154,
                  bank_pos: 5,
                  code: razorpay_payment_id,
                  mode_name: method.toUpperCase(),
                  mode_type: 2, // DIGITAL
                },
              ],

              currency_id: "103",
              exchange_rate:1,
              ledger_id: 154,
              company_id: 2,
              scheme_type: "1",
              scheme_unique_code: matchedScheme.scheme_unique_code,
            }
          };


            const receiptRes = await fetch("/api/scheme/schemes/receipt/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(receiptPayload),
            });

            if (!receiptRes.ok) {
              throw new Error("Scheme receipt creation failed");
            }

            const receiptResult = await receiptRes.json();

            await savePaymentRecord({
              payment_status: "success",
              payment_verified: true,
              subscription,
              razorpay_payment: response,
              enrollment_payload: enrollmentPayload,
              enrollment_result: enrollResult,
              enrolled_scheme: matchedScheme,
              receipt_create_payload: receiptPayload,
              receipt_create_result: receiptResult,
              receipt_entity_id: receiptResult?.EntityId || null,
              webhook_status: "success_sent",
            });

            /* ================= WEBHOOK SUCCESS ================= */
            try {
              const webhookRes = await fetch(
                "/api/scheme/webhook",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    event_type: "scheme_success",
                    user: {
                      phone: `+91${customer.mobile}`,
                      name: customer.name,
                      email: data?.Entities?.[0]?.email || null,
                    },
                    scheme: {
                      id: enrollmentId,
                      amount,
                      tenure,
                      subscription_id: subscription.id,
                      payment_id: razorpay_payment_id,
                    },
                    timestamp: new Date().toISOString(),
                  }),
                }
              );

              const webhookText = await webhookRes.text();
              console.log("Webhook success:", webhookRes.status, webhookText);
            } catch (err) {
              console.error("Webhook success error:", err);
            }


            /* 4️⃣ CLEAN DRAFT */
            await finalizeSuccessfulPayment("Payment successful & receipt created", {
              enrollmentResult: enrollResult,
              matchedScheme,
              receiptResult,
              receiptEntityId: receiptResult?.EntityId || null,
            });

             // ✅ TEMP: save everything locally


          } catch (err) {
            console.error("Payment handler internal failure:", err);
            // No alert or toast.error here per user request
            
            if (subscription?.id) {
              try {
                await savePaymentRecord({
                  payment_status: "receipt_pending", // Still a success at the gateway level
                  payment_verified: paymentVerified,
                  payment_failure_reason: err.message,
                  subscription,
                  razorpay_payment: response,
                });
              } catch (saveErr) {
                console.error("Critical: Failed to save fallback payment record:", saveErr);
              }
              
              // Always finalize as success if subscription was reached
              await finalizeSuccessfulPayment("Payment successful. Receipt creation is pending in background.", {
                receiptError: err.message,
              });
              return;
            }

            await saveFailure(subscription, {
              error: {
                description: err.message,
              },
            });
          }
        },


        modal: {
          ondismiss: async () => {
            await saveFailure(subscription);
          },
        },

        theme: { color: "#9f7d7d" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        saveFailure(subscription, response);
      });
      rzp.open();

    } catch (err) {
      console.error("Razorpay initiation failed:", err);
      // Only show error if we haven't even opened the gateway
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (value) => {
    await fetch("/api/scheme/session/update-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollment_draft: {
          amount: value,
          tenure: 0,
        },
      }),
    });
  };

  /* ===================== FAILURE HANDLER ===================== */
    const saveFailure = async (subscription, response = null) => {
      if (failureSent) return; // prevent duplicate
      setFailureSent(true);
      
      console.error("Payment Failure Debug:", { subscription, response });

      try {
          const webhookPromise = fetch(
            "/api/scheme/webhook",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event_type: "scheme_failed",
                user: {
                  phone: `+91${customer.mobile}`,
                  name: customer.name,
                },
                scheme: {
                  amount,
                  tenure,
                  subscription_id: subscription?.id || null,
                },
                failure_reason:
                  response?.error?.description || "User closed checkout",
                timestamp: new Date().toISOString(),
              }),
            }
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Webhook timeout")), 5000)
          );

          await Promise.race([webhookPromise, timeoutPromise]);

        } catch (err) {
          console.error("Webhook failure error:", err);
        }


      localStorage.setItem(
        "rzp_failed_payment",
        JSON.stringify({
          subscription,
          customer,
          amount,
          tenure,
          failure: response,
          time: Date.now(),
        })
      );

      await savePaymentRecord({
        payment_status: "failed",
        payment_verified: false,
        payment_failure_reason:
          response?.error?.description || "User closed checkout",
        subscription,
        razorpay_failure: response,
      });;

      router.push("/scheme/payment-failed");
    };


  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading payment details...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <RadioGroup value={method} onValueChange={setMethod} className="space-y-4">
            {methods.map((m) => (
              <Card
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`cursor-pointer border py-4 ${method === m.id ? "border-primary" : ""
                  }`}
              >
                <CardContent className="flex justify-between px-4 items-center">
                  <div className="flex gap-3">
                    <span>{m.icon}</span>
                    <Label>{m.label}</Label>
                  </div>
                  <RadioGroupItem value={m.id} />
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
          <div className="mt-8 p-4 border border-primary/30 rounded-lg bg-primary/5 mb-40 md:mb-0">
            <div className="flex items-start gap-3">
              <Info className="text-primary w-5 h-5 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Seamless Monthly Auto-Pay</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Vault of Dreams contributions will be securely auto-debited each month 
                  through trusted payment partners — ensuring a seamless, worry-free journey 
                  towards your dream jewelry.
                </p>
              </div>
            </div>
          </div>
        </div>
        {
         width > 767 ?
             <div className="mb-16">
              <h2 className="hidden md:block text-lg font-semibold mb-4">Premium Summary</h2>
              <Card className="bg-[#f7f3f2]">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between">
                    <span>Monthly Premium</span>
                    <span>₹{formatINR(amount)}</span>
                  </div>
                  <Button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full h-14 cursor-pointer"
                  >
                    {loading ? "Processing..." : "PAY SECURELY"}
                  </Button>
                </CardContent>
              </Card>
            </div>
         : 
              <div className="fixed bottom-0 left-0 w-full bg-white border-t px-4 py-3 z-10 md:border-0 md:px-0 md:py-0 md:w-[50%] md:static md:mx-auto">
                <div className="flex justify-between items-center mb-2 md:hidden">
                  <span className="text-sm text-gray-600">
                    Monthly Premium
                  </span>
                  <span className="text-lg font-semibold">
                    <span>₹{formatINR(amount)}</span>
                  </span>
                </div>
                <Button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full bg-black md:bg-primary text-white rounded-md px-8 h-12 text-sm tracking-wide
                  disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                 {loading ? "Processing..." : "PAY SECURELY"}
                </Button>
              </div>
        }

        {/* RIGHT */}
        

      </div>
    </div>
  );
}
