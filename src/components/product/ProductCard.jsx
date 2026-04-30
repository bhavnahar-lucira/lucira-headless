"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import LazyImage from "../common/LazyImage";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ArrowRight, Copy, X, Loader2, Play, ShieldCheck, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  addWishlistItem,
  removeWishlistItem,
  addGuestWishlistItem,
  removeGuestWishlistItem,
} from "@/redux/features/wishlist/wishlistSlice";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { pushProductClick, pushAddToWishlist, pushRemoveFromWishlist, formatGtmPrice } from "@/lib/gtm";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const colorMap = {
  yellow: "#E2C07E",
  rose: "#E9B4AB",
  white: "#E5E4E2",
};

const parseOrnaverseComponent = (val) => {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};

// Force en-IN formatting to be consistent across environments
const formatPrice = (num) => {
  if (num === null || num === undefined) return "0";
  const val = Math.round(Number(num));
  return new Intl.NumberFormat("en-IN", { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(val);
};

function getBaseColor(color = "") {
  const normalized = String(color).toLowerCase();
  if (normalized.includes("rose")) return "rose";
  if (normalized.includes("white") || normalized.includes("silver") || normalized.includes("platinum")) return "white";
  if (normalized.includes("yellow") || normalized.includes("gold")) return "yellow";
  return "white";
}

function getUniqueBaseColors(colors = []) {
  const order = ["white", "yellow", "rose"];
  const availableBaseColors = new Set();
  colors.forEach((color) => {
    const base = getBaseColor(color);
    if (base) availableBaseColors.add(base);
  });
  return order.filter((color) => availableBaseColors.has(color));
}

function getVariantForBase(product, selectedBase) {
  // 1. Prefer in-stock variant for the selected base
  const inStockVariant = product?.variants?.find(
    (v) => (v.inStock === true || v.inStock === "true") && getBaseColor(v.color || v.title) === selectedBase
  );
  if (inStockVariant) return inStockVariant;

  // 2. Fallback to any variant for the selected base
  return (
    product?.variants?.find((variant) => getBaseColor(variant.color || variant.title) === selectedBase) ||
    product?.variants?.[0] ||
    null
  );
}

function getImagesForBase(product, selectedBase) {
  const variant = getVariantForBase(product, selectedBase);
  const baseMatches = selectedBase
    ? product.images?.filter((image) => String(image.alt || "").toLowerCase().includes(selectedBase))
    : [];

  // If we have specific matches for this color base, use them exclusively
  if (baseMatches?.length > 0) return baseMatches;

  if (variant?.image) {
    const variantImageMatches = product.images?.filter((image) => image.url === variant.image);
    if (variantImageMatches?.length > 0) return variantImageMatches;

    // Fallback if image URL is not in the list but we have the URL
    return [{ url: variant.image, alt: variant.color || product.title }];
  }

  if (!product?.images?.length) {
    const fallbackImage = product?.image || null;
    return fallbackImage ? [{ url: fallbackImage, alt: product?.title || "Product image" }] : [];
  }

  const variantColor = String(variant?.color || variant?.title || "").toLowerCase();

  if (variantColor) {
    const exactMatches = product.images.filter((image) => String(image.alt || "").toLowerCase().includes(variantColor));
    if (exactMatches.length > 0) return exactMatches;
  }

  if (baseMatches.length > 0) return baseMatches;

  return product.images;
}

function getPrioritizedVariant(product, collectionHandle) {
  if (!product?.variants || product.variants.length === 0) return null;

  const variants = product.variants;
  // Handle both boolean and string stock status + check quantity fields as fallback
  const inStockVariants = variants.filter(v => 
    v.inStock === true || 
    v.inStock === "true" || 
    (v.inventory_quantity !== undefined && v.inventory_quantity > 0) ||
    (v.inventoryQuantity !== undefined && v.inventoryQuantity > 0)
  );

  // 1. Exception Logic (Promote 9KT) - Only for 9kt-collection
  if (collectionHandle === "9kt-collection") {
    const nineKT = variants.filter(v => String(v.color || v.title).includes("9KT"));
    if (nineKT.length > 0) {
      const inStock9KT = nineKT.find(v => 
        v.inStock === true || 
        v.inStock === "true" ||
        (v.inventory_quantity !== undefined && v.inventory_quantity > 0)
      );
      if (inStock9KT) return inStock9KT;
      return nineKT[0];
    }
  }

  // 2. Primary Logic: Find first in-stock variant (Matches Product Page logic)
  if (inStockVariants.length > 0) {
    const type = String(product.type || "").toLowerCase();
    if (type.includes("ring")) {
      // For Rings, we still try to prioritize Yellow Gold IF it's in stock, 
      // but otherwise we take the very first in-stock item found (like Rose Gold).
      const ygInStock = inStockVariants.find(v => String(v.color || v.title).includes("Yellow Gold"));
      if (ygInStock) return ygInStock;
    }
    return inStockVariants[0];
  }

  // 3. Fallback: First variant
  return variants[0];
}

const ProductCard = ({ product, fixedPrice, fixedComparePrice, collectionHandle }) => {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const baseColors = getUniqueBaseColors(product.colors || product.variants?.map((v) => v.color) || []);
  
  // Apply Global Variant Priority Hierarchy
  const prioritizedVariant = useMemo(() => getPrioritizedVariant(product, collectionHandle), [product, collectionHandle]);
  
  const initialBase = useMemo(() => {
    if (product.selectedColor) return getBaseColor(product.selectedColor);
    if (prioritizedVariant) return getBaseColor(prioritizedVariant.color || prioritizedVariant.title);
    return getBaseColor(baseColors[0] || "white");
  }, [product.selectedColor, prioritizedVariant, baseColors]);

  const [activeBase, setActiveBase] = useState(initialBase);

  // Synchronize activeBase when prioritizedVariant changes
  useEffect(() => {
    setActiveBase(initialBase);
  }, [initialBase]);

  const [loadedImages, setLoadedImages] = useState({});

  // Reset loaded images when color base changes to show loader for new images
  useEffect(() => {
    setLoadedImages({});
  }, [activeBase]);

  const [showSimilar, setShowSimilar] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistIds = useMemo(
    () => (wishlistItems || []).map((item) => item.productId),
    [wishlistItems]
  );

  const productId = product.shopifyId || product.id || product.handle;
  const productHandle = product.handle || "";
  const isWishlisted = productId ? wishlistIds.includes(productId) : false;

  const currentVariant = getVariantForBase(product, activeBase);

  // Requirement: Lock price to the prioritized (in-stock) variant. 
  // Clicking swatches should only change images, not the price.
  const displayPrice = fixedPrice ?? (prioritizedVariant?.price ?? product.price);
  const displayComparePrice = fixedComparePrice ?? (prioritizedVariant?.compare_price ?? prioritizedVariant?.compareAtPrice ?? product.compare_price ?? product.compareAtPrice);

   const hasDiscount = displayPrice > 0 && displayPrice < displayComparePrice;
    const discountPercent = hasDiscount
      ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
      : 0;


  const videoMedia = product.media?.find(m => m.type === "VIDEO" || m.type === "EXTERNAL_VIDEO");

  // Derive up to 2 labels from tags with priority
  const displayLabels = useMemo(() => {
    const labels = [];
    if (product.label) labels.push(product.label);
    
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const lowerTags = tags.map(t => String(t).toLowerCase());
    
    // Priority order: Fast Shipping > Best Seller > New Arrival > Trending
    if (lowerTags.some(t => t.includes("fast shipping") || t.includes("fastshipping"))) labels.push("Fast Shipping");
    if (lowerTags.some(t => t.includes("best seller"))) labels.push("Best Seller");
    if (lowerTags.some(t => t.includes("new arrival") || t === "new")) labels.push("New Arrival");
    if (lowerTags.some(t => t.includes("trending"))) labels.push("Trending");
    
    return [...new Set(labels)].slice(0, 2);
  }, [product.label, product.tags]);

  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);

  useEffect(() => {
    if (displayLabels.length > 1) {
      const interval = setInterval(() => {
        setCurrentLabelIndex((prev) => (prev + 1) % 2);
      }, 4000); // Slightly longer duration for better visibility
      return () => clearInterval(interval);
    } else {
      setCurrentLabelIndex(0);
    }
  }, [displayLabels.length]);

  // Reset index if labels change (e.g. during client-side navigation)
  useEffect(() => {
    setCurrentLabelIndex(0);
  }, [displayLabels]);

  const galleryImages = getImagesForBase(product, activeBase);
  const swiperId = `card-swiper-${String(product.shopifyId || product.id || product.handle).replace(/[^a-zA-Z0-9]/g, "")}`;
  const swiperRef = useRef(null);
  const prevImageBtnRef = useRef(null);
  const nextImageBtnRef = useRef(null);

  const hasSimilar = (product.matchingProductIds && product.matchingProductIds.length > 0) || product.hasSimilar;

  const handleBeforeInit = (swiper) => {
    if (galleryImages.length <= 1 || !swiper.params.navigation) return;
    if (prevImageBtnRef.current) swiper.params.navigation.prevEl = prevImageBtnRef.current;
    if (nextImageBtnRef.current) swiper.params.navigation.nextEl = nextImageBtnRef.current;
  };

  useEffect(() => {
    if (!swiperRef.current) return;
    if (galleryImages.length <= 1) return;
    if (!prevImageBtnRef.current || !nextImageBtnRef.current) return;

    const swiper = swiperRef.current;
    if (!swiper.params.navigation) return;

    swiper.params.navigation.prevEl = prevImageBtnRef.current;
    swiper.params.navigation.nextEl = nextImageBtnRef.current;

    if (swiper.navigation && swiper.navigation.update) {
      swiper.navigation.update();
    }
  }, [galleryImages.length]);

  const fetchSimilar = async () => {
    if (similarProducts.length > 0) {
      setShowSimilar(true);
      return;
    }
    
    setLoadingSimilar(true);
    setShowSimilar(true);
    try {
      const res = await fetch(`/api/products/similar?handle=${product.handle}`);
      const data = await res.json();
      setSimilarProducts(data.products || []);
    } catch (e) {
      console.error("Failed to fetch similar products", e);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (showSimilar || showVideoPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showSimilar, showVideoPopup]);

  return (
    <>
      <div className="space-y-4">
        <div className="group/card block space-y-4">
          <div className="relative aspect-square w-full bg-[#fafafa] overflow-hidden">
              <Link 
                href={`/products/${product.handle}`} 
                className="block w-full h-full mix-blend-multiply"
                onClick={() => {
                  const getNumericId = (gid) => {
                    if (!gid) return 0;
                    if (typeof gid === 'number') return gid;
                    const match = String(gid).match(/\d+$/);
                    return match ? Number(match[0]) : 0;
                  };
                  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
                  pushProductClick({
                    productId: String(getNumericId(product.shopifyId || product.id)),
                    variantId: String(getNumericId(currentVariant?.id || currentVariant?.shopifyId)),
                    sku: currentVariant?.sku || "",
                    productName: product.title,
                    productType: product.type || "",
                    productCategory: product.category || product.type || "",
                    category: product.category || product.type || "",
                    subCategory: product.type || "",
                    productUrl: `${currentOrigin}/products/${product.handle}`,
                    thumbnailImage: galleryImages?.[0]?.url || product.image?.url || "",
                    purity: currentVariant?.metafields?.metal_purity || "",
                    price: String(Number(displayComparePrice || displayPrice || 0)),
                    offerPrice: String(Number(displayPrice || 0)),
                    indexPosition: ""
                  });
                }}
              >

              {galleryImages.length > 0 ? (
                <Swiper
                  spaceBetween={0}
                  loop={galleryImages.length > 1}
                  slidesPerView={1}
                  modules={[Navigation, Pagination]}
                  pagination={galleryImages.length > 1 ? {
                    type: 'progressbar',
                    el: `.pagination-${swiperId}`
                  } : false}
                  navigation={galleryImages.length > 1 ? {
                    prevEl: prevImageBtnRef.current,
                    nextEl: nextImageBtnRef.current,
                  } : false}
                  onBeforeInit={handleBeforeInit}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    if (galleryImages.length > 1 && prevImageBtnRef.current && nextImageBtnRef.current && swiper.params.navigation) {
                      swiper.params.navigation.prevEl = prevImageBtnRef.current;
                      swiper.params.navigation.nextEl = nextImageBtnRef.current;
                      if (swiper.navigation && swiper.navigation.update) {
                        swiper.navigation.update();
                      }
                    }
                  }}
                  observer={true}
                  observeParents={true}
                  className="w-full h-full custom-product-swiper"
                >
                  {galleryImages.map((image, index) => (
                    <SwiperSlide key={`${image.url}-${index}`}>
                      <div className="relative w-full h-full">
                        <LazyImage
                          src={image.url}
                          alt={image.alt || `${product.title}${activeBase ? ` - ${activeBase}` : ""}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                          className={`object-contain p-0 grayscale-[0.2] group-hover/card:grayscale-0 transition-all duration-300`}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                  {galleryImages.length > 1 && (
                    <div className={`pagination-${swiperId} swiper-pagination bottom-0! lg:!hidden`} />
                  )}
                </Swiper>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
              )}
            </Link>

            {/* Video Play Button */}
            {videoMedia && (
              <button 
                onClick={(e) => { e.preventDefault(); setShowVideoPopup(true); }}
                className="absolute bottom-4 left-2 lg:left-4 z-10 w-7 h-7 lg:w-9 lg:h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-900 shadow-sm hover:bg-black hover:text-white transition-all duration-300"
              >
                <Play fill="currentColor" className="w-3 lg:w-4" />
              </button>
            )}

             {/* Wishlist Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();

                const handleWishlistToggle = async () => {
                  setIsWishlistAnimating(true);
                  try {
                    if (isWishlisted) {
                      if (user?.id) {
                        await dispatch(removeWishlistItem(productId)).unwrap();
                      } else {
                        dispatch(removeGuestWishlistItem(productId));
                      }
                      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
                      pushRemoveFromWishlist({
                        productName: product.title,
                        product_url: `${currentOrigin}/products/${product.handle}?variant=${currentVariant?.id || currentVariant?.shopifyId}`,
                        price: Number(displayComparePrice || displayPrice || 0),
                        offer_price: Number(displayPrice || 0),
                        thumbnail_image: galleryImages?.[0]?.url || product.image?.url || "",
                        currency: "INR"
                      });
                      toast.success("Removed from wishlist");
                    } else {
                      const payload = {
                        productId,
                        productHandle,
                        title: product.title,
                        image: galleryImages?.[0]?.url || product.image?.url || "",
                        price: displayPrice,
                        comparePrice: displayComparePrice || "",
                        reviews: product.reviews || null,
                        hasVideo: Boolean(videoMedia),
                        hasSimilar: Boolean(product.handle),
                      };

                      if (user?.id) {
                        await dispatch(addWishlistItem(payload)).unwrap();
                      } else {
                        dispatch(addGuestWishlistItem(payload));
                      }
                      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
                      pushAddToWishlist({
                        productName: product.title,
                        product_url: `${currentOrigin}/products/${product.handle}?variant=${currentVariant?.id || currentVariant?.shopifyId}`,
                        price: Number(displayComparePrice || displayPrice || 0),
                        offer_price: Number(displayPrice || 0),
                        thumbnail_image: galleryImages?.[0]?.url || product.image?.url || "",
                        currency: "INR"
                      });
                      toast.success("Saved to wishlist");
                    }
                  } catch (err) {
                    toast.error(err.message || "Wishlist update failed");
                  } finally {
                    setTimeout(() => setIsWishlistAnimating(false), 250);
                  }
                };

                handleWishlistToggle();
              }}
              className={`absolute top-0 right-1 lg:top-2 lg:right-4 z-10 px-1.5 py-1 lg:p-1.5 transition-transform duration-200 ${isWishlistAnimating ? "scale-110" : ""}`}
            >
              <Heart
                fill={isWishlisted ? "currentColor" : "none"}
                className={`${isWishlisted ? "text-rose-500 w-5 lg:w-6" : "text-black"} stroke-[1.5px] w-5 lg:w-6`}
              />
            </button>

            {/* Product Labels (with Seamless Vertical Slide) */}
            {displayLabels.length > 0 && (
              <div className="absolute top-0 lg:top-3 left-0 z-10 w-24 lg:w-28 h-6 lg:h-7 overflow-hidden bg-[#E2C07E]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={displayLabels[currentLabelIndex]}
                    initial={{ y: 28 }}
                    animate={{ y: 0 }}
                    exit={{ y: -28 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 text-black text-[10px] font-bold px-1 lg:px-2 font-figtree uppercase tracking-wider flex items-center justify-center whitespace-nowrap"
                  >
                    {displayLabels[currentLabelIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* View Similar Button */}
            {hasSimilar && (
              <Drawer open={showSimilar} onOpenChange={setShowSimilar}>
                <DrawerTrigger asChild>
                  <button 
                    onClick={(e) => { e.preventDefault(); fetchSimilar(); }}
                    className="absolute bottom-4 right-2 lg:right-4 z-10 w-7 h-7 lg:w-9 lg:h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-900 shadow-sm hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <Copy className="w-3 lg:w-4" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] h-[90vh] bg-white rounded-t-[20px] flex flex-col">
                  <div className="mx-auto w-full flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="px-10 py-6 flex flex-row items-center justify-between border-b border-zinc-100 !text-left !flex-row shrink-0">
                      <DrawerTitle className="text-xl font-medium text-black uppercase">VIEW SIMILAR</DrawerTitle>
                      <DrawerClose asChild>
                        <button className="text-zinc-400 hover:text-black transition-colors hover:cursor-pointer p-1">
                          <X size={22} strokeWidth={1.5} />
                        </button>
                      </DrawerClose>
                    </DrawerHeader>
                    
                    <div className="sm:px-10 sm:py-10 px-5 py-5 overflow-y-auto flex-1">
                      {loadingSimilar ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                          <Loader2 className="animate-spin text-zinc-400" size={40} />
                          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Searching matching designs...</p>
                        </div>
                      ) : similarProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-x-8 gap-x-4 sm:gap-y-12 gap-y-6 pb-10">
                          {similarProducts.slice(0, 10).map((item) => {
                            const itemId = item.shopifyId || item.id;
                            return (
                              <div key={itemId} className="space-y-4">
                                <Link href={`/products/${item.handle}`} onClick={() => setShowSimilar(false)} className="block space-y-4 group">
                                  <div className="aspect-square relative rounded-md bg-[#F9F9F9] overflow-hidden transition-all duration-300 group-hover:bg-[#f3f3f3]">
                                    <LazyImage
                                      src={item.image}
                                      alt={item.title}
                                      fill
                                      className={`object-contain p-4 mix-blend-multiply transition-all duration-500 group-hover:scale-105`}
                                    />
                                  </div>
                                <div className="space-y-2 px-0">
                                  <h4 className="text-[13px] font-normal text-zinc-900 line-clamp-1 leading-relaxed tracking-tight">{item.title}</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[14px] font-bold text-black tracking-tight">₹{formatPrice(item.price)}</p>
                                      {(item.compare_price || item.compareAtPrice) > item.price && (
                                        <p className="text-[12px] text-zinc-400 line-through font-medium">₹{formatPrice(item.compare_price || item.compareAtPrice)}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 group/link">
                                      <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-200 pb-0.5 group-hover/link:border-black transition-colors">
                                        VIEW DETAILS
                                      </span>
                                      <ChevronRight size={10} className="text-zinc-900" />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 w-full">
                          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                            <Copy className="text-zinc-300" size={30} />
                          </div>
                          <p className="font-bold text-zinc-500 uppercase tracking-widest text-sm">No similar items found for this design.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  ref={prevImageBtnRef}
                  type="button"
                  aria-label="Previous image"
                  className={`custom-prev-${swiperId} absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 text-black shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  ref={nextImageBtnRef}
                  type="button"
                  aria-label="Next image"
                  className={`custom-next-${swiperId} absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 text-black shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity`}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex flex-row items-center justify-between gap-2">
              {/* Color Swatches */}
              {baseColors.length > 0 && (
                  <div className="flex gap-3">
                    {baseColors.map((base) => {
                      const isActive = base === activeBase;
                      return (
                        <button
                          key={`${product.shopifyId}-${base}`}
                          type="button"
                          title={base}
                          aria-label={`Show ${base} color`}
                          onClick={() => setActiveBase(base)}
                          className={`w-5 h-5 lg:w-7 lg:h-7 rounded-full border transition-all flex items-center justify-center hover:scale-110 ${
                            isActive ? "border-black" : "border-transparent"
                          }`}
                        >
                          <span
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: colorMap[base] }}
                          />
                        </button>
                      );
                    })}
                  </div>
              )}

              {/* Rating Section */}
              {((product.reviews?.count || product.reviewStats?.count) > 0) && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {isMobile ? (
                      <Star size={12} fill="currentColor" />
                    ) : (
                      [...Array(5)].map((_, i) => {
                        const average = product.reviews?.average || product.reviewStats?.average || 0;
                        return (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.floor(average) ? "currentColor" : "none"}
                            className={i < Math.floor(average) ? "" : "text-zinc-200 dark:text-zinc-800"}
                          />
                        );
                      })
                    )}
                  </div>
                  <span className="text-sm font-semibold text-black mt-0.5">({product.reviews?.count || product.reviewStats?.count})</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 font-figtree">
              <p className="text-base lg:text-xl font-bold">₹{formatPrice(displayPrice)}</p>
              {displayComparePrice > displayPrice && (
                <p className="text-[14px] lg:text-base text-gray-400 line-through">₹{formatPrice(displayComparePrice)}</p>
              )}
              {displayComparePrice > displayPrice && discountPercent > 0 && (
                <span className="hidden lg:inline-block bg-[#F2F2F2] text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="flex flex-col items-start gap-0.5">
              {/* Product Title */}
              <Link 
                href={`/products/${product.handle}`}
                onClick={() => {
                  const getNumericId = (gid) => {
                    if (!gid) return 0;
                    if (typeof gid === 'number') return gid;
                    const match = String(gid).match(/\d+$/);
                    return match ? Number(match[0]) : 0;
                  };
                  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
                  pushProductClick({
                    productId: String(getNumericId(product.shopifyId || product.id)),
                    variantId: String(getNumericId(currentVariant?.id || currentVariant?.shopifyId)),
                    sku: currentVariant?.sku || "",
                    productName: product.title,
                    productType: product.type || "",
                    productCategory: product.category || product.type || "",
                    category: product.category || product.type || "",
                    subCategory: product.type || "",
                    productUrl: `${currentOrigin}/products/${product.handle}`,
                    thumbnailImage: galleryImages?.[0]?.url || product.image?.url || "",
                    purity: currentVariant?.metafields?.metal_purity || "",
                    price: String(Number(displayComparePrice || displayPrice || 0)),
                    offerPrice: String(Number(displayPrice || 0)),
                    indexPosition: ""
                  });
                }}
              >

                <h3 className="text-sm font-figtree font-semibold hover:underline underline-offset-4 decoration-1 leading-snug hover:text-gray-700 transition-colors line-clamp-1 min-h-5">
                  {product.title}
                </h3>
              </Link>

              {/* dynamic card details based on product/variant metafields */}
              <div className="flex flex-col justify-center items-start gap-2">
                {(() => {
                  const variantMeta = prioritizedVariant?.metafields;
                  const prodMeta = product.productMetafields;
                  const ornaverseComp = parseOrnaverseComponent(variantMeta?.components || prodMeta?.components);

                  // Find the first diamond component for summary display
                  const firstDiamond = ornaverseComp?.components?.find(c => 
                    (c.item_group_name === "Diamond" || (c.quality_code && c.quality_code !== "NA")) && (parseFloat(c.weight) > 0 || parseInt(c.pieces) > 0)
                  );

                  const variantDiamonds = variantMeta?.diamonds?.filter(d => parseFloat(d.weight) > 0 || parseInt(d.pieces) > 0) || [];
                  const isDiamondProduct = !!firstDiamond || variantDiamonds.length > 0;

                  const parts = [];

                  if (isDiamondProduct) {
                    // 1. Diamond Quality
                    const quality = (firstDiamond?.quality_code && firstDiamond?.stone_color_code && firstDiamond.quality_code !== "NA" && firstDiamond.stone_color_code !== "NA")
                      ? `${firstDiamond.quality_code}, ${firstDiamond.stone_color_code}`
                      : (firstDiamond?.purity || variantDiamonds[0]?.quality || prodMeta?.quality);

                    // 2. Diamond Carat
                    const carat = variantDiamonds[0]?.weight 
                      ? `${variantDiamonds[0].weight}ct` 
                      : (firstDiamond?.weight ? `${firstDiamond.weight}ct` : prodMeta?.carat_range);

                    if (quality && quality !== "NA") parts.push(quality);
                    if (carat && carat !== "NA" && !carat.startsWith("0ct")) parts.push(carat);
                  }

                  // If no diamond parts were added, or it's not a diamond product, show metal purity
                  if (parts.length === 0) {
                    const metalPurity = variantMeta?.metal_purity || (prioritizedVariant?.color?.split(" ")[0]);
                    if (metalPurity) parts.push(metalPurity);
                  }

                  // 3. Metal Weight
                  const weightVal = variantMeta?.metal_weight || prodMeta?.weight;                  const weight = weightVal ? `${weightVal}${String(weightVal).toLowerCase().includes('g') ? '' : 'g'}` : null;
                  if (weight) parts.push(weight);

                  if (parts.length === 0) return null;

                  return (
                    <p className="font-figtree text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-tight">
                      {parts.join(" · ")}
                    </p>
                  );
                })()}
              </div>
              {/* end */}
            </div>

            {/* Offer Badge - Dynamic Flipping */}
            {(() => {
              const offers = [];
              if (product.diamondDiscount > 0) offers.push(`${product.diamondDiscount}% OFF on Diamonds`);
              if (product.makingDiscount > 0) offers.push(`${product.makingDiscount}% OFF on Making Charges`);
              
              if (offers.length === 0) return null;

              return (
                <div className="inline-flex items-center gap-1.5 text-[#108548] bg-[#F0F9F4] rounded-full px-1.5 lg:px-3 py-1 mt-1 w-fit">
                  <ShieldCheck size={12} />
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={currentLabelIndex % offers.length}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="text-[8px] lg:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap block"
                      >
                        {offers[currentLabelIndex % offers.length]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}

            
          </div>
        </div>
        
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-product-swiper .swiper-button-prev,
        .custom-product-swiper .swiper-button-next {
          display: none !important;
        }
        
        .custom-product-swiper .swiper-pagination-progressbar {
          background: rgba(0,0,0,0.05) !important;
          height: 2px !important;
          bottom: 0 !important;
          top: auto !important;
        }
        
        .custom-product-swiper .swiper-pagination-progressbar-fill {
          background: #5A413F !important;
        }

        @media (min-width: 1024px) {
          .custom-product-swiper .swiper-pagination {
            display: none !important;
          }
        }
      ` }} />

      {/* Video Popup Modal */}
      <Dialog open={showVideoPopup} onOpenChange={setShowVideoPopup}>
        <DialogContent className="max-w-2xl aspect-square bg-black border-none p-0 overflow-hidden shadow-2xl rounded-3xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Product Video: {product.title}</DialogTitle>
          <DialogDescription className="sr-only">Video preview of the product</DialogDescription>
          
          <button 
            onClick={() => setShowVideoPopup(false)}
            className="absolute top-4 right-4 z-[210] p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all duration-300 shadow-lg border border-white/10"
          >
            <X size={24} />
          </button>
          
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            disablePictureInPicture
            className="w-full h-full object-contain"
            poster={videoMedia?.preview}
          >
            {videoMedia?.sources && videoMedia.sources.length > 0 ? (
              <>
                {videoMedia.sources.filter(s => s.format === 'mp4').map((source, sIdx) => (
                  <source key={sIdx} src={source.url} type={source.mimeType} />
                ))}
                {videoMedia.sources.filter(s => s.format !== 'mp4').map((source, sIdx) => (
                  <source key={sIdx} src={source.url} type={source.mimeType} />
                ))}
              </>
            ) : (
              <source src={videoMedia?.url} type={videoMedia?.mimeType || "video/mp4"} />
            )}
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(ProductCard);
