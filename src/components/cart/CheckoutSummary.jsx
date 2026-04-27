"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, Truck, MessageCircle, Coins, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyPoints, removePoints } from "@/redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import CartContact from "./CartContact";

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";
const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

export default function CheckoutSummary({ 
  showItems = true, 
  showBreakdown = true, 
  showPoints = true, 
  showContact = true,
  className = ""
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { items, totalAmount, appliedCoupon, removeCoupon, nectorPoints } = useCart();
  const user = useSelector((state) => state.user.user);
  
  const [pointsData, setPointsData] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const isPaymentPage = pathname === "/checkout/payment";

  const isCheckoutPage = pathname.startsWith("/checkout") && pathname !== "/checkout/cart";

  // Check if cart contains Diamond Jewellery
  const hasDiamondJewellery = items.some(item => {
    const type = (item.type || item.productType || item.product_type || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    const hasDiamondCharges = !!item.diamondCharges || (item.customAttributes?.some(attr => attr.key === "_Diamond Charges" && attr.value));
    
    return type.includes("diamond") || title.includes("diamond") || 
           type.includes("solitaire") || title.includes("solitaire") ||
           type.includes("gemstone") || title.includes("gemstone") ||
           hasDiamondCharges;
  });

  const insuranceItem = items.find(item => item.variantId === INSURANCE_VARIANT_ID);
  const insuranceValue = insuranceItem ? (insuranceItem.price * (insuranceItem.quantity || 1)) : 0;

  const goldCoinItem = items.find(item => item.variantId === GOLDCOIN_VARIANT_ID);
  const subtotalValue = (totalAmount || 0) - insuranceValue;

  const couponDetails = typeof appliedCoupon === 'object' ? appliedCoupon : { code: appliedCoupon, summary: "Applied", value: 0, valueType: "FIXED_AMOUNT" };

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (couponDetails.valueType === "FIXED_AMOUNT") {
      couponDiscountAmount = couponDetails.value;
    } else if (couponDetails.valueType === "PERCENTAGE") {
      couponDiscountAmount = (subtotalValue * couponDetails.value) / 100;
    }
  }

  const discountValue = couponDiscountAmount;
  const pointsDiscountAmount = nectorPoints?.fiat_value || 0;
  const grandTotalValue = subtotalValue + insuranceValue - discountValue - pointsDiscountAmount;

  useEffect(() => {
    if (isPaymentPage && user?.id && hasDiamondJewellery) {
      fetchPoints();
    }
  }, [isPaymentPage, user?.id, hasDiamondJewellery]);

  const fetchPoints = async () => {
    try {
      setLoadingPoints(true);
      
      const diamondJewelleryAmount = items
        .filter(item => {
          const type = (item.type || item.productType || "").toLowerCase();
          const title = (item.title || "").toLowerCase();
          return type.includes("diamond") || title.includes("diamond") || title.includes("solitaire") || type.includes("solitaire");
        })
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);

      const getNectorCustomerId = (gid) => {
        if (!gid) return "";
        const match = String(gid).match(/\d+$/);
        const numericId = match ? match[0] : gid;
        return `shopify-${numericId}`;
      };

      const response = await fetch('/api/nector/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: getNectorCustomerId(user.id),
          country: "ind",
          action: "list",
          amount: diamondJewelleryAmount
        })
      });
      const result = await response.json();
      if (result.meta?.code === 200) {
        setPointsData(result.data);
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoadingPoints(false);
    }
  };

  const handleApplyPoints = () => {
    if (!hasDiamondJewellery) {
      toast.warning("Loyalty points can only be applied to Diamond Jewellery.");
      return;
    }

    if (!pointsData?.promotions?.[0]) {
      toast.info("No available promotions to apply");
      return;
    }

    const promotion = pointsData.promotions[0];
    dispatch(applyPoints({
      coin_value: promotion.coin_value,
      fiat_value: promotion.fiat_value,
      points_label: pointsData.points_label || "Lucira Coins"
    }));
    toast.success(`Applied ${promotion.fiat_value} discount from points!`);
  };

  const handleRemovePoints = () => {
    dispatch(removePoints());
    toast.info("Points discount removed");
  };

  const displayItems = items.filter(
    (item) =>
      item.variantId !== INSURANCE_VARIANT_ID &&
      item.variantId !== GOLDCOIN_VARIANT_ID
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {showItems && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#443360] font-abhaya">Order Summary</h2>
          <div className="bg-white border border-zinc-100 rounded-lg p-4 space-y-4 shadow-sm">
            {displayItems.map((item, index) => {
              const isInsurance = item.variantId === INSURANCE_VARIANT_ID;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-zinc-50 rounded-md border border-zinc-100 p-1 flex-shrink-0 block">
                      <Image 
                        src={item.image || "/images/product/1.jpg"} 
                        alt={item.title} 
                        width={80} 
                        height={80} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-sm font-medium text-zinc-800 leading-tight transition-colors">{item.title}</h3>
                      <p className="text-xs text-zinc-500">Quantity:: {item.quantity}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm font-bold text-zinc-900">₹{(item.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        {item.comparePrice > item.price && (
                          <span className="text-xs text-zinc-400 line-through">₹{(item.comparePrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isInsurance && (
                    <div className="bg-zinc-50 p-2 rounded-md flex items-center gap-2">
                      <Truck size={14} className="text-black" />
                      <span className="text-[10px] font-medium text-black">Est. Delivery by {item.estDelivery || "8-10 Days"}</span>
                    </div>
                  )}
                  {index < displayItems.length - 1 && <div className="border-b border-zinc-50 pt-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showBreakdown && (
        <div className="space-y-3 border-zinc-50 shadow-sm bg-white rounded-lg p-6">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span className="font-medium text-zinc-900">₹{subtotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-sm text-[#189351]">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider">Coupon ({typeof appliedCoupon === 'object' ? appliedCoupon.code : appliedCoupon})</span>
                {!isCheckoutPage && (
                  <button 
                    onClick={removeCoupon}
                    className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter"
                  >
                    (Remove)
                  </button>
                )}
              </div>
              <span className="font-bold">- ₹ {couponDiscountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          )}
          {goldCoinItem && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Free Gold Coin ({goldCoinItem.quantity})</span>
              <span className="font-bold">₹ 0</span>
            </div>
          )}
          {insuranceValue > 0 && (
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Insurance</span>
              <span className="font-bold">₹{insuranceValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-[#189351]">
            <span>Shipping (Standard)</span>
            <span className="font-bold">Free</span>
          </div>
          <div className="border-t border-zinc-100 my-4 pt-4 flex justify-between items-center">
            <span className="text-base font-bold text-[#443360] uppercase tracking-wider">GRAND TOTAL</span>
            <span className="text-lg font-bold text-[#443360]">₹{grandTotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      )}

      {showPoints && isPaymentPage && user && hasDiamondJewellery && (
        <div className="bg-[#FAF6F3] p-4 rounded-xl border border-[#E8DCCF] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-[#B4936B]" />
              <span className="text-sm font-bold text-[#443360]">
                {loadingPoints ? "Checking balance..." : (pointsData?.points_label || "Lucira Coins Balance")}
              </span>
            </div>
            {!loadingPoints && pointsData && (
              <span className="text-sm font-bold text-[#B4936B]">{pointsData.points_balance}</span>
            )}
          </div>
          {loadingPoints ? (
            <div className="flex justify-center py-2">
              <Loader2 className="animate-spin text-[#B4936B]" size={20} />
            </div>
          ) : nectorPoints ? (
            <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-[#B4936B]/20">
              <div className="text-xs">
                <span className="font-bold text-[#189351]">Applied: -₹{nectorPoints.fiat_value}</span>
                <p className="text-zinc-500 tracking-tight">Redeemed {nectorPoints.coin_value} coins</p>
              </div>
              <button onClick={handleRemovePoints} className="text-[10px] font-bold text-red-500 hover:underline uppercase">Remove</button>
            </div>
          ) : pointsData?.promotions?.[0] ? (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 leading-tight italic">Apply {pointsData.promotions[0].title} for {pointsData.promotions[0].coin_value} coins?</p>
              <button onClick={handleApplyPoints} className="w-full bg-[#B4936B] hover:bg-[#A3825A] text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">Apply Points</button>
            </div>
          ) : pointsData && (
            <p className="text-[10px] text-zinc-400 text-center italic">Not enough coins to redeem for this order.</p>
          )}
        </div>
      )}

      {showContact && <CartContact />}
    </div>
  );
}
