"use client";

import Image from "next/image";
import { Phone, MessageSquare, Truck, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CheckoutSummary() {
  const { items, totalAmount } = useCart();

  const subtotalValue = totalAmount || 0;
  const discountValue = 0; // Logic for discounts can be added later
  const shippingValue = 0; // Free shipping
  const totalCostValue = subtotalValue - discountValue + shippingValue;

  // Mock data to match screenshots for two items
  const displayItems = items.length > 0 ? items : [
    {
      id: 1,
      title: "Hanging Boat Diamond Hoop Earrings",
      quantity: 1,
      price: "30,701",
      originalPrice: "36,212",
      discount: "15%",
      image: "/images/product/1.jpg",
      estDelivery: "8th Apr"
    },
    {
      id: 2,
      title: "Stellar Luminous Adjustable Gold Bracelet",
      quantity: 1,
      price: "23,572",
      originalPrice: "25,715",
      discount: "8%",
      image: "/images/product/2.jpg",
      estDelivery: "10th Apr"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#443360] font-abhaya">Order Summary</h2>
        
        {/* Items List */}
        <div className="bg-white border border-zinc-100 rounded-lg p-4 space-y-4 shadow-sm">
          {displayItems.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-zinc-50 rounded-md border border-zinc-100 p-1 flex-shrink-0">
                  <Image 
                    src={item.image || "/images/product/1.jpg"} 
                    alt={item.title} 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className="text-sm font-medium text-zinc-800 leading-tight">{item.title}</h3>
                  <p className="text-xs text-zinc-500">Quantity:: {item.quantity}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-bold text-zinc-900">₹{item.price}</span>
                    <span className="text-xs text-zinc-400 line-through">₹{item.originalPrice}</span>
                    <span className="text-xs font-bold text-red-500">({item.discount} )</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#F3E8FF]/30 p-2 rounded-md flex items-center gap-2">
                <Truck size={14} className="text-[#7C3AED]" />
                <span className="text-[10px] font-medium text-[#7C3AED]">Est. Delivery by by {item.estDelivery}</span>
              </div>
              {index < displayItems.length - 1 && <div className="border-b border-zinc-50 pt-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 px-1 pt-2">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span className="font-medium text-zinc-900">₹{subtotalValue.toLocaleString('en-IN')}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between text-sm text-[#189351]">
            <span>Cart Discount</span>
            <span className="font-bold">- ₹{discountValue.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-[#189351]">
          <span>Shipping (Standard)</span>
          <span className="font-bold">Free</span>
        </div>
        
        <div className="border-t border-zinc-100 my-4 pt-4 flex justify-between items-center">
          <span className="text-base font-bold text-[#443360] uppercase tracking-wider">TOTAL COST</span>
          <span className="text-lg font-bold text-[#443360]">₹{totalCostValue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border border-zinc-50 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <h4 className="text-[11px] font-bold text-[#443360] uppercase tracking-[0.2em]">CONTACT US FOR ASSISTANCE</h4>
        <div className="flex justify-around items-center pt-2">
          <button className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <Phone size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Call</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <MessageCircle size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Whatsapp</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <MessageSquare size={18} className="text-[#443360]" />
            <span className="text-xs font-bold text-[#443360]">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
