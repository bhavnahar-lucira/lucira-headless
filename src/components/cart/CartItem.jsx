"use client";

import Image from "next/image";
import { Trash2, Heart, BadgePercent, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateCartItem } from "@/redux/features/cart/cartSlice";
import { 
  addWishlistItem, 
  addGuestWishlistItem,
  removeWishlistItem,
  removeGuestWishlistItem
} from "@/redux/features/wishlist/wishlistSlice";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { pushRemoveFromCart, pushAddToWishlist } from "@/lib/gtm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CartItem({ item, onAuthRequired }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [movingToWishlist, setMovingToWishlist] = useState(false);

  if (!item) return null;

  const wishlistIds = useMemo(
    () => wishlistItems.map((i) => i.productId),
    [wishlistItems]
  );

  const productId = item.id || item.productId || item.handle;
  const isWishlisted = productId ? wishlistIds.includes(productId) : false;

  const variantOptions = Array.isArray(item.variantOptions) ? item.variantOptions : [];
  const currentVariant =
    variantOptions.find((variant) => variant.variantId === item.variantId) ||
    variantOptions.find((variant) => String(variant.size) === String(item.size));
  const isInStock = currentVariant?.inStock ?? item.inStock ?? true;
  const canEditSelection = !isInStock;
  const lineAmount = (item.price || 0) * (item.quantity || 1);
  const lineCompareAmount = (item.comparePrice || 0) * (item.quantity || 1);
  const hasDiscount = lineCompareAmount > lineAmount;

  const statusLabel = isInStock ? "In Stock" : "Made to Order";
  const statusClass = isInStock ? "text-green-500" : "text-primary";
  const sizeOptions =
    variantOptions.length > 0
      ? variantOptions
      : (item.availableSizes || [item.size]).map((size) => ({ size }));

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await dispatch(removeFromCart({ userId: user?.id, variantId: item.variantId })).unwrap();
      
      pushRemoveFromCart({
        id: item.shopifyId || item.id,
        name: item.title,
        price: item.price,
        brand: "Lucira",
        category: "",
        variant: item.variantId,
        quantity: item.quantity
      });
      
      toast.success("Removed from cart");
    } catch (err) {
      console.error("Remove failed:", err);
      toast.error("Failed to remove item");
    } finally {
      setRemoving(false);
    }
  };

  const handleMoveToWishlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to move items to wishlist");
      onAuthRequired?.();
      return;
    }

    setMovingToWishlist(true);
    try {
      // 1. Add to wishlist if not already there (updates MongoDB because user is logged in)
      if (!isWishlisted) {
        const payload = {
          productId: productId,
          productHandle: item.handle || "",
          title: item.title,
          image: item.image || "",
          price: item.price,
          comparePrice: item.comparePrice || "",
          reviews: item.reviews || null,
          hasVideo: Boolean(item.hasVideo),
          hasSimilar: Boolean(item.handle),
        };

        await dispatch(addWishlistItem(payload)).unwrap();
      }
      
      // 2. Remove from cart (updates MongoDB/Session)
      await dispatch(removeFromCart({ userId: user?.id, variantId: item.variantId })).unwrap();
      
      toast.success("Moved to wishlist");
    } catch (err) {
      console.error("Move to wishlist failed:", err);
      toast.error(err.message || "Failed to move to wishlist");
    } finally {
      setMovingToWishlist(false);
    }
  };

  const handleUpdate = async (type, value) => {
    setUpdating(true);
    try {
      const payload = {
        userId: user?.id,
        currentVariantId: item.variantId,
      };

      if (type === "size") {
        const selectedVariant = variantOptions.find(
          (variant) => String(variant.size) === String(value)
        );

        if (!selectedVariant) {
          throw new Error("Selected size is unavailable");
        }

        payload.nextVariantId = selectedVariant.variantId;
        payload.size = selectedVariant.size;
        payload.price = selectedVariant.price;
        payload.variantTitle = selectedVariant.variantTitle;
        payload.inStock = selectedVariant.inStock;
      } else {
        payload.quantity = parseInt(value, 10);
      }

      await dispatch(updateCartItem(payload)).unwrap();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-sm border border-zinc-100 bg-white shadow-sm">
      <div className="relative flex flex-col gap-6 p-4 md:flex-row md:p-6">
        {updating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}

        <div className="aspect-square w-full shrink-0 overflow-hidden rounded-sm border border-zinc-100/50 bg-zinc-50 md:w-48">
          <Image
            src={item.image || "/images/product/1.jpg"}
            alt={item.title}
            width={200}
            height={200}
            className="h-full w-full object-contain mix-blend-multiply"
          />
        </div>

        <div className="grow space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-abhaya text-lg font-bold text-zinc-800">{item.title}</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Variant: {item.variantTitle}
              </p>
              {item.engraving && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Engraving: &quot;{item.engraving}&quot;
                </p>
              )}
            </div>
            <div className="flex flex-col items-end whitespace-nowrap">
              <div className="text-xl font-bold text-zinc-900">
                ₹ {lineAmount.toLocaleString("en-IN")}
              </div>
              {hasDiscount && (
                <div className="text-sm text-zinc-400 line-through">
                  ₹ {lineCompareAmount.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-sm border border-pink-100/30 bg-pink-50/50 p-2">
            <div className="rounded-full bg-transparent p-0.5">
              <BadgePercent size={14} className="text-green-800" />
            </div>
            <span className="text-xs font-bold text-green-800">Complimentary Gift Included</span>
          </div>

          <div className="grid grid-cols-1 divide-y rounded-sm border border-zinc-100 md:grid-cols-[1.2fr_2fr] md:divide-x md:divide-y-0 divide-zinc-100">
            <div className={`grid ${item.size ? "grid-cols-2" : "grid-cols-1"} divide-x divide-zinc-100 bg-zinc-50/30`}>
              {item.size && (
                <div className="flex flex-col justify-center p-2">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                    Ring Size
                  </span>
                  <Select
                    value={String(item.size)}
                    onValueChange={(val) => handleUpdate("size", val)}
                    disabled={!canEditSelection || updating}
                  >
                    <SelectTrigger className="h-6 border-none bg-transparent p-0 text-xs font-bold text-zinc-800 shadow-none focus:ring-0">
                      <SelectValue placeholder={item.size} />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map((variant) => (
                        <SelectItem key={variant.variantId || variant.size} value={String(variant.size)}>
                          {variant.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col justify-center p-2">
                <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                  Quantity
                </span>
                <Select
                  value={String(item.quantity)}
                  onValueChange={(val) => handleUpdate("quantity", val)}
                  disabled={!canEditSelection || updating}
                >
                  <SelectTrigger className="h-6 border-none bg-transparent p-0 text-xs font-bold text-zinc-800 shadow-none focus:ring-0">
                    <SelectValue placeholder={item.quantity} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              <div className="grid grid-cols-[80px_1fr] items-center p-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                  Metal
                </span>
                <span className="text-xs font-medium text-zinc-800">
                  {item.karat} {item.color}
                </span>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center p-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                  Status
                </span>
                <span className={`text-xs font-bold uppercase ${statusClass}`}>{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex divide-x divide-zinc-100 border-t border-zinc-100 bg-white">
        <button
          onClick={handleRemove}
          disabled={removing}
          className="flex flex-1 items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-50 hover:text-red-500 disabled:opacity-50"
        >
          {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Remove
        </button>
        <button
          onClick={handleMoveToWishlist}
          disabled={movingToWishlist}
          className="flex flex-1 items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-50 hover:text-primary disabled:opacity-50"
        >
          {movingToWishlist ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
          Move to Wishlist
        </button>
      </div>
    </div>
  );
}
