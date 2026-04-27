"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useRouter } from "next/navigation";
import { pushViewCart, pushBeginCheckout } from "@/lib/gtm";

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";
const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

export default function CartPage() {
  const router = useRouter();
  const { items, totalQuantity, totalAmount, appliedCoupon } = useSelector((state) => state.cart);  
  const { isAuthenticated } = useSelector((state) => state.user);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const summaryRef = useRef(null);

  const scrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredItems = items.filter(
    (item) => 
      item.variantId !== INSURANCE_VARIANT_ID && 
      item.variantId !== GOLDCOIN_VARIANT_ID
  );

  const handlePlaceOrder = () => {
    const getNumericId = (gid) => {
      if (!gid) return 0;
      if (typeof gid === 'number') return gid;
      const match = String(gid).match(/\d+$/);
      return match ? Number(match[0]) : 0;
    };

    const checkoutData = {
      payment_type: "Pay Via UPI / COD",
      send_to: "G-K6H0NZ4YJ8",
      value: Number(totalAmount),
      currency: "INR",
      items: items.map((item, idx) => {
        const lowerTitle = (item.title || "").toLowerCase();
        let category = item.type || item.productType || "";
        if (!category) {
          if (lowerTitle.includes("ring")) category = "Rings";
          else if (lowerTitle.includes("earring") || lowerTitle.includes("bali")) category = "Earrings";
          else if (lowerTitle.includes("pendant")) category = "Pendants";
          else if (lowerTitle.includes("bracelet")) category = "Bracelets";
          else if (item.variantId === GOLDCOIN_VARIANT_ID) category = "Gold Coin";
          else if (item.variantId === INSURANCE_VARIANT_ID) category = "Insurance";
        }
        return {
          item_id: String(getNumericId(item.productId || item.shopifyId || item.id)),
          sku: item.sku || "",
          variant_id: String(getNumericId(item.variantId)),
          item_name: item.title,
          item_variant: item.variantTitle || `${item.karat || ""} ${item.color || ""}`.trim(),
          item_brand: "Lucira Jewelry",
          item_category: "",
          price: Number(item.price || 0),
          quantity: item.quantity,
          category: category,
          index: idx
        };
      }),
      coupon: appliedCoupon?.code || "NA"
    };

    pushBeginCheckout(checkoutData);

    if (isAuthenticated) {
      router.push("/checkout/shipping");
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 space-y-6 bg-white">
        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 shadow-inner mb-2">
          <ShoppingBag size={40} className="text-zinc-300" strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-zinc-800 font-abhaya">Your cart is empty</h1>
          <p className="text-zinc-500 max-w-xs mx-auto">Looks like you haven&apos;t added anything to your cart yet.</p>
        </div>
        <Link href="/collections">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 uppercase tracking-widest rounded-sm flex items-center gap-2">
            Shop Now
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Mobile Header (LG Hidden) */}
      <div className="lg:hidden pt-6 px-4 bg-white">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold text-zinc-800 font-abhaya">My Shopping Cart</h1>
          <span className="text-sm text-zinc-500 font-medium">({totalQuantity} Item{totalQuantity !== 1 ? 's' : ''})</span>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10 px-4">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          
          {/* Left Column: Cart Items (60%) */}
          <div className="grow lg:basis-[60%] lg:shrink-0 py-6 lg:py-10 lg:pr-12 bg-white">
            <div className="lg:sticky lg:top-10">
              <div className="hidden lg:flex items-baseline gap-2 mb-5">
                <h1 className="text-xl font-bold text-zinc-800 font-abhaya">My Shopping Cart</h1>
                <span className="text-sm text-zinc-500 font-medium">({totalQuantity} Item{totalQuantity !== 1 ? 's' : ''})</span>
              </div>

              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <CartItem 
                    key={item.variantId || index} 
                    item={item} 
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (40%) */}
          <div className="w-full lg:basis-[40%] lg:shrink-0 lg:self-start relative" ref={summaryRef}>
            <div className="hidden lg:block absolute inset-y-0 left-0 w-screen bg-[#FAFAFA] border-l border-zinc-100 z-0" />
            
            <div className="relative z-10 py-6 lg:py-10 lg:pl-12 bg-[#FAFAFA] lg:bg-transparent min-h-full rounded-3xl lg:rounded-none">
              <div className="lg:sticky lg:top-6">
                <CartSummary onPlaceOrder={handlePlaceOrder} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] z-[60]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-zinc-900 leading-none">₹ {totalAmount.toLocaleString('en-IN')}</span>
            <button 
              onClick={scrollToSummary}
              className="text-[11px] font-bold text-accent uppercase tracking-tight mt-1 text-left"
            >
              View Order Summary
            </button>
          </div>
          <Button 
            onClick={handlePlaceOrder}
            className="grow bg-primary hover:bg-accent text-white font-bold h-12 uppercase tracking-widest rounded-lg text-sm"
          >
            Place Order
          </Button>
        </div>
      </div>

      <AuthDialog 
        open={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen} 
        onSuccess={() => {
          setIsAuthDialogOpen(false);
          router.push("/checkout/shipping");
        }}
      />
    </div>
  );
}
