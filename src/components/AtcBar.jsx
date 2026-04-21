"use client";
import React from "react";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AtcBar({ 
  isVisible, 
  product, 
  activeVariant, 
  onAddToCart, 
  addingToCart, 
  onToggleWishlist, 
  isWishlisted,
  wishlistLoading
}) {
  const formatPrice = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
  };

  const currentPrice = activeVariant?.price || product?.price || 0;

  return (
    <>
      {/* Desktop Sticky Top Bar */}
      <div 
        className={cn(
          "fixed top-0 left-0 w-full bg-white z-[200] border-b border-gray-100 transition-all duration-500 transform shadow-sm px-4 lg:px-17 py-3 hidden lg:block",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="max-w-480 mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-50 shrink-0">
              <Image 
                src={activeVariant?.image || product?.featuredImage || "/images/product/1.jpg"} 
                alt={product?.title || "Product"} 
                fill 
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-black truncate leading-tight">
                {product?.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-black">
                  ₹{formatPrice(currentPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={onAddToCart}
              disabled={addingToCart}
              className="h-11 px-10 text-sm font-bold bg-[#A36E6E] hover:bg-[#8F5D5D] text-white rounded-md transition-colors"
            >
              {addingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : "ADD TO CART"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onToggleWishlist}
              disabled={wishlistLoading}
              className={cn(
                "h-11 w-11 border-[#E89393] hover:bg-[#FFF5F5] transition-colors",
                isWishlisted ? "text-rose-500" : "text-[#E89393]"
              )}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 w-full bg-white z-[200] border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-4 py-3 lg:hidden"
        )}
      >
        <div className="flex items-center gap-2 w-full h-12">
          {/* WhatsApp Button */}
          <a 
            href="https://wa.me/yournumber" 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-full aspect-square bg-[#25D366] rounded-xl flex items-center justify-center shrink-0"
          >
            <div className="relative w-7 h-7">
               <Image src="/images/icons/whatsapp.png" alt="WhatsApp" fill className="object-contain invert brightness-200" />
            </div>
          </a>

          {/* 9=10 Saving Button */}
          <button className="h-full flex-1 border border-[#A36E6E] text-[#A36E6E] font-bold text-[13px] rounded-xl flex items-center justify-center whitespace-nowrap px-2">
            9=10 SAVING
          </button>

          {/* Add to Cart Button */}
          <button 
            onClick={onAddToCart}
            disabled={addingToCart}
            className="h-full flex-[1.5] bg-[#A36E6E] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "ADD TO CART"
            )}
          </button>
        </div>
      </div>
    </>
  );
}