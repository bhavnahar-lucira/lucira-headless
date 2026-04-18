"use client";

import { useCart } from "@/hooks/useCart";
import { Loader2, Check, Coins, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

export default function GoldCoinOption() {
  const { items, addToCart, removeFromCart, loading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const goldCoinItem = items.find(item => item.variantId === GOLDCOIN_VARIANT_ID);
  const isApplied = !!goldCoinItem;

  // Logic: Only Diamond Jewellery counts (using diamondCharges > 0 as proxy)
  // Gold jewellery collection (diamondCharges: 0 or undefined) does not count
  const diamondTotal = items
    .filter(item => item.variantId !== GOLDCOIN_VARIANT_ID && item.variantId !== "gid://shopify/ProductVariant/47709366026458" && (item.diamondCharges > 0))
    .reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  // Condition: Total diamond amount divided by 20000, floored
  const eligibleQuantity = Math.floor(diamondTotal / 20000);

  const handleApply = async () => {
    if (eligibleQuantity <= 0) return;
    setIsProcessing(true);
    try {
      const product = {
        productId: "gid://shopify/Product/9023549014234",
        variantId: GOLDCOIN_VARIANT_ID,
        title: "100 mg Gold Coin",
        image: "/images/icons/metal.svg", // Placeholder or real image
        price: 0, // 100% discount
        originalPrice: 2000,
        quantity: eligibleQuantity,
        variantTitle: "Free Gift",
        inStock: true,
        isFreeGift: true
      };
      await addToCart(product);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    setIsProcessing(true);
    try {
      await removeFromCart(GOLDCOIN_VARIANT_ID);
    } finally {
      setIsProcessing(false);
    }
  };

  if (eligibleQuantity <= 0 && !isApplied) return null;

  return (
    <div className="bg-amber-50/50 border border-dashed border-amber-200 p-4 rounded-xl flex items-center justify-between group transition-all hover:bg-amber-50">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <Coins size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-800">Free Gold Coin</span>
          <span className="text-[10px] text-zinc-500 font-medium">
            You are eligible for {eligibleQuantity} Gold Coin{eligibleQuantity > 1 ? 's' : ''}!
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isApplied ? (
          <button
            onClick={handleRemove}
            disabled={isProcessing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={isProcessing || loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 shadow-sm"
          >
            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
