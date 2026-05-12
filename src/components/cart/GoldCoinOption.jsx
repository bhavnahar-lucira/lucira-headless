"use client";

import { useCart } from "@/hooks/useCart";
import { Loader2, Check, Coins, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

export default function GoldCoinOption() {
  const { items, addToCart, removeFromCart, loading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings/gold-coin")
      .then(res => res.json())
      .then(data => setIsEnabled(data.enabled ?? false))
      .catch(err => console.error("Error fetching gold coin setting:", err));
  }, []);

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

  if (!isEnabled) return null;
  if (eligibleQuantity <= 0 && !isApplied) return null;

  return (
    <div className="bg-gradient-to-br from-[#fffdf7] to-[#fdf5e4] border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4 transition-all hover:bg-[#fdf5e4]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#f9e8b8] to-[#e8c97a] shadow-[0_2px_10px_rgba(184,146,74,0.25),inset_0_1px_2px_rgba(255,255,255,0.6)] shrink-0">
          <Coins size={18} className="text-[#7a5020]" />
        </div>
        <div className="flex flex-col">
          <span className="font-abhaya text-lg font-bold text-[#7a5020] tracking-wide leading-snug">
            Free Gold Coin
          </span>
          <span className="font-figtree text-[0.7rem] text-zinc-500 tracking-wide mt-0.5">
            You are eligible for {eligibleQuantity} Gold Coin{eligibleQuantity > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isApplied ? (
          <button
            onClick={handleRemove}
            disabled={isProcessing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] cursor-pointer font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={isProcessing || loading}
            className="flex items-center gap-1.5 px-4 py-2 cursor-pointer bg-gradient-to-br from-yellow-300 to-yellow-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-[0_3px_12px_rgba(184,146,74,0.35)] transition-all hover:-translate-y-[1px] hover:shadow-[0_5px_18px_rgba(184,146,74,0.45)] active:translate-y-0 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
