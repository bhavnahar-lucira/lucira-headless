"use client";
import React from "react";
import Image from "next/image";
import { Heart, Store, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const currentPrice = activeVariant?.price || product?.price || 0;
  const currentComparePrice = activeVariant?.compare_price || product?.compare_price;
  const discount = currentComparePrice && currentPrice < currentComparePrice 
    ? Math.round((1 - currentPrice / currentComparePrice) * 100) 
    : null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 w-full bg-white z-[200] border-b border-gray-100 transition-all duration-500 transform shadow-sm px-4 lg:px-17 py-3",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="max-w-480 mx-auto flex items-center justify-between gap-4">
        {/* Product Info */}
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
            <h3 className="text-sm lg:text-base font-bold text-black truncate leading-tight">
              {product?.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm lg:text-base font-bold text-black">
                ₹{formatPrice(currentPrice)}
              </span>
              {discount && (
                <span className="text-xs lg:text-sm font-bold text-[#189351] flex items-center gap-0.5">
                  <span className="text-[10px]">↓</span>{discount}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={onAddToCart}
            disabled={addingToCart}
            className="h-10 lg:h-12 px-6 lg:px-12 text-sm lg:text-base font-bold bg-[#A36E6E] hover:bg-[#8F5D5D] text-white rounded-md transition-colors"
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
              "h-10 w-10 lg:h-12 lg:w-12 border-[#E89393] hover:bg-[#FFF5F5] hover:text-inherit transition-colors",
              isWishlisted ? "text-rose-500 hover:text-rose-500" : "text-[#E89393] hover:text-[#E89393]"
            )}
          >
            <Heart 
              size={20} 
              fill={isWishlisted ? "currentColor" : "none"} 
            />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 lg:h-12 lg:w-12 border-[#E89393] text-[#E89393] hover:bg-[#FFF5F5] hover:text-[#E89393] transition-colors"
          >
            <Home size={20} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 lg:h-12 lg:w-12 border-[#8E87F1] text-[#8E87F1] hover:bg-[#F5F5FF] hover:text-[#8E87F1] transition-colors"
          >
            <Store size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
