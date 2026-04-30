"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, MapPin, Heart, Plus, Loader2, X, Star } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { pushViewCart, pushBeginCheckout } from "@/lib/gtm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { addToCart, openCart } from "@/redux/features/cart/cartSlice";
import { removeWishlistItem, removeGuestWishlistItem } from "@/redux/features/wishlist/wishlistSlice";
import Image from "next/image";
import { toast } from "react-toastify";
import { MobileBottomSheet } from "@/components/common/MobileBottomSheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";
const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

// Helper to ensure image src is a valid string URL
const getValidSrc = (src, fallback = "/images/product/1.jpg") => {
  if (typeof src === 'string' && src.trim() !== '') return src;
  if (src && typeof src === 'object' && src.url) return src.url;
  return fallback;
};

const formatPrice = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
};

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalQuantity, totalAmount, appliedCoupon } = useSelector((state) => state.cart);  
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isWishlistSheetOpen, setIsWishlistSheetOpen] = useState(false);
  const [movingToCartId, setMovingToCartId] = useState(null);
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

  const handleMoveToCart = async (item) => {
    setMovingToCartId(item.productId);
    try {
      // 1. Fetch full product details to find variants
      const res = await fetch(`/api/products/details?handle=${item.productHandle}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const { product } = await res.json();

      if (!product || !product.variants?.length) {
        throw new Error("Product variants not found");
      }

      // 2. Logic: In-store available first, then first in-stock, then default
      let selectedVariant = product.variants.find(v => v.metafields?.in_store_available === "true" || v.metafields?.in_store_available === true);
      
      if (!selectedVariant) {
        selectedVariant = product.variants.find(v => v.inStock);
      }
      
      if (!selectedVariant) {
        selectedVariant = product.variants[0];
      }

      // 3. Add to cart
      const cartProduct = {
        id: product.id || product.shopifyId,
        shopifyId: product.id || product.shopifyId,
        variantId: selectedVariant.id || selectedVariant.shopifyId,
        title: product.title,
        handle: product.handle,
        sku: selectedVariant.sku || "",
        quantity: 1,
        price: selectedVariant.price || product.price,
        image: getValidSrc(selectedVariant.image || product.image || item.image),
        variantTitle: selectedVariant.title,
        color: selectedVariant.color || product.color,
        karat: selectedVariant.karat || selectedVariant.purity || product.karat || product.purity || "",
        size: selectedVariant.size,
        inStock: Boolean(selectedVariant.inStock),
        
        // Technical pricing fields required for CartSummary and GTM
        goldPricePerGram: selectedVariant.price_breakup?.metal?.rate_per_gram || 0,
        goldWeight: selectedVariant.price_breakup?.metal?.weight || 0,
        goldPrice: selectedVariant.price_breakup?.metal?.cost || 0,
        makingCharges: selectedVariant.price_breakup?.making_charges?.final || 0,
        diamondCharges: selectedVariant.price_breakup?.diamond?.final || 0,
        gst: selectedVariant.price_breakup?.gst?.amount || 0,
        finalPrice: selectedVariant.price_breakup?.total || selectedVariant.price,
        diamondTotalPcs: selectedVariant.price_breakup?.diamond?.pcs || 0,
        shippingDate: "13/04/2026", // Mock or dynamic if available

        hasVideo: Boolean(product.media?.some((m) => m.type === "VIDEO" || m.type === "EXTERNAL_VIDEO")),
        hasSimilar: Boolean(product.handle),
        reviews: product.reviews || null,
        comparePrice: selectedVariant?.compare_price || product.compare_price || "",
        variantOptions: product.variants.map(v => ({
          variantId: v.id || v.shopifyId,
          size: v.size,
          price: v.price,
          inStock: v.inStock,
          variantTitle: v.title,
          sku: v.sku || ""
        }))
      };

      await dispatch(addToCart({ userId: user?.id, product: cartProduct })).unwrap();
      
      // 4. Remove from wishlist after moving
      if (isAuthenticated) {
        await dispatch(removeWishlistItem(item.productId)).unwrap();
      } else {
        dispatch(removeGuestWishlistItem(item.productId));
      }
      
      toast.success("Added to cart!");
      dispatch(openCart());
    } catch (err) {
      console.error("Move to cart failed", err);
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setMovingToCartId(null);
    }
  };

  const isMobile = useMediaQuery("(max-width: 1023px)");

  const WishlistContent = () => (
    <div className="space-y-6">
      {wishlistItems.map((item) => (
        <div key={item.productId} className="flex gap-4 group">
          <div className="w-24 h-24 bg-[#F9F9F9] rounded-lg border border-zinc-100 shrink-0 relative overflow-hidden">
            <Image
              src={getValidSrc(item.image)}
              alt={item.title}
              fill
              className="object-contain p-2 mix-blend-multiply"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-sm font-bold text-zinc-900 truncate font-abhaya">{item.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-zinc-900">₹{formatPrice(item.price)}</span>
              {item.comparePrice > item.price && (
                <span className="text-[11px] text-zinc-400 line-through">₹{formatPrice(item.comparePrice)}</span>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleMoveToCart(item)}
                disabled={movingToCartId === item.productId}
                className="w-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {movingToCartId === item.productId ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Plus size={12} />
                )}
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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

              {/* Add from Wishlist Row */}
              {wishlistItems.length > 0 && (
                <div className="mt-8 border-t border-zinc-100 pt-8">
                  {isMobile ? (
                    <>
                      <button 
                        onClick={() => setIsWishlistSheetOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-[#FDF8F6] rounded-xl group transition-all hover:bg-[#FBECE7] border border-[#F5E1DA]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                            <Heart size={20} className="fill-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Add product from wishlist</p>
                            <p className="text-[11px] text-zinc-500 font-medium">Browse your saved items and add them to cart</p>
                          </div>
                        </div>
                        <Plus size={20} className="text-zinc-400 group-hover:text-primary transition-colors" />
                      </button>
                      <MobileBottomSheet
                        isOpen={isWishlistSheetOpen}
                        onClose={() => setIsWishlistSheetOpen(false)}
                        title="My Wishlist"
                      >
                        <WishlistContent />
                      </MobileBottomSheet>
                    </>
                  ) : (
                    <Sheet open={isWishlistSheetOpen} onOpenChange={setIsWishlistSheetOpen}>
                      <SheetTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 bg-[#FDF8F6] rounded-xl group transition-all hover:bg-[#FBECE7] border border-[#F5E1DA]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                              <Heart size={20} className="fill-primary" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Add product from wishlist</p>
                              <p className="text-[11px] text-zinc-500 font-medium">Browse your saved items and add them to cart</p>
                            </div>
                          </div>
                          <Plus size={20} className="text-zinc-400 group-hover:text-primary transition-colors" />
                        </button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md p-0 border-none flex flex-col h-full bg-white">
                        <SheetHeader className="p-6 border-b border-zinc-100 shrink-0">
                          <SheetTitle className="text-xl font-abhaya font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                            <Heart size={20} className="fill-primary text-primary" />
                            My Wishlist
                          </SheetTitle>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                          <WishlistContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              )}
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
