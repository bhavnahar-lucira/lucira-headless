"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemeSchema } from "@/lib/scheme/schemeValidation";
import { useDispatch, useSelector } from "react-redux";
import { saveDraft, clearDraft } from "@/redux/features/scheme/enrollmentDraftSlice";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { loadRazorpay } from "@/lib/scheme/loadRazorpay";
import { useRouter } from "next/navigation";

export default function CreateScheme() {
  const router = useRouter();
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.enrollmentDraft.data);

  const [step, setStep] = useState(1);
  const [existingCustomer, setExistingCustomer] = useState(false);
  const [lastFetchedMobile, setLastFetchedMobile] = useState("");

  const [checkingMobile, setCheckingMobile] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partyId, setPartyId] = useState(null);
  const [failureSent, setFailureSent] = useState(false);

  const savePaymentRecord = async (payload) => {
    try {
      const res = await fetch("/api/scheme/payment-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            party_id: partyId,
            mobile: watch("mobile"),
            name: `${watch("first_name")} ${watch("last_name")}`,
          },
          enrollment_draft: draft || null,
          payment_context: {
            amount: Number(watch("instalment_amount")),
            tenure: 9,
            method: "online",
            source: "admin_scheme_create_page",
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

  const saveFailure = async (subscription, response = null) => {
    if (failureSent) return;
    setFailureSent(true);

    console.error("Payment Failure Debug:", { subscription, response });

    try {
      await fetch("/api/scheme/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "scheme_failed",
          user: {
            phone: `+91${watch("mobile")}`,
            name: `${watch("first_name")} ${watch("last_name")}`,
          },
          scheme: {
            amount: Number(watch("instalment_amount")),
            tenure: 9,
            subscription_id: subscription?.id || null,
          },
          failure_reason: response?.error?.description || "User closed checkout",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Webhook failure error:", err);
    }

    await savePaymentRecord({
      payment_status: "failed",
      payment_verified: false,
      payment_failure_reason: response?.error?.description || "User closed checkout",
      subscription,
      razorpay_failure: response,
    });

    toast.error("Payment failed. Enrollment not created.");
    setLoading(false);
  };

  const employees = [
        {"employee_id": 1, "employee_name": "ABC", "company_id": 1},
        {"employee_id": 12, "employee_name": "Akshay Pilane", "company_id": 4},
        {"employee_id": 14, "employee_name": "Alpesh Soni", "company_id": 4},
        {"employee_id": 25, "employee_name": "Anjali", "company_id": 5},
        {"employee_id": 11, "employee_name": "Ankush Landge", "company_id": 4},
        {"employee_id": 9, "employee_name": "Manali Pangare", "company_id": 4},
        {"employee_id": 5, "employee_name": "Mohit jain", "company_id": 2},
        {"employee_id": 13, "employee_name": "Nitin Kadam", "company_id": 4},
        {"employee_id": 23, "employee_name": "Prajlkta Wagmare", "company_id": 4},
        {"employee_id": 4, "employee_name": "Raj Jagda", "company_id": 2},
        {"employee_id": 10, "employee_name": "Raj Soni", "company_id": 4},
        {"employee_id": 20, "employee_name": "Sanjay", "company_id": 5},
        {"employee_id": 24, "employee_name": "Sanjay", "company_id": 2},
        {"employee_id": 26, "employee_name": "Sanjay", "company_id": 2},
        {"employee_id": 19, "employee_name": "Sarika", "company_id": 5},
        {"employee_id": 22, "employee_name": "Shivani Bagchi", "company_id": 5},
        {"employee_id": 6, "employee_name": "Shubhangi singh", "company_id": 2},
        {"employee_id": 18, "employee_name": "Sujit", "company_id": 5},
        {"employee_id": 8, "employee_name": "Vinay korgaonkar", "company_id": 2},
        {"employee_id": 27, "employee_name": "shivani B", "company_id": 2}
  ];

const form = useForm({
  resolver: zodResolver(schemeSchema),
  defaultValues: {
    instalment_amount: draft?.instalment_amount ?? "",
    mobile: draft?.mobile ?? "",
    first_name: draft?.first_name ?? "",
    last_name: draft?.last_name ?? "",
    email: draft?.email ?? "",
    employee_id: draft?.employee_id ?? "",
    address: draft?.address ?? "",
    pincode: draft?.pincode ?? "",
    city: draft?.city ?? "",
    state: draft?.state ?? "",
    nominee_name: draft?.nominee_name ?? "",
    nominee_age: draft?.nominee_age ?? "",
    nominee_relation: draft?.nominee_relation ?? "",
    tenure: draft?.tenure ?? 9,
  },
  mode: "onChange",
});

const { watch, trigger, setValue, reset } = form;

/* ================= MOBILE WATCH ================= */

const mobileValue = watch("mobile");

useEffect(() => {
  if (!mobileValue || mobileValue.length !== 10) {
    setMobileVerified(false);
    return;
  }

  if (mobileValue === lastFetchedMobile) return;

  const timer = setTimeout(() => {
    handleMobileFetch(mobileValue);
    setLastFetchedMobile(mobileValue);
  }, 500);

  return () => clearTimeout(timer);
}, [mobileValue]);

  /* ================= AUTO SAVE DRAFT ================= */
  useEffect(() => {
    const subscription = watch((value) => {
      clearTimeout(window.__draftTimer);
      window.__draftTimer = setTimeout(() => {
        dispatch(saveDraft(value));
      }, 400);
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]); 

  /* ================= MOBILE CHECK ================= */
  const handleMobileFetch = async (mobile) => {
    try {
      setCheckingMobile(true);
      setMobileVerified(false);
      setIsNewCustomer(false);

      const res = await fetch("/api/scheme/customer/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();
      const existing = data?.Entities?.[0];

      if (existing?.party_id) {
        setExistingCustomer(true);
        setIsNewCustomer(false);

        setPartyId(existing.party_id);   // ✅ STORE HERE

        const names = existing.party_name?.split(" ") || [];

        setValue("first_name", names[0] ?? "");
        setValue("last_name", names[1] ?? "");
        setValue("email", existing.email ?? "");
        setValue("address", existing.address ?? "");
        setValue("city", existing.city_name ?? "");
        setValue("state", existing.state_name ?? "");
        setValue("pincode", existing.pin_code ?? "");

        toast.success("Existing customer found");
      } else {
        setExistingCustomer(false);
        setIsNewCustomer(true);
        setPartyId(null); // ✅ reset
        toast.success("New customer");
      }

      setMobileVerified(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingMobile(false);
    }
  };
  const nextStep = async (fields) => {
    const valid = await trigger(fields);
    if (!valid) {
      toast.error("Please complete required fields correctly");
      return;
    }
    setStep((prev) => prev + 1);
  };

 const onSubmit = async (values) => {
    try {
      setLoading(true);

      let finalPartyId = partyId;

      /* 🆕 CREATE CUSTOMER IF NOT EXISTS */
      if (!finalPartyId) {
          const createRes = await fetch("/api/scheme/customer/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: values.first_name,
              last_name: values.last_name,
              phone: values.mobile,
              email: values.email,
            }),
          });

          const created = await createRes.json();

          finalPartyId = created?.EntityId;

          if (!finalPartyId) {
            throw new Error("Party ID not returned");
          }

          setPartyId(finalPartyId); // optional but clean
      }

      /* ================= LOAD RAZORPAY ================= */
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const amount = Number(values.instalment_amount);
      const tenure = 9;

      /* ================= CREATE PLAN ================= */
      const planRes = await fetch("/api/scheme/razorpay/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, tenure }),
      });

      const plan = await planRes.json();

      /* ================= CREATE SUBSCRIPTION ================= */
      const subRes = await fetch("/api/scheme/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: plan.id,
          total_count: tenure,
          customer: {
            party_id: partyId,
            mobile: values.mobile,
            name: `${values.first_name} ${values.last_name}`,
          },
        }),
      });

      const subscription = await subRes.json();

      /* ================= OPEN RAZORPAY ================= */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Vault Of Dreams",
        description: "Monthly AutoPay Enrollment",

        prefill: {
          name: `${values.first_name} ${values.last_name}`,
          contact: values.mobile,
        },

        handler: async (response) => {
          let paymentVerified = false;
          try {
            /* VERIFY */
            const verifyRes = await fetch("/api/scheme/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            paymentVerified = true;

            /* CREATE ENROLLMENT */
            const now = new Date();

            const months = Array.from({ length: tenure }).map((_, i) => {
              const d = new Date(now);
              d.setMonth(d.getMonth() + i);
              return {
                month_id: d.getMonth() + 1,
                month_amount: amount,
                due_date: d.toISOString(),
              };
            });

            const enrollmentPayload = {
              document_date: now.toISOString(),
              party_id: finalPartyId.toString(), 
              scheme_id: 3,
              scheme_amount: amount,
              total_amount: amount * 10,
              scheme_bonus_value: amount,
              tenure,
              scheme_monthly_details: months,
              bonus_value: amount,
              mobile: values.mobile,
              party_name: `${values.first_name} ${values.last_name}`,
              scheme_code: "9+1",
              max_installment_amount: 19000,
              scheme_type: "1",
              sales_person_id: Number(values.employee_id),
              nominee: !!values.nominee_name,
              nominee_age: values.nominee_age || null,
              subscription_id: subscription.id,
            }; 

            const enrollRes = await fetch("/api/scheme/enrollments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(enrollmentPayload),
            });
            

            if (!enrollRes.ok) {
              const errorData = await enrollRes.json();
              console.error("Enrollment Error:", errorData);
              throw new Error("Enrollment creation failed");
            }

            const enrollResult = await enrollRes.json();

            const enrollmentId = enrollResult?.EntityId;

            /* ================= FETCH ENROLLED SCHEME ================= */

            const schemesRes = await fetch(
              `/api/scheme/enrollments?party_id=${finalPartyId}`
            );

            if (!schemesRes.ok) {
              throw new Error("Failed to fetch enrollments");
            }

            const schemesResult = await schemesRes.json();
            const schemes = schemesResult?.Entities ?? [];

            const matchedScheme = schemes.find(
              (s) =>
                String(s.scheme_enrollment_id) ===
                String(enrollmentId)
            );

            if (!matchedScheme) {
              throw new Error("Enrolled scheme not found");
            }

            /* ================= FIND FIRST UNPAID MONTH ================= */

            const unpaidMonth =
              matchedScheme.scheme_monthly_details.find(
                (m) => !m.payment_made
              );

            if (!unpaidMonth) {
              throw new Error("No pending installment found");
            }

            const monthIds = [String(unpaidMonth.month_id)];

            /* ================= CREATE RECEIPT ================= */

            const receiptPayload = {
              Entity: {
                document_no: 123,
                document_date: new Date().toISOString(),
                document_id: 99,

                mobile: values.mobile,
                party_id: finalPartyId.toString(),
                party_name: `${values.first_name} ${values.last_name}`,
                email: values.email,
                phone_code: "91",
                pan_no: null,

                address: values.address,

                scheme_enrollment_id:
                  enrollmentId.toString(),

                month_ids: monthIds,

                amount,
                gold_rate: 0,
                weight: 0,

                scheme_receipt_details: [
                  {
                    mode_id: 4,
                    card_type: null,
                    amount,
                    cheque_no: null,
                    cheque_date: null,
                    ref_no: response.razorpay_payment_id,
                    ledger_id: 154,
                    bank_pos: 5,
                    code: response.razorpay_payment_id,
                    mode_name: "ONLINE",
                    mode_type: 2,
                  },
                ],

                currency_id: "103",
                exchange_rate: 1,
                ledger_id: 154,
                company_id: 2,
                scheme_type: "1",
                scheme_unique_code:
                  matchedScheme.scheme_unique_code,
              },
            };

            const receiptRes = await fetch(
              "/api/scheme/schemes/receipt/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(receiptPayload),
              }
            );

            if (!receiptRes.ok) {
              throw new Error("Receipt creation failed");
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
            });

            dispatch(clearDraft());
            reset({
              instalment_amount: "",
              mobile: "",
              first_name: "",
              last_name: "",
              email: "",
              employee_id: "",
              address: "",
              pincode: "",
              city: "",
              state: "",
              nominee_name: "",
              nominee_age: "",
              nominee_relation: "",
              tenure: 9,
            });
            setPartyId(null);
            setExistingCustomer(false);
            setMobileVerified(false);
            setIsNewCustomer(false);
            setLastFetchedMobile("");
            setStep(1);

            localStorage.removeItem("rzp_failed_payment");
            toast.success("Enrollment Created Successfully 🎉");
            router.replace("/admin/scheme");

          } catch (err) {
            console.error("Payment handler internal failure:", err);
            if (subscription?.id) {
               await savePaymentRecord({
                payment_status: "receipt_pending",
                payment_verified: paymentVerified,
                payment_failure_reason: err.message,
                subscription,
                razorpay_payment: response,
              });
              toast.success("Enrollment created (pending background processing)");
              router.replace("/admin/scheme");
              return;
            }
            await saveFailure(subscription, { error: { description: err.message } });
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
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const emi = watch("instalment_amount");
  const tenure = watch("tenure");
  const employeeId = watch("employee_id");

  const selectedAgent = useMemo(() => {
    return employees.find((e) => String(e.employee_id) === employeeId);
  }, [employeeId]);

  const total = emi && tenure ? Number(emi) * tenure : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">Create Enrollment</h1>

      {/* ================= STEPPER ================= */}
      <div>
        <div className="relative h-2 bg-muted rounded-full mb-8">
          <div
            className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>

        <div className="flex justify-between">
          {[
            "Personal Details",
            "Address Details",
            "Nominee Details",
            "Preview & Confirm",
          ].map((label, index) => {
            const id = index + 1;
            const isActive = step === id;
            const isCompleted = step > id;

            return (
              <div key={id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold ${
                    isCompleted
                      ? "bg-primary text-white border-primary"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : id}
                </div>
                <span className="mt-2 text-xs text-center">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="instalment_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Instalment Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} />

                        {checkingMobile && (
                          <span className="absolute right-3 top-2 text-sm animate-spin">
                            ⏳
                          </span>
                        )}
                      </div>
                    </FormControl>
                    {/* {mobileVerified && !checkingMobile && (
                      <p className="text-xs mt-1 text-green-600">
                        {existingCustomer ? "Existing customer verified" : "New customer"}
                      </p>
                    )} */}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem
                            key={emp.employee_id}
                            value={String(emp.employee_id)}
                          >
                            {emp.employee_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full flex justify-end">
                <Button
                  type="button"
                  disabled={!mobileVerified || checkingMobile}
                  onClick={() =>
                    nextStep([
                      "instalment_amount",
                      "mobile",
                      "first_name",
                      "employee_id",
                    ])
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full flex justify-between">
                <Button type="button" onClick={() => setStep(1)}>Back</Button>
                <Button type="button"
                  onClick={() =>
                    nextStep(["address", "pincode", "city", "state"])
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="nominee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominee Name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="nominee_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominee Age</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="nominee_relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relation *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full flex justify-between">
                <Button type="button" onClick={() => setStep(2)}>Back</Button>
                <Button type="button"
                  onClick={() =>
                    nextStep(["nominee_name", "nominee_relation"])
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-muted">
                <h3 className="font-semibold mb-4 text-lg">
                  Scheme Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>EMI:</strong> ₹{emi}</p>
                  <p><strong>Tenure:</strong> {tenure} months</p>
                  <p><strong>Total:</strong> ₹{total}</p>
                  <p><strong>Customer:</strong> {watch("first_name")} {watch("last_name")}</p>
                  <p><strong>Email:</strong> {watch("email")}</p>
                  <p><strong>Agent:</strong> {selectedAgent?.employee_name}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" onClick={() => setStep(3)}>Back</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Confirm & Create"}
                </Button>
              </div>
            </div>
          )}

        </form>
      </Form>
    </div>
  );
}