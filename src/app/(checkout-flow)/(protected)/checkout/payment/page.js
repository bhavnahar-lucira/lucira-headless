"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CheckoutSummary from "@/components/cart/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  clearCart,
} from "@/redux/features/cart/cartSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  completeRazorpayPayment,
  createRazorpayOrder,
  deleteCustomerAddress,
  fetchCheckoutAddressSelection,
  fetchCustomerAddresses,
  saveCheckoutAddressSelection,
  selectDefaultCustomerAddress,
} from "@/lib/api";
import { selectUser } from "@/redux/features/user/userSlice";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";

const BILLING_SELECTION_STORAGE_KEY = "checkoutBillingAddressSelection";

function formatAddressPreview(address) {
  if (!address) return "";

  return [
    address.address1,
    address.address2,
    [address.city, address.province, address.zip].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatAddressLines(address) {
  if (!address) return [];

  return [
    address.address1,
    address.address2,
    [address.city, address.province, address.zip].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
}

function readStoredBillingSelection() {
  if (typeof window === "undefined") {
    return { billingAddressMode: "same", billingAddressId: "" };
  }

  try {
    const rawValue = window.localStorage.getItem(BILLING_SELECTION_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    if (parsedValue?.billingAddressMode === "different" && parsedValue?.billingAddressId) {
      return {
        billingAddressMode: "different",
        billingAddressId: parsedValue.billingAddressId,
      };
    }
  } catch (error) {
    console.error("Billing selection restore error:", error);
  }

  return { billingAddressMode: "same", billingAddressId: "" };
}

function persistBillingSelection(selection) {
  if (typeof window === "undefined") return;

  if (selection?.billingAddressMode === "different" && selection?.billingAddressId) {
    window.localStorage.setItem(
      BILLING_SELECTION_STORAGE_KEY,
      JSON.stringify({
        billingAddressMode: "different",
        billingAddressId: selection.billingAddressId,
      })
    );
    return;
  }

  window.localStorage.removeItem(BILLING_SELECTION_STORAGE_KEY);
}

function getCartSessionId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("cart_session_id") || "";
}

function normalizePhone(value = "") {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const paymentGateways = [
    {
      id: "razorpay",
      name: "Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)",
      description: "You'll be redirected to Razorpay Secure to complete your purchase.",
    },
    {
      id: "phonepe",
      name: "PhonePe Payment Gateway (UPI, Cards & NetBanking)",
    },
  ];

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [billingAddressMode, setBillingAddressMode] = useState("same");
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState("");
  const [billingAddressSnapshot, setBillingAddressSnapshot] = useState(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState("razorpay");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkoutSelection, setCheckoutSelection] = useState(null);

  const user = useSelector(selectUser);
  const { totalAmount, appliedCoupon } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("checkout_selection");
      if (stored) {
        setCheckoutSelection(JSON.parse(stored));
      }
    }
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const billingModeRef = useRef("same");
  const billingAddressIdRef = useRef("");

  const selectedBillingAddress = useMemo(() => {
    if (billingAddressMode === "same") return selectedAddress;
    return (
      addresses.find((address) => address.id === selectedBillingAddressId) ||
      billingAddressSnapshot ||
      null
    );
  }, [addresses, billingAddressMode, selectedAddress, selectedBillingAddressId, billingAddressSnapshot]);

  const isIndiaShipping = (selectedAddress?.country || "").trim().toLowerCase() === "india";

  useEffect(() => {
    billingModeRef.current = billingAddressMode;
  }, [billingAddressMode]);

  useEffect(() => {
    billingAddressIdRef.current = selectedBillingAddressId;
  }, [selectedBillingAddressId]);

  const applyAddressPayload = useCallback(
    (payload, selection = null) => {
      setAddresses(payload.addresses || []);
      setCustomer(payload.customer || null);

      const nextSelectedId = payload.defaultAddressId || payload.addresses?.[0]?.id || "";
      const requestedBillingMode = selection?.billingAddressMode || billingModeRef.current;
      const requestedBillingAddressId = selection?.billingAddressId || billingAddressIdRef.current;
      const hasRequestedBillingAddress =
        requestedBillingMode === "different" &&
        (payload.addresses || []).some((address) => address.id === requestedBillingAddressId);
      const resolvedBillingMode = hasRequestedBillingAddress ? "different" : "same";
      const resolvedBillingAddressId = hasRequestedBillingAddress
        ? requestedBillingAddressId
        : nextSelectedId;
      const currentAddress = (payload.addresses || []).find((address) => address.id === nextSelectedId) || null;
      const currentBillingAddress = (payload.addresses || []).find((address) => address.id === resolvedBillingAddressId) || null;

      billingModeRef.current = resolvedBillingMode;
      billingAddressIdRef.current = resolvedBillingAddressId;
      setSelectedAddressId(nextSelectedId);
      setBillingAddressMode(resolvedBillingMode);
      setSelectedBillingAddressId(resolvedBillingAddressId);
      setBillingAddressSnapshot(currentBillingAddress || null);
    },
    []
  );

  const loadAddresses = useCallback(async () => {
    try {
      const storedSelection = readStoredBillingSelection();
      const [payload, selection] = await Promise.all([
        fetchCustomerAddresses(),
        fetchCheckoutAddressSelection(),
      ]);
      const effectiveSelection =
        selection?.billingAddressMode === "different" && selection?.billingAddressId
          ? selection
          : storedSelection;
      applyAddressPayload(payload, effectiveSelection);
    } catch (error) {
      toast.error(error.message || "Unable to load addresses");
    }
  }, [applyAddressPayload]);

  useEffect(() => {
    Promise.resolve().then(loadAddresses);
  }, [loadAddresses]);

  const handleSelectAddress = async (addressId) => {
    try {
      applyAddressPayload(await selectDefaultCustomerAddress(addressId));
      setAddressDialogOpen(false);
      if (billingAddressMode === "same") {
        setSelectedBillingAddressId(addressId);
      }
    } catch (error) {
      toast.error(error.message || "Unable to select address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const payload = await deleteCustomerAddress(addressId);
      applyAddressPayload(payload);
      if (selectedBillingAddressId === addressId) {
        setSelectedBillingAddressId(payload.defaultAddressId || payload.addresses?.[0]?.id || "");
        setBillingAddressMode("same");
        setBillingAddressSnapshot(payload.addresses?.[0] || null);
        billingModeRef.current = "same";
        billingAddressIdRef.current = payload.defaultAddressId || payload.addresses?.[0]?.id || "";
        persistBillingSelection({ billingAddressMode: "same" });
        await saveCheckoutAddressSelection({ billingAddressMode: "same" });
      }
      toast.success("Address removed");
    } catch (error) {
      toast.error(error.message || "Unable to remove address");
    }
  };

  const handleSelectBillingAddress = async (addressId) => {
    const nextBillingAddress = addresses.find((address) => address.id === addressId) || null;
    billingModeRef.current = "different";
    billingAddressIdRef.current = addressId;
    setBillingAddressMode("different");
    setSelectedBillingAddressId(addressId);
    setBillingAddressSnapshot(nextBillingAddress);
    setBillingDialogOpen(false);
    persistBillingSelection({
      billingAddressMode: "different",
      billingAddressId: addressId,
    });

    try {
      await saveCheckoutAddressSelection({
        billingAddressMode: "different",
        billingAddressId: addressId,
      });
    } catch (error) {
      toast.error(error.message || "Unable to save billing address");
    }
  };

  const handleBillingModeChange = async (value) => {
    setBillingAddressMode(value);

    if (value === "same") {
      billingModeRef.current = "same";
      billingAddressIdRef.current = selectedAddressId;
      setSelectedBillingAddressId(selectedAddressId);
      setBillingAddressSnapshot(selectedAddress);
      persistBillingSelection({ billingAddressMode: "same" });
      try {
        await saveCheckoutAddressSelection({ billingAddressMode: "same" });
      } catch (error) {
        toast.error(error.message || "Unable to save billing preference");
      }
      return;
    }

    if (!selectedBillingAddressId) {
      billingAddressIdRef.current = selectedAddressId;
      setSelectedBillingAddressId(selectedAddressId);
      setBillingAddressSnapshot(selectedAddress);
    }
    setBillingDialogOpen(true);
  };

  const handlePayNow = async () => {
    if (selectedPaymentGateway !== "razorpay") {
      toast.info("Razorpay checkout is available right now. Please choose Razorpay to continue.");
      return;
    }

    const isPickup = checkoutSelection?.deliveryMethod === "pickup";

    if (!isPickup && !selectedAddress) {
      toast.error("Please choose a shipping address before payment.");
      return;
    }

    if (!selectedBillingAddress) {
      toast.error("Please choose a billing address before payment.");
      return;
    }

    try {
      setPaymentLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const customerName =
        customer?.firstName || customer?.lastName
          ? [customer?.firstName, customer?.lastName].filter(Boolean).join(" ")
          : user?.name || "Lucira Customer";

      const order = await createRazorpayOrder({
        userId: user?.id || "",
        sessionId: getCartSessionId(),
        customer: {
          name: customerName,
          email: customer?.email || user?.email || checkoutSelection?.customerEmail || "",
          phone: normalizePhone(customer?.phone || user?.mobile || selectedAddress?.phone || ""),
        },
        shippingAddress: isPickup ? checkoutSelection.selectedStore : selectedAddress,
        billingAddress: selectedBillingAddress,
        appliedCoupon: appliedCoupon,
      });

      const razorpay = new window.Razorpay({
        key: order.key,
        name: "Lucira",
        description: "Complete your order securely",
        order_id: order.orderId,
        handler: async function handleSuccess(response) {
          try {
            setPaymentLoading(true);

            const completion = await completeRazorpayPayment({
              userId: user?.id || "",
              sessionId: getCartSessionId(),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              draftId: order.draftId,
              customer: {
                id: customer?.id || "",
                name: customerName,
                email: customer?.email || user?.email || checkoutSelection?.customerEmail || "",
                phone: normalizePhone(customer?.phone || user?.mobile || selectedAddress?.phone || ""),
              },
              shippingAddress: isPickup ? checkoutSelection.selectedStore : selectedAddress,
              billingAddress: selectedBillingAddress,
            });

            dispatch(clearCart());
            toast.success(
              completion?.shopifyOrderName
                ? `Order placed successfully: ${completion.shopifyOrderName}`
                : "Order placed successfully"
            );
            router.replace("/success");
          } catch (completionError) {
            toast.error(completionError.message || "Payment succeeded but order creation failed");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment window closed.");
          },
          confirm_close: true,
        },
        prefill: {
          name: order.customer?.name || customerName,
          email: order.customer?.email || checkoutSelection?.customerEmail || "",
          contact: order.customer?.contact || "",
          method: "upi",
        },
        notes: {
          shipping_address: isPickup ? checkoutSelection.selectedStore?.address : formatAddressPreview(selectedAddress),
          billing_address: formatAddressPreview(selectedBillingAddress),
          shipping_gstin: selectedAddress?.gstin || "",
          billing_gstin: selectedBillingAddress?.gstin || "",
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                methods: ["vpa", "qr"],
              },
            },
            sequence: ["block.upi", "block.cards", "block.netbanking"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#111111",
        },
        retry: {
          enabled: false,
        },
      });

      razorpay.on("payment.failed", function handleFailure(response) {
        const reason =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try again.";
        toast.error(reason);
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.message || "Unable to start payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const isPickup = checkoutSelection?.deliveryMethod === "pickup";

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="max-w-7xl w-full mx-auto relative z-10 px-4">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          <div className="grow lg:basis-[60%] lg:shrink-0 py-10 px-4 lg:pr-12 space-y-10 bg-white">
            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <div className="p-4 grid grid-cols-[140px_1fr_60px] items-center gap-4 text-sm border-b border-zinc-100">
                <span className="text-zinc-500 whitespace-nowrap">Contact</span>
                <span className="text-zinc-900 font-medium">{customer?.email || checkoutSelection?.customerEmail || "techamitjha@gmail.com"}</span>
                <Link
                  href="/checkout/shipping?method=ship"
                  className="text-[#005BD3] text-right hover:underline"
                >
                  Change
                </Link>

              </div>

              <div className="p-4 grid grid-cols-[140px_1fr_60px] items-center gap-4 text-sm border-b border-zinc-100">
                <span className="text-zinc-500 whitespace-nowrap">{isPickup ? "Pickup location" : "Ship to"}</span>
                <div className="text-zinc-900 font-medium">
                  {isPickup ? (
                    <div className="space-y-1">
                      <p className="font-bold">{checkoutSelection?.selectedStore?.code || checkoutSelection?.selectedStore?.name}</p>
                      <p className="line-clamp-2 text-zinc-600 font-normal">{checkoutSelection?.selectedStore?.address}</p>
                    </div>
                  ) : selectedAddress ? (
                    <div className="space-y-1">
                      <p className="line-clamp-2">{formatAddressPreview(selectedAddress)}</p>
                      {selectedAddress.gstin && <p className="text-sm font-semibold">GSTIN: {selectedAddress.gstin}</p>}
                    </div>
                  ) : (
                    <p>No shipping address selected</p>
                  )}
                </div>
                <Link
                  href={`/checkout/shipping?method=${isPickup ? "pickup" : "ship"}`}
                  className="text-[#005BD3] text-right hover:underline"
                >
                  Change
                </Link>
              </div>

              {!isPickup && (
                <div className="p-4 grid grid-cols-[140px_1fr_60px] items-center gap-4 text-sm border-b border-zinc-100">
                  <span className="text-zinc-500 whitespace-nowrap">Bill to</span>
                  <div className="text-zinc-900 font-medium">
                    {selectedBillingAddress ? (
                      <div className="space-y-1">
                        <p className="line-clamp-2">{formatAddressPreview(selectedBillingAddress)}</p>
                        {selectedBillingAddress.gstin && <p className="text-sm font-semibold">GSTIN: {selectedBillingAddress.gstin}</p>}
                      </div>
                    ) : (
                      <p>No billing address selected</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBillingDialogOpen(true)}
                    className="text-[#005BD3] text-right hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="p-4 grid grid-cols-[140px_1fr] items-center gap-4 text-sm">
                <span className="text-zinc-500 whitespace-nowrap">{isPickup ? "Method" : "Shipping method"}</span>
                <span className="text-zinc-900 font-medium">
                  {isPickup ? "Pickup" : "Shipping Rate"} · <span className="font-bold">{isPickup || isIndiaShipping ? "FREE" : "Calculated at next step"}</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-900">Billing address</h2>
                <p className="text-sm text-zinc-500">Select the address that matches your card or payment method.</p>
              </div>

              {isPickup ? (
                <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      {selectedBillingAddress ? (
                        <>
                          <h4 className="font-bold text-zinc-900">
                            {[selectedBillingAddress.firstName, selectedBillingAddress.lastName].filter(Boolean).join(" ")}
                          </h4>
                          <p className="text-sm text-zinc-500">{formatAddressPreview(selectedBillingAddress)}</p>
                        </>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No billing address selected</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setBillingDialogOpen(true)}
                      className="border-zinc-200 text-[#005BD3] font-bold"
                    >
                      Select billing address
                    </Button>
                  </div>
                </div>
              ) : (
                <RadioGroup
                  value={billingAddressMode}
                  onValueChange={handleBillingModeChange}
                  className="grid gap-0 border border-zinc-200 rounded-xl overflow-hidden bg-white"
                >
                  <div className={`p-5 flex items-center gap-3 border-b border-zinc-200 ${billingAddressMode === "same" ? "bg-[#F0F7FF]" : ""}`}>
                    <RadioGroupItem value="same" id="same" className="text-[#005BD3] border-zinc-300" />
                    <Label htmlFor="same" className="font-medium text-zinc-900 cursor-pointer">Same as shipping address</Label>
                  </div>
                  <div className={`p-5 flex items-center gap-3 transition-all hover:bg-zinc-50/50 cursor-pointer ${billingAddressMode === "different" ? "bg-[#F0F7FF]" : ""}`}>
                    <RadioGroupItem value="different" id="different" className="text-[#005BD3] border-zinc-300" />
                    <Label htmlFor="different" className="font-medium text-zinc-900 cursor-pointer">Use a different billing address</Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-900">Payment</h2>
                <p className="text-sm text-zinc-500">All transactions are secure and encrypted.</p>
              </div>

              <RadioGroup
                value={selectedPaymentGateway}
                onValueChange={setSelectedPaymentGateway}
                className="grid gap-0 border border-zinc-200 rounded-xl overflow-hidden bg-white"
              >
                {paymentGateways.map((gateway, index) => (
                  <div key={gateway.id} className={`flex flex-col ${index === 0 ? "border-b border-zinc-200" : ""}`}>
                    <div className={`p-5 flex items-center justify-between transition-all cursor-pointer ${index === 0 ? "bg-[#F0F7FF]" : ""}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={gateway.id} id={gateway.id} className="text-[#005BD3] border-zinc-300" />
                        <Label htmlFor={gateway.id} className="font-medium text-zinc-900 cursor-pointer">{gateway.name}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 items-center bg-white px-2 py-1 rounded border border-zinc-100">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" className="h-3 w-auto opacity-70" alt="UPI" width={36} height={12} unoptimized />
                        </div>
                        <div className="flex gap-1 items-center bg-white px-2 py-1 rounded border border-zinc-100">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-2 w-auto opacity-70" alt="VISA" width={36} height={8} unoptimized />
                        </div>
                        <div className="flex gap-1 items-center bg-white px-2 py-1 rounded border border-zinc-100">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3 w-auto opacity-70" alt="MASTERCARD" width={36} height={12} unoptimized />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold">+{index === 0 ? "18" : "4"}</span>
                      </div>
                    </div>
                    {gateway.description && (
                      <div className="px-14 pb-5 pt-0 bg-[#F0F7FF] text-center">
                        <div className="p-4 bg-zinc-50/50 rounded-lg text-sm text-zinc-600 border border-zinc-100">
                          {gateway.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
              <Link href="/checkout/shipping" className="flex items-center gap-2 text-sm font-medium text-[#005BD3] hover:underline">
                <ChevronLeft size={16} />
                Return to shipping
              </Link>
              <Button
                type="button"
                onClick={handlePayNow}
                disabled={paymentLoading || !totalAmount}
                className="w-full md:w-max md:px-14 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all text-lg uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? "Processing..." : "Pay now"}
              </Button>
            </div>
          </div>

          <div className="w-full lg:basis-[40%] lg:shrink-0 relative">
            <div className="hidden lg:block absolute inset-y-0 left-0 w-screen bg-[#FAFAFA] border-l border-zinc-100 z-0" />
            <div className="relative z-10 py-10 px-4 lg:pl-12 bg-[#FAFAFA] lg:bg-transparent min-h-full">
              <div className="lg:sticky lg:top-0">
                <CheckoutSummary />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>All addresses</DialogTitle>
            <DialogDescription>
              Select an address to use for shipping and keep it as your default.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;
              return (
                <div
                  key={`payment-${address.id}`}
                  onClick={() => handleSelectAddress(address.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectAddress(address.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected ? "border-primary bg-[#FFF8F4]" : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment-shipping-addresses"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 size-4 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-900">
                            {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Saved address"}
                          </h3>
                          {address.isDefault && (
                            <span className="rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleDeleteAddress(address.id);
                          }}
                          className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-red-200 hover:text-red-600"
                          aria-label="Delete address"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        {formatAddressLines(address).map((line) => (
                          <p key={`payment-line-${address.id}-${line}`}>{line}</p>
                        ))}
                        {address.gstin && <p className="font-medium text-zinc-800">GSTIN: {address.gstin}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Billing address</DialogTitle>
            <DialogDescription>
              Select the billing address to use for this payment.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {addresses.map((address) => {
              const isSelected = selectedBillingAddress?.id === address.id;
              return (
                <div
                  key={`billing-${address.id}`}
                  onClick={() => handleSelectBillingAddress(address.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectBillingAddress(address.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected ? "border-primary bg-[#FFF8F4]" : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment-billing-addresses"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 size-4 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900">
                          {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Saved address"}
                        </h3>
                        {address.isDefault && (
                          <span className="rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        {formatAddressLines(address).map((line) => (
                          <p key={`billing-line-${address.id}-${line}`}>{line}</p>
                        ))}
                        {address.gstin && <p className="font-medium text-zinc-800">GSTIN: {address.gstin}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
