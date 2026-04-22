"use client";

import Image from "next/image";
import Link from "next/link";
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

  const wishlistIds = useMemo(
    () => wishlistItems.map((i) => i.productId),
    [wishlistItems]
  );

  if (!item) return null;

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
      // 1. Prepare GTM Data
      const getNumericId = (gid) => {
        if (!gid) return 0;
        if (typeof gid === 'number') return gid;
        const match = String(gid).match(/\d+$/);
        return match ? Number(match[0]) : 0;
      };

      const lowerTitle = (item.title || "").toLowerCase();
      let categoryFallback = item.type || (
        lowerTitle.includes("ring") ? "Rings" : 
        (lowerTitle.includes("earring") || lowerTitle.includes("bali")) ? "Earrings" : 
        lowerTitle.includes("pendant") ? "Pendants" : 
        lowerTitle.includes("bracelet") ? "Bracelets" : ""
      );

      pushRemoveFromCart({
        productId: String(getNumericId(item.productId || item.shopifyId || item.id)),
        sku: item.sku || "",
        variantId: String(getNumericId(item.variantId)),
        productName: item.title,
        productType: categoryFallback,
        category: categoryFallback,
        sub_category: item.variantTitle || "",
        price: Number(item.comparePrice || item.price || 0),
        offerPrice: Number(item.price || 0),
        quantity: item.quantity,
        thumbnail_image: item.image
      });

      // 2. Perform Removal

      await dispatch(removeFromCart({ userId: user?.id, variantId: item.variantId })).unwrap();
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

      // 2. Push to GTM
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
      pushAddToWishlist({
        productName: item.title,
        product_url: `${currentOrigin}/products/${item.handle}?variant=${item.variantId}`,
        price: Number(item.comparePrice || item.price || 0),
        offer_price: Number(item.price || 0),
        thumbnail_image: item.image || "",
        currency: "INR"
      });

      
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
        payload.sku = selectedVariant.sku || "";
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

  const productLink = item.handle ? `/products/${item.handle}${item.variantId ? `?variant=${item.variantId}` : ""}` : "#";

  return (
    <div className="mb-6 overflow-hidden rounded-sm border border-zinc-100 bg-white shadow-sm">
      <div className="relative flex flex-col gap-6 p-4 md:flex-row md:p-6">
        {updating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}

        <Link 
          href={productLink}
          className="aspect-square w-full shrink-0 overflow-hidden rounded-sm border border-zinc-100/50 bg-zinc-50 md:w-48 block transition-opacity hover:opacity-90"
        >
          <Image
            src={item.image || "/images/product/1.jpg"}
            alt={item.title}
            width={200}
            height={200}
            className="h-full w-full object-contain mix-blend-multiply"
          />
        </Link>

        <div className="grow space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link href={productLink}>
                <h3 className="font-abhaya text-lg font-bold text-zinc-800 hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </Link>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                SKU: {currentVariant.sku || item.sku || "N/A"}
              </p>
              {item.engraving && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Engraving: &quot;{item.engraving}&quot;
                </p>
              )}
            </div>
            <div className="flex flex-col items-end whitespace-nowrap">
              <div className="text-xl font-bold text-zinc-900">
                ₹ {lineAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              {hasDiscount && (
                <div className="text-sm text-zinc-400 line-through">
                  ₹ {lineCompareAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
              )}
            </div>
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
