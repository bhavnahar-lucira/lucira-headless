"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Tag, Phone, MessageSquare, Gift, Truck, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useSelector } from "react-redux";
import InsuranceOption from "./InsuranceOption";
import GoldCoinOption, { GOLDCOIN_VARIANT_ID } from "./GoldCoinOption";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";

export default function CartSummary({ onPlaceOrder }) {
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const { items, totalAmount, totalQuantity, updateCartItem, removeFromCart } = useCart();

  const otherItemsQuantity = items
    .filter(item => item.variantId !== INSURANCE_VARIANT_ID && item.variantId !== GOLDCOIN_VARIANT_ID)
    .reduce((acc, item) => acc + (item.quantity || 1), 0);

  const diamondTotal = items
    .filter(item => item.variantId !== INSURANCE_VARIANT_ID && item.variantId !== GOLDCOIN_VARIANT_ID && (item.diamondCharges > 0))
    .reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const eligibleGoldCoins = Math.floor(diamondTotal / 20000);

  const insuranceItem = items.find(item => item.variantId === INSURANCE_VARIANT_ID);
  const insuranceAmount = insuranceItem ? insuranceItem.price * (insuranceItem.quantity || 1) : 0;

  const goldCoinItem = items.find(item => item.variantId === GOLDCOIN_VARIANT_ID);

  // Auto-sync insurance and gold coin quantities
  useEffect(() => {
    // Sync Insurance
    if (insuranceItem) {
      if (otherItemsQuantity <= 0) {
        removeFromCart(INSURANCE_VARIANT_ID);
      } else if (insuranceItem.quantity !== otherItemsQuantity) {
        updateCartItem({
          currentVariantId: INSURANCE_VARIANT_ID,
          quantity: otherItemsQuantity
        });
      }
    }

    // Sync Gold Coin
    if (goldCoinItem) {
      if (eligibleGoldCoins <= 0) {
        removeFromCart(GOLDCOIN_VARIANT_ID);
      } else if (goldCoinItem.quantity !== eligibleGoldCoins) {
        updateCartItem({
          currentVariantId: GOLDCOIN_VARIANT_ID,
          quantity: eligibleGoldCoins
        });
      }
    }
  }, [otherItemsQuantity, insuranceItem?.quantity, eligibleGoldCoins, goldCoinItem?.quantity, updateCartItem, removeFromCart]);

  // Subtotal is total cart amount MINUS insurance amount
  const subtotal = totalAmount - insuranceAmount;
  const discount = 0; // Logic for discounts can be added later
  const shipping = 0; // Free shipping
  const grandTotal = subtotal + insuranceAmount - discount + shipping;

  const handleRemoveInsurance = async () => {
    await removeFromCart(INSURANCE_VARIANT_ID);
  };

  const coupons = [
    { code: "PRESET10", description: "Flat 10% off on Preset Solitaires" },
    { code: "SPARKLE10", description: "10% off on Making Charges" },
    { code: "SPARKLE100", description: "100% off on Making Charges" },
    { code: "SPARKLE20", description: "20% off on Making Charges" },
    { code: "SPARKLE5", description: "5% off on Making Charges" },
  ];

  return (
    <div className="space-y-6">
      {/* Pricing Breakdown (Same as Shipping/Payment) */}
      <div className="space-y-3 px-1 pt-2">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span className="font-medium text-zinc-900">₹ {subtotal.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-[#189351]">
            <span>Cart Discount</span>
            <span className="font-bold">- ₹ {discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        {goldCoinItem && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Free Gold Coin ({goldCoinItem.quantity})</span>
            <span className="font-bold">₹ 0</span>
          </div>
        )}
        {insuranceItem && (
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Insurance</span>
            <span className="font-medium text-zinc-900">₹ {insuranceAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-[#189351]">
          <span>Shipping (Standard)</span>
          <span className="font-bold">Free</span>
        </div>
        
        <div className="border-t border-zinc-100 my-4 pt-4 flex justify-between items-center">
          <span className="text-base font-bold text-[#443360] uppercase tracking-wider">GRAND TOTAL</span>
          <span className="text-lg font-bold text-[#443360]">₹ {grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Actions (Voucher, Gift, Place Order) */}
      <div className="space-y-4">
        <Button 
          onClick={onPlaceOrder}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 uppercase tracking-[0.2em] shadow-lg shadow-zinc-100 transition-all rounded-lg text-base"
        >
          Place Order
        </Button>

        <GoldCoinOption />

        <div className="space-y-3">
          <Sheet open={isVoucherOpen} onOpenChange={setIsVoucherOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 text-zinc-600 hover:text-primary transition-colors group w-full pt-1">
                <Tag size={16} className="text-zinc-400 group-hover:text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-zinc-300 group-hover:decoration-primary">Apply Voucher / Gift Card</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
              <div className="p-6 space-y-8">
                <div className="text-center space-y-2">
                  <SheetTitle className="text-2xl font-light text-zinc-800 font-abhaya">Apply Voucher / Gift Card</SheetTitle>
                  <SheetDescription className="text-sm text-zinc-500">Enter your code below to get a discount.</SheetDescription>
                </div>

                <div className="flex gap-0 border border-zinc-200 rounded-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                  <Input 
                    placeholder="Enter Voucher Code" 
                    className="border-0 rounded-none h-12 focus-visible:ring-0 shadow-none text-zinc-600 placeholder:text-zinc-300"
                  />
                  <Button className="rounded-none h-12 px-8 bg-primary hover:bg-primary/90 uppercase font-bold tracking-widest text-white border-0">
                    Check
                  </Button>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#443360] font-abhaya">Other Offers at Lucira</h3>
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.code} className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-sm flex items-center justify-between hover:border-primary/20 hover:bg-white transition-all group">
                        <div className="space-y-1">
                          <span className="block text-sm font-bold text-zinc-800 uppercase tracking-wider">{coupon.code}</span>
                          <span className="block text-xs text-zinc-500">{coupon.description}</span>
                        </div>
                        <button className="text-[#005BD3] text-sm font-bold uppercase tracking-widest hover:text-[#004bb1] transition-colors">
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <p className="text-[10px] text-red-500 font-medium italic">
            Voucher only applicable on sparkle100 jewellery.
          </p>
        </div>

        <div className="bg-zinc-50 p-3 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-zinc-100 transition-colors border border-zinc-100">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-800">Gift Message</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">(Optional)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#005BD3] text-xs font-bold uppercase tracking-wider">
            <Gift size={14} />
            Add
          </div>
        </div>

        <InsuranceOption />
      </div>

      {/* Contact Section (Same as Shipping/Payment) */}
      <div className="bg-white border border-zinc-50 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <h4 className="text-[11px] font-bold text-[#443360] uppercase tracking-[0.2em]">CONTACT US FOR ASSISTANCE</h4>
        <div className="flex justify-around items-center pt-2">
          <button className="flex items-center gap-2 bg-zinc-50 px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <Phone size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Call</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-50 px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <MessageCircle size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Whatsapp</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-50 px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <MessageSquare size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
