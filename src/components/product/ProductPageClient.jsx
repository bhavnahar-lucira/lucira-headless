"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Play, Info, Heart, Video, Store, ChevronRight, Share2, Check, Copy, Loader2, X, ArrowRight  } from "lucide-react";
import { BadgeCheck } from "lucide-react";
import PriceSavingsDetails from "@/components/product/PriceSavingsDetails";
import ProductAccordion from "@/components/product/ProductAccordion";
import LuxuryMarquee from "@/components/product/LuxuryMarquee";
import ProductStory from "@/components/product/ProductStory";
import FeaturedIn from "@/components/product/FeaturedIn";
import OurProcess from "@/components/product/OurProcess";
import CategorySlider from "@/components/product/CategorySlider";
import CustomerReviews from "@/components/product/CustomerReviews";
import FAQSection from "@/components/product/FAQSection";
import DiamondComparison from "@/components/product/DiamondComparison";
import { FindLuciraStore } from "@/components/product/FindLuciraStore";
import { JoinLuciraCommunity } from "@/components/product/JoinLuciraCommunity";
import { ProductSlider } from "@/components/product/ProductSlider";
import ExploreOtherRings from "@/components/product/ExploreOtherRings";
import WearThisWith from "@/components/product/WearThisWith";
import { Separator } from "@/components/ui/separator";
import ProductGallery from "@/components/product/ProductGallery";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { selectUser } from "@/redux/features/user/userSlice";
import {
  addWishlistItem,
  removeWishlistItem,
  addGuestWishlistItem,
  removeGuestWishlistItem,
  fetchWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import { addRecentlyViewed, selectRecentlyViewed } from "@/redux/features/recentlyViewed/recentlyViewedSlice";
import AtcBar from "@/components/AtcBar";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Force en-IN formatting to be consistent across environments
const formatPrice = (num) => {
  if (num === null || num === undefined) return "0";
  // Convert to absolute integer to avoid any .00 trailing
  const val = Math.round(Number(num));
  return new Intl.NumberFormat("en-IN", { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(val);
};

// Helper to ensure image src is a valid string URL
const getValidSrc = (src, fallback = "/images/product/1.jpg") => {
  if (typeof src === 'string' && src.trim() !== '') return src;
  if (src && typeof src === 'object' && src.url) return src.url;
  return fallback;
};

const getVariantSelection = (variant) => {
  const fallback = {
    karat: variant?.metafields?.metal_purity || "14KT",
    color: "Yellow Gold",
  };

  if (!variant?.color) {
    return fallback;
  }

  const parts = String(variant.color).trim().split(" ");
  if (parts.length < 2) {
    return fallback;
  }

  return {
    karat: parts[0] || fallback.karat,
    color: parts.slice(1).join(" ") || fallback.color,
  };
};

export default function ProductPageClient({ product, complementaryProducts = [], matchingProducts = [] }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showStickyAtc, setShowStickyAtc] = useState(false);
  const mainAtcRef = useRef(null);

  const [engraving, setEngraving] = useState("");
  const [engravingFont, setEngravingFont] = useState("Lobster");
  const [isEngravingDrawerOpen, setIsEngravingDrawerOpen] = useState(false);
  const [savedEngraving, setSavedEngraving] = useState({ text: "", font: "" });
  const engravingInputRef = useRef(null);
  
  const [giftText, setGiftText] = useState("");
  const [activePromoSlide, setActivePromoSlide] = useState(1);
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const hasEngraving = product.tags?.some(tag => tag.toLowerCase() === "engraving available");
  const isGoldCoin = product.tags?.some(tag => tag.toLowerCase() === "gold coin");

  const slugify = (text) => text?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || "";

  const productId = product.shopifyId || product.id || product.handle;
  const isWishlisted = productId ? wishlistItems.some((item) => item.productId === productId) : false;
  const recentlyViewedState = useSelector(selectRecentlyViewed);

  const handleSaveEngraving = () => {
    setSavedEngraving({ text: engraving, font: engravingFont });
    setIsEngravingDrawerOpen(false);
  };

  const insertSymbol = (symbol) => {
    if (!engravingInputRef.current) return;
    
    const input = engravingInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = engraving;
    
    if (text.length >= 8) return;

    const newText = text.substring(0, start) + symbol + text.substring(end);
    setEngraving(newText.substring(0, 8));
    
    // Focus back and set cursor
    setTimeout(() => {
      input.focus();
      const newPos = start + symbol.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when main ATC is NOT visible
        setShowStickyAtc(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (mainAtcRef.current) {
      observer.observe(mainAtcRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist());
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!product) return;

    dispatch(
      addRecentlyViewed({
        id: product.id,
        shopifyId: product.shopifyId,
        handle: product.handle,
        title: product.title,
        label: product.label,
        colors: product.colors,
        price: product.price,
        compare_price: product.compare_price || product.compareAtPrice,
        compareAtPrice: product.compare_price || product.compareAtPrice,
        description: product.description,
        tags: product.tags,
        images: product.images || (product.featuredImage ? [{ url: product.featuredImage, altText: product.title }] : []),
        variants: product.variants || [],
        media: product.media || [],
      })
    );
  }, [product, dispatch]);

  const hasSimilarItems = product.hasSimilar || (product.matchingProductIds && product.matchingProductIds.length > 0);

  // Initialize with the first in-stock variant if available, otherwise first variant
  const initialVariant = product.variants?.find(v => v.inStock) || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const initialSelection = getVariantSelection(initialVariant);
  const initialColor = initialSelection.color;
  const initialKarat = initialSelection.karat;
  const initialSize = initialVariant ? initialVariant.size : "12";

  const [activeColor, setActiveColor] = useState(initialColor);
  const [activeKarat, setActiveKarat] = useState(initialKarat);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [activeVariant, setActiveVariant] = useState(initialVariant);
  const [priceBreakup, setPriceBreakup] = useState(null);
  const shouldToastVariantChange = useRef(false);

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error("Please select a variant");
      return;
    }

    setAddingToCart(true);
    try {
      // Calculate fallbacks from metafields
      const fallbackWeight = activeVariant?.metafields?.metal_weight || "0";
      const fallbackDiamondPcs = activeVariant?.metafields?.diamonds?.reduce((acc, d) => acc + (parseInt(d.pieces) || 0), 0) || 0;

      // Extract raw technical data from the breakup if it exists (matches the new /api/variant-pricing structure)
      const raw = priceBreakup?.raw_breakup || {};

      const variantOptions = (product.variants || [])
        .filter((variant) => {
          if (!variant?.size) return false;
          return variant.color === `${activeKarat} ${activeColor}`;
        })
        .map((variant) => ({
          variantId: variant.id,
          variantTitle: variant.title,
          size: variant.size,
          price: variant.price,
          inStock: Boolean(variant.inStock),
        }))
        .sort((a, b) => Number(a.size) - Number(b.size));

      const productData = {
        id: product.id,
        shopifyId: product.shopifyId,
        handle: product.handle,
        title: product.title,
        variantId: activeVariant.id,
        variantTitle: activeVariant.title,
        price: activeVariant.price,
        image: getValidSrc(activeVariant.image || product.featuredImage || (product.media && product.media[0]?.url)),
        quantity: 1,
        inStock: Boolean(activeVariant.inStock),
        color: activeColor,
        karat: activeKarat,
        size: selectedSize,
        availableSizes: availableSizes,
        variantOptions,
        engraving: savedEngraving.text,
        // Requested technical fields
        engravingText: savedEngraving.text,
        engravingFont: savedEngraving.font,
        giftText: giftText,
        shippingDate: "13/04/2026", 
        goldPricePerGram: raw?.metal?.rate_per_gram || 0,
        goldWeight: raw?.metal?.weight || parseFloat(fallbackWeight),
        goldPrice: raw?.metal?.cost || 0,
        makingCharges: raw?.making_charges?.final || 0,
        diamondCharges: raw?.diamond?.final || 0,
        gst: raw?.gst?.amount || 0,
        finalPrice: raw?.total || activeVariant.price,
        diamondTotalPcs: raw?.diamond?.pcs || fallbackDiamondPcs,
        hasVideo: Boolean(product.media?.some((m) => m.type === "VIDEO" || m.type === "EXTERNAL_VIDEO")),
        hasSimilar: Boolean(product.handle),
        reviews: product.reviews || null,
        comparePrice: activeVariant?.compare_price || product.compare_price || "",
      };

      await dispatch(addToCart({ userId: user?.id, product: productData })).unwrap();
      toast.success("Added to cart!");
      router.push("/checkout/cart");
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!productId) {
      toast.error("Unable to save this product");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        if (user?.id) {
          await dispatch(removeWishlistItem(productId)).unwrap();
        } else {
          dispatch(removeGuestWishlistItem(productId));
        }
        toast.success("Removed from wishlist");
      } else {
        const payload = {
          productId,
          productHandle: product.handle || "",
          title: product.title,
          image: getValidSrc(product.images?.[0]?.url || product.featuredImage || (product.media && product.media[0]?.url)),
          price: activeVariant?.price || product.price || "",
          comparePrice: activeVariant?.compare_price || product.compare_price || "",
          reviews: product.reviews || null,
          hasVideo: Boolean(product.media?.some((m) => m.type === "VIDEO" || m.type === "EXTERNAL_VIDEO")),
          hasSimilar: Boolean(product.handle),
        };

        if (user?.id) {
          await dispatch(addWishlistItem(payload)).unwrap();
        } else {
          dispatch(addGuestWishlistItem(payload));
        }

        toast.success("Saved to wishlist");
      }
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast.error(err.message || "Wishlist update failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Smooth scroll to top on mount/refresh
  useEffect(() => {
    // Small timeout to ensure browser's default scroll restoration is bypassed
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update active variant when selection changes
  useEffect(() => {
    const variant = product.variants?.find(v => 
      v.color === `${activeKarat} ${activeColor}` && v.size === selectedSize
    );
    if (variant) setActiveVariant(variant);
  }, [activeColor, activeKarat, selectedSize, product.variants]);

  // Fetch variant pricing when active variant changes
  useEffect(() => {
    if (!activeVariant?.id) return;

    fetch(`/api/variant-pricing?variantId=${activeVariant.id}&productId=${product.shopifyId}`)
      .then((res) => res.json())
      .then((data) => {
        // Store full response data
        setPriceBreakup(data);
      })
      .catch((err) => {
        console.error("Pricing fetch failed", err);
      });
  }, [activeVariant]);

  // Toast notification on price update
  useEffect(() => {
    if (activeVariant && shouldToastVariantChange.current) {
      shouldToastVariantChange.current = false;
      toast.info(`Price updated: ₹${formatPrice(activeVariant.price)}${activeVariant.compare_price ? ` (was ₹${formatPrice(activeVariant.compare_price)})` : ''}`, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
      });
    }
  }, [activeVariant]);

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
      const validProducts = (data.products || []).filter(p => p.handle !== product.handle);
      setSimilarProducts(validProducts);
    } catch (e) {
      console.error("Failed to fetch similar products", e);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleGoldSelection = (metal, karat) => {
    if (metal === activeColor && karat === activeKarat) return;

    shouldToastVariantChange.current = true;
    setActiveColor(metal);
    setActiveKarat(karat);
    
    // Find matching variant for new metal/karat with current size
    const variant = product.variants?.find(v => 
      v.color === `${karat} ${metal}` && v.size === selectedSize
    );
    if (variant) setActiveVariant(variant);
  };

  const handleSizeSelection = (size) => {
    if (size === selectedSize) return;

    shouldToastVariantChange.current = true;
    setSelectedSize(size);
    
    // Find matching variant for current metal/karat with new size
    const variant = product.variants?.find(v => 
      v.color === `${activeKarat} ${activeColor}` && v.size === size
    );
    if (variant) setActiveVariant(variant);
  };

  // Helper to check if a specific color/karat combo is in stock (for any size)
  const isColorInStock = (metal, karat) => {
    return product.variants?.some(v => v.color === `${karat} ${metal}` && v.inStock);
  };

  // Helper to check if a specific size is in stock (for current color/karat)
  const isSizeInStock = (size) => {
    return product.variants?.some(v => v.color === `${activeKarat} ${activeColor}` && v.size === size && v.inStock);
  };

  // Extract unique sizes from variants and sort them numerically
  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size) || []))
    .sort((a, b) => Number(a) - Number(b));

  // Get current display price from active variant or product
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentComparePrice = activeVariant ? activeVariant.compare_price : product.compare_price;

  return (
    <div className="w-full">
      <AtcBar 
        isVisible={showStickyAtc} 
        product={product} 
        activeVariant={activeVariant}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        wishlistLoading={wishlistLoading}
      />
      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17">
        {/* Breadcrumb */}
        <Breadcrumb className="py-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/collections" className="text-sm font-medium text-black">Collections</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight size={14}/></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/collections/${slugify(product.type)}`} className="text-sm font-medium text-black">{product.type}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight size={14}/></BreadcrumbSeparator>
            <BreadcrumbItem className="text-sm font-medium text-gray-400 truncate max-w-[200px]">
              {product.title}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_530px] gap-10 items-start">
          {/* Left: Product Gallery */}
          <ProductGallery 
            media={product.media || []} 
            title={product.title} 
            activeColor={activeColor} 
            onViewSimilar={fetchSimilar}
            hasSimilar={hasSimilarItems}
          />

          {/* Right: Product Info */}
          <div className="w-full">
            <div className="space-y-4">
              {/* Title */}
              <div className="w-full">
                <div className="space-y-3">
                  <h1 className="text-28px font-bold leading-[1.2] tracking-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-1.5 leading-none overflow-hidden justify-start">
                    <span className="text-base text-gray-800">
                      {product.productMetafields?.carat_range || "2 CT"} · {product.productMetafields?.material_type || "Lab-Grown diamond"} · {product.vendor}
                      <button className="inline-flex items-center">
                        <Info size={14} className="text-gray-800 ml-2 top-0.75 relative hover:cursor-pointer" />
                      </button>
                    </span>
                  </div>
                </div>
                {/* Rating */}
                {product.reviews && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={`rating-star-${i}`} 
                          size={16} 
                          fill={i < Math.floor(product.reviews.average) ? "currentColor" : "none"} 
                          className={i < Math.floor(product.reviews.average) ? "" : "text-zinc-200"}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{product.reviews.average} ({product.reviews.count})</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="w-full">
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xl font-bold">₹{formatPrice(currentPrice)}</span>
                  {currentComparePrice > currentPrice && (
                    <span className="text-lg text-gray-500 line-through font-medium">₹{formatPrice(currentComparePrice)}</span>
                  )}
                  {currentComparePrice > currentPrice && (
                    <span className="bg-gray-100 text-black text-base font-semibold px-3 py-1 rounded-full">
                      {Math.round((1 - currentPrice / currentComparePrice) * 100)}% OFF
                    </span>
                  )}
                  <button className="text-sm font-semibold underline underline-offset-4 ml-auto decoration-gray-300">
                    See Savings Breakup
                  </button>
                </div>
                <p className="text-sm text-gray-400 font-medium tracking-tight mt-2">Inclusive of all taxes.</p>
              </div>
              
              {/* Savings Banners Slider */}
              <div className="w-full">
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={8}
                  slidesPerView={1.5}
                  autoplay={false}
                  loop={true}
                  className="w-full"
                >
                  <SwiperSlide>
                    <div className="border border-dashed border-gray-400 rounded-lg px-3 py-3 flex items-center gap-2 bg-gray-50 h-full">
                      <span className="text-base shrink-0">💎</span>
                      <p className="text-sm font-semibold text-black whitespace-nowrap">
                        You&apos;re saving flat <span className="font-extrabold text-black">25% OFF</span> on diamond prices.
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="border border-dashed border-gray-400 rounded-lg px-3 py-3 flex items-center gap-2 bg-gray-50 h-full">
                      <span className="text-base shrink-0">🪙</span>
                      <p className="text-sm font-semibold text-black whitespace-nowrap">
                        Save more with <span className="font-extrabold text-black">Lucira coins</span>
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="border border-dashed border-gray-400 rounded-lg px-3 py-3 flex items-center gap-2 bg-gray-50 h-full">
                      <span className="text-base shrink-0">✨</span>
                      <p className="text-sm font-semibold text-black whitespace-nowrap">
                        Free <span className="font-extrabold text-black">Gift</span> included
                      </p>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
              <Separator />
            </div> 

            <div className="space-y-6 mt-4">
              {/* Gold Selection */}
              <div className="space-y-3">
                <div className="text-base font-bold">
                  Select Gold Color & Karat: <span className="text-gray-500 font-medium ml-1">{activeKarat} {activeColor}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const combinations = [];
                    product.variants?.forEach(v => {
                      const parts = v.color.split(" ");
                      if (parts.length >= 3) {
                        const karat = parts[0];
                        const metal = parts.slice(1).join(" ");
                        if (!combinations.find(c => c.karat === karat && c.metal === metal)) {
                          combinations.push({ karat, metal });
                        }
                      }
                    });
                    
                    // Sort combinations: 14KT first, then 18KT. Inside each, White, Yellow, Rose.
                    const metalOrder = ["White Gold", "Yellow Gold", "Rose Gold"];
                    combinations.sort((a, b) => {
                      if (a.karat !== b.karat) return a.karat.localeCompare(b.karat);
                      return metalOrder.indexOf(a.metal) - metalOrder.indexOf(b.metal);
                    });

                    return combinations.map(({ karat, metal }) => {
                      let colorClass = "bg-[#EBC15C]";
                      if (metal.includes("White")) colorClass = "bg-[#E5E5E5]";
                      if (metal.includes("Rose")) colorClass = "bg-[#F6C7C7]";
                      
                      return (
                        <GoldOption 
                          key={`${karat}-${metal}`}
                          metal={metal} 
                          karat={karat} 
                          onClick={handleGoldSelection} 
                          active={activeColor === metal && activeKarat === karat} 
                          color={colorClass} 
                          inStock={isColorInStock(metal, karat)} 
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Ring Size */}
                <div className="space-y-4">
              {availableSizes.length > 0 && availableSizes[0] !== null && availableSizes[0] !== undefined && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-base">Select Ring Size: <span className="font-medium ml-1">{selectedSize} IND</span></span>
                    <button className="text-sm font-medium underline underline-offset-4 decoration-gray-300">Size Guide</button>
                  </div>
                  
                  <div className="bg-[#F8F9FA] rounded-lg flex items-center gap-4 px-4 py-2.5 border border-gray-100">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <Play size={16} fill="black" />
                    </div>
                    <span className="text-base text-black">Watch this quick video to measure your ring right.</span>
                  </div>

                  <div className="grid grid-cols-7 gap-4">
                    {availableSizes.map(sizeStr => {
                      const inStock = isSizeInStock(sizeStr);
                      return (
                        <button
                          key={`size-${sizeStr}`}
                          onClick={() => handleSizeSelection(sizeStr)}
                          className={`relative border rounded-md h-10 flex items-center justify-center text-base transition-all ${
                            sizeStr === selectedSize
                              ? "border-primary bg-white ring-1 ring-primary font-bold"
                              : "border-gray-200 hover:border-primary font-normal"
                          }`}
                        >
                          {sizeStr}
                          {inStock && <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#2DB36F] rounded-full"></span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-black font-medium">Didn&apos;t get the size right? We&apos;ll exchange it.</p>  
                  </>
                )}              
                  {activeVariant?.inStock ? (
                    <div className="bg-[#ECF7F2] border border-[#B3E1CD] text-black  rounded-lg px-4 py-3 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-[#189351] rounded-full"></span>
                      This combination is <span className="font-semibold">in-stock & ready to ship in 24 hrs</span>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-black rounded-lg px-4 py-3 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      This combination will be <span className="font-semibold">made to order (dispatched in 10-15 days)</span>
                    </div>
                  )}
                </div>
              
              <Separator />
            </div>

            {/* Engraving */}
            {hasEngraving && (
              <div className="mt-4 mb-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Complimentary Engraving (optional)</h3>
                  <p className="text-sm text-black leading-relaxed font-medium">
                    Personalise your ring with a custom engraving. Your chosen message will
                    be carefully laser-engraved on the inner band.
                  </p>
                </div>

                <Sheet open={isEngravingDrawerOpen} onOpenChange={setIsEngravingDrawerOpen}>
                  <SheetTrigger asChild>
                    <div className="flex gap-4 items-center mt-4 group cursor-pointer">
                      <div className="relative flex-1">
                        <div className="h-12 bg-white border border-gray-300 rounded-md px-4 flex items-center text-gray-400 text-sm group-hover:border-primary transition-colors">
                          {savedEngraving.text ? (
                            <span style={{ fontFamily: `var(--font-${savedEngraving.font.toLowerCase()})` }} className="text-black text-base">
                              {savedEngraving.text}
                            </span>
                          ) : (
                            "Type your text here"
                          )}
                        </div>
                        <Button variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 group-hover:text-primary">
                          ENGRAVE
                        </Button>
                      </div>                
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                      <SheetTitle className="text-lg font-bold">Engraving</SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* Ring Preview */}
                      <div className="relative w-full aspect-[16/9] bg-[#F9F9F9] flex items-center justify-center overflow-hidden">
                        <Image 
                          src="/images/engraving_bg.jpg" 
                          alt="Ring band preview" 
                          fill 
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {engraving && (
                            <div 
                              style={{ 
                                fontFamily: `var(--font-${engravingFont.toLowerCase()})`,
                                textShadow: "1px 1px 1.5px rgba(255,255,255,0.8), -0.5px -0.5px 1px rgba(0,0,0,0.15)"
                              }} 
                              className="text-gray-800 text-xl sm:text-2xl tracking-[0.15em] opacity-80 italic translate-y-[-10px] sm:translate-y-[-15px]"
                            >
                              {engraving}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-8">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-black leading-relaxed">
                            <span className="font-bold text-gray-900">Note:</span> Text can only contain up to 8 English/alphanumeric characters (A-Z, a-z, 0-9) and special characters (heart and infinity).
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-base font-bold text-gray-900">Choose a Font <span className="text-rose-500">*</span></h4>
                          <div className="grid grid-cols-2 gap-3">
                            {["Lobster", "Yellowtail", "Satisfy", "ABeeZee"].map((font) => (
                              <button
                                key={font}
                                onClick={() => setEngravingFont(font)}
                                className={`px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${
                                  engravingFont === font 
                                    ? "border-black bg-zinc-900 text-white shadow-md scale-[1.02]" 
                                    : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                                }`}
                              >
                                <span style={{ fontFamily: `var(--font-${font.toLowerCase()})` }} className="text-lg">Aa - {font}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-base font-bold text-gray-900">Inner Engraving <span className="text-rose-500">*</span></h4>
                            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                              {engraving.length}/8 Characters
                            </div>
                          </div>
                          
                          <div className="flex gap-3 items-center">
                            <div className="relative flex-1">
                              <Input
                                ref={engravingInputRef}
                                value={engraving}
                                maxLength={8}
                                onChange={(e) => setEngraving(e.target.value)}
                                placeholder="Type your text here"
                                className="h-14 border-gray-300 pr-4 text-lg focus-visible:ring-black rounded-xl"
                                style={{ fontFamily: `var(--font-${engravingFont.toLowerCase()})` }}
                              />
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={() => insertSymbol("♥")}
                                className="w-12 h-12 flex items-center justify-center border-2 border-zinc-100 rounded-xl hover:border-black hover:bg-zinc-50 transition-all active:scale-95"
                                title="Insert Heart"
                              >
                                <span className="text-2xl text-black">♥</span>
                              </button>
                              <button 
                                onClick={() => insertSymbol("∞")}
                                className="w-12 h-12 flex items-center justify-center border-2 border-zinc-100 rounded-xl hover:border-black hover:bg-zinc-50 transition-all active:scale-95"
                                title="Insert Infinity"
                              >
                                <span className="text-2xl text-black">∞</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                      <Button 
                        onClick={handleSaveEngraving}
                        className="w-full h-12 font-bold rounded-full uppercase tracking-wider disabled:opacity-50"
                        disabled={!engraving}
                      >
                        SAVE
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {savedEngraving.text && (
                  <div className="mt-3 flex items-center gap-2 text-primary font-semibold text-sm bg-primary/5 w-fit px-3 py-1.5 rounded-full border border-primary/10">
                    <Check size={14} />
                    Engraving Saved: 
                    <span style={{ fontFamily: `var(--font-${savedEngraving.font.toLowerCase()})` }} className="ml-1 text-base underline decoration-dotted">
                      {savedEngraving.text}
                    </span>
                    <button 
                      onClick={() => {
                        setSavedEngraving({ text: "", font: "" });
                        setEngraving("");
                      }}
                      className="ml-2 p-1 hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
                <Drawer open={showSimilar} onOpenChange={setShowSimilar}>                  
                  <DrawerContent className="max-h-[90vh] h-[90vh] bg-white rounded-t-[20px] flex flex-col">
                    <div className="mx-auto w-full max-w-7xl flex flex-col h-full overflow-hidden">
                      <DrawerHeader className="px-10 pt-10 flex flex-row items-center justify-between border-b border-zinc-100 pb-6 !text-left !flex-row shrink-0">
                        <DrawerTitle className="text-[15px] font-medium tracking-[0.2em] text-black uppercase">VIEW SIMILAR</DrawerTitle>
                        <DrawerClose asChild>
                          <button className="text-zinc-400 hover:text-black transition-colors hover:cursor-pointer p-1">
                            <X size={22} strokeWidth={1.5} />
                          </button>
                        </DrawerClose>
                      </DrawerHeader>
                      
                      <div className="px-10 py-10 overflow-y-auto flex-1">
                        {loadingSimilar ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                            <Loader2 className="animate-spin text-zinc-400" size={40} />
                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Searching matching designs...</p>
                          </div>
                        ) : similarProducts.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12 pb-10">
                            {similarProducts.slice(0, 10).map((item) => (
                              <div key={item.shopifyId || item._id || item.id} className="space-y-4">
                                <Link href={`/products/${item.handle}`} onClick={() => setShowSimilar(false)} className="block space-y-4 group">
                                  <div className="aspect-square relative rounded-md bg-[#F9F9F9] overflow-hidden transition-all duration-300 group-hover:bg-[#f3f3f3]">
                                    <Image
                                      src={getValidSrc(item.image)}
                                      alt={item.title || "Similar product"}
                                      fill
                                      className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
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
                            ))}
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
            </div>
           
            {/* Features */}
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-x-4 text-sm font-medium text-black">
                <div className="flex flex-col space-y-4.5 flex-1">
                    <Feature icon={<Image src="/images/product/shipping.svg" alt="Shipping icon" width={20} height={20} />} text="Free and secure shipping" />
                    <Feature icon={<Image src="/images/product/exchange.svg" alt="Exchange icon" width={20} height={20} />} text="Lifetime exchange and 100% value guarantee" />                  
                </div>
                <div className="flex flex-col space-y-4.5">
                  <Feature icon={<Image src="/images/product/return.svg" alt="Return icon" width={20} height={20} />} text="15-day free returns" />
                  <Feature icon={<BadgeCheck size={20} className="text-black" />} text="IGI and Hallmark certified" />
                </div>
              </div>

              <Separator/>

              {/* Lucira Coins */}
              <div className="flex gap-4 items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Star size={24} className="text-primary fill-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-tight">
                    Earn 5138 Lucira Coins worth ₹500 with this order
                  </p>
                  <p className="text-sm font-medium text-black">
                    10 Lucira Coins = ₹1
                  </p>
                </div>
              </div>

              <Separator/>
            </div>

            <div className="space-y-4 mt-4">
              {/* Pincode & Delivery */}
              <div className="space-y-3 pt-2">
                <div className="relative">
                  <Input
                    placeholder="Enter Pincode"
                    defaultValue="411005"
                    className="h-14 bg-white border-gray-200 rounded-md text-sm font-medium pr-40"
                  />
                  <Button className="h-12 px-10 font-bold rounded-md absolute right-1 top-1/2 transform -translate-y-1/2 hover:cursor-pointer">
                    CHECK
                  </Button>
                </div>
                <div className="text-sm text-black flex items-center gap-2">
                  <Info size={16} className="text-black" />
                  Estimated free dispatch by <span className="font-semibold text-black">January 21, 2026</span>
                </div>
              </div>

              {/* Nearest Store */}
              <div className="border border-gray-200 rounded-md p-4 space-y-2.5 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Store size={20} className="text-black" strokeWidth={1.2} />
                  <span className="text-base font-bold">Nearest Store - <span className="italic font-semibold text-black">Pune Lucira Store (3Km)</span></span>
                </div>
                <div className="flex items-center gap-2 bg-[#E3F5E0] text-black px-3 py-1.5 rounded-full w-fit">
                      <div className="w-3.5 h-3.5 bg-[#76D168] rounded-full flex items-center justify-center">
                        <Check size={9} className="text-white" strokeWidth={4} />
                      </div>
                      <span className="text-12px font-semibold tracking-tight">Design Available</span>
                </div>
                <p className="text-sm text-black">
                  Also available in <button className="underline underline-offset-2 font-bold">2 other stores</button>
                </p>
                <Button className="w-full h-12 font-bold rounded-md mt-1 text-sm">
                  FIND IN STORE
                </Button>
              </div>
              <Separator/>
            </div>

            {/* Promo Cards Slider */}
            <div className="space-y-4 mt-4">
              <div className="overflow-hidden">
                <Swiper
                  spaceBetween={12}
                  slidesPerView={1.2}
                  onSlideChange={(swiper) => setActivePromoSlide(swiper.activeIndex + 1)}
                  className="w-full overflow-visible!"
                >
                  {[1, 2, 3].map((i) => (
                    <SwiperSlide key={`promo-${i}`}>
                      <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-5 flex items-center gap-5 h-full">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-sm shrink-0">
                          <Image src="/images/story-ring.jpg" alt="Complimentary gold coin" fill className="object-cover" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold italic leading-tight">Complimentary Gold Coin</p>
                          <p className="text-sm leading-relaxed">
                            Receive a free gold coin with this ring, making your order even more special.
                          </p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* Slider Indicator */}
                <div className="flex items-center gap-5 mt-4">
                  <div className="flex-1 h-0.75 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full transition-all duration-300"
                      style={{ width: `${(activePromoSlide / 3) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[12px] font-bold tracking-tight text-black">{activePromoSlide}/3</span>
                </div>
              </div>
              <Separator/>            
            </div>
            {/* Explore Section */}
            <div className="space-y-4 mt-4">
              <h3 className="text-base font-semibold">More Ways To Explore:</h3>
              <ExploreCard
                key="visit-store"
                title="Visit Our Store"
                description="Explore and try your favorite designs in person, with expert guidance from our in-store team."
                action="BOOK APPOINTMENT"
                img="/images/store.jpg"
              />
              <ExploreCard
                key="try-at-home"
                title="Try At Home"
                description="Try your selected pieces from the comfort of your home. Available in all major cities"
                action="BOOK HOME TRIAL"
                img="/images/subscribe-2.jpg"
              />
              <Separator/>
            </div>

            {/* Product Details Section */}
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold tracking-tight uppercase tracking-wider">Product Details:</h2>
                {activeVariant?.sku && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 tracking-tight">SKU: {activeVariant.sku}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(activeVariant.sku);
                        toast.success("SKU Copied!", { position: "bottom-center", autoClose: 1000, hideProgressBar: true });
                      }}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Copy size={12} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
                {/* Metal & Dimensions */}
                <div className="flex gap-3 relative justify-between">
                  {/* Metal */}
                  <div className="w-[48%] border-r border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-sm mb-3 uppercase tracking-wide">
                      <Image src="/images/icons/metal.svg" alt="Metal details icon" width={18} height={18} />
                      Metal
                    </div>
                    <div className="flex items-start gap-3.5 pr-2">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                        <Image src="/images/product/try.jpg" alt="Metal sample" width={60} height={60} className="object-contain" />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Carat:</span> {activeVariant?.metafields?.metal_purity || activeKarat}
                        </p>
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Color:</span> {activeVariant?.metafields?.metal_color || activeColor.split(' ')[0]}
                        </p>
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Net Wt:</span> {activeVariant?.metafields?.metal_weight || "2.07"} g
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Dimensions */}
                  <div className="w-[48%] pl-2">
                    <div className="flex items-center gap-2 font-semibold text-sm mb-3 uppercase tracking-wide">
                      <Image src="/images/icons/dimension.svg" alt="Dimensions icon" width={18} height={18} />
                      Dimensions
                    </div>
                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                        <Image src="/images/product/try.jpg" alt="Dimensions sample" width={60} height={60} className="object-contain" />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Height:</span> {activeVariant?.metafields?.top_height || "7.1"} mm
                        </p>
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Width:</span> {activeVariant?.metafields?.top_width || "8.0"} mm
                        </p>
                        <p className="text-sm font-medium leading-none">
                          <span className="text-gray-400 font-normal">Gross Wt:</span> {activeVariant?.metafields?.gross_weight || "2.58"} g
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Diamond Section */}
                {!isGoldCoin && ((activeVariant?.metafields?.diamonds && activeVariant.metafields.diamonds.length > 0) || (!activeVariant?.metafields?.diamonds && String(product.type || "").toLowerCase().includes("ring"))) && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide">
                        <Image src="/images/icons/diamond.svg" alt="Diamond details icon" width={18} height={18} />
                        Diamond
                      </div>
                      
                      {activeVariant?.metafields?.diamonds ? (
                        <div className="flex divide-x divide-gray-200">
                          {activeVariant.metafields.diamonds.map((d, i) => (
                            <div key={`diamond-${i}`} className="flex-1 ps-6 pe-6 first:ps-0 last:pe-0 flex flex-col items-start">
                              <div className="flex justify-start w-full mb-4">
                                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-white shadow-sm p-1">
                                  <Image src={`/images/product/${(i % 3) + 1}.jpg`} alt={`${d.shape} diamond shape`} width={24} height={24} className="object-cover" />
                                </div>
                              </div>
                              <div className="space-y-1.5 text-xs w-full">
                                <div className="flex justify-between gap-2"><span className="text-gray-400">Quality:</span><span className="font-semibold text-gray-900">{d.quality || "VVS-VS, EF"}</span></div>
                                <div className="flex justify-between gap-2"><span className="text-gray-400">Shape:</span><span className="font-semibold text-gray-900">{d.shape}</span></div>
                                <div className="flex justify-between gap-2"><span className="text-gray-400">Pcs:</span><span className="font-semibold text-gray-900">{d.pieces}</span></div>
                                <div className="flex justify-between gap-2"><span className="text-gray-400">Carat:</span><span className="font-semibold text-gray-900">{d.weight}ct</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="bg-[#EDEDED] rounded-md px-4 py-2 flex items-center gap-2.5 w-fit">
                            <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-[10px] text-white font-semibold">i</div>
                            <span className="text-[11px] font-medium">Clarity & Color: <span className="font-bold">VVS-VS, EF</span></span>
                          </div>
                          <div className="flex divide-x divide-gray-200">
                            {[ 
                              { img: "/images/product/1.jpg", shape: "Round", pcs: "1", carat: "2.00ct" },
                              { img: "/images/product/2.jpg", shape: "Round", pcs: "4", carat: "0.048ct" },
                              { img: "/images/product/3.jpg", shape: "Marquise", pcs: "4", carat: "0.48ct" }
                            ].map((d, i) => (
                              <DiamondDetail key={`diamond-fallback-${i}`} {...d} index={i} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {activeVariant?.metafields?.gemstones && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide">
                        <Image src="/images/icons/diamond.svg" alt="diamond3" width={18} height={18} />
                        Gemstone
                      </div>

                      <div className="flex divide-x divide-gray-200">
                        {activeVariant.metafields.gemstones.map((g, i) => (
                          <div key={`gemstone-${i}`} className="flex-1 ps-6 pe-6 first:ps-0 last:pe-0 flex flex-col items-start">
                             <div className="space-y-1.5 text-xs w-full">
                              <div className="flex justify-between gap-2"><span className="text-gray-400">Color:</span><span className="font-semibold text-gray-900">{g.color}</span></div>
                              <div className="flex justify-between gap-2"><span className="text-gray-400">Shape:</span><span className="font-semibold text-gray-900">{g.shape}</span></div>
                              <div className="flex justify-between gap-2"><span className="text-gray-400">Pcs:</span><span className="font-semibold text-gray-900">{g.pieces}</span></div>
                              <div className="flex justify-between gap-2"><span className="text-gray-400">Carat:</span><span className="font-semibold text-gray-900">{g.weight}ct</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <p className="text-[11px] leading-relaxed text-gray-400 italic">
                  * Our products are handcrafted and personalised for your delight, hence a weight variance is expected.
                </p>
              </div>
            </div>

            <PriceSavingsDetails priceBreakup={priceBreakup?.price_breakup}/>

            {priceBreakup?.price_breakup?.total_savings && priceBreakup?.price_breakup?.total_savings !== "₹0" && (
              <div className="mt-4 flex justify-between items-center bg-[#FDF6F6] border border-[#FADEDE] rounded-xl p-5">
                <span className="text-base font-bold text-gray-900 uppercase tracking-tight">Save on this jewelry</span>
                <span className="text-lg font-bold text-[#D93025]">{priceBreakup.price_breakup.total_savings}</span>
              </div>
            )}

            {/* Certification */}
            {!isGoldCoin && (
              <div className="pt-6">
                <div className="bg-gray-50 border border-gray-100 rounded-xl ps-4 pe-16 py-4">
                  <div className="flex items-center gap-2 text-base font-semibold text-black mb-4">
                     Certified Quality Guaranteed.
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <button className="text-sm font-semibold underline underline-offset-[6px] decoration-black mt-1 whitespace-nowrap">
                      See Sample Certificate
                    </button>
                    <div className="flex items-center gap-7">
                      <div className="w-14 h-14 relative">
                        <Image src="/images/product/IGI.png" alt="IGI" fill className="object-contain" />
                      </div>
                      <div className="w-14 h-14 relative">
                        <Image src="/images/product/SGL.png" alt="SGL" fill className="object-contain" />
                      </div>
                      <div className="w-14 h-14 relative">
                        <Image src="/images/product/BIS.png" alt="BIS Hallmark" fill className="object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <ProductAccordion/>
            {/* Wear This With Slider */}
            {complementaryProducts.length > 0 && <WearThisWith products={complementaryProducts} />}
                <div ref={mainAtcRef} className="py-2 bg-white sticky bottom-0 z-[90] mt-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-none">
                  <div className="flex gap-2">
                      <Button 
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 h-12 text-lg font-bold  rounded-md hover:cursor-pointer"
                      >
                      {addingToCart ? (
                          <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ADDING...
                          </>
                      ) : "ADD TO CART"}
                      </Button>
                      <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                      className={`h-12 w-12 rounded-md bg-gray-50 hover:cursor-pointer ${isWishlisted ? "text-rose-500" : "text-black"}`}
                      >
                      <Heart
                          size={24}
                          fill={isWishlisted ? "currentColor" : "none"}
                          className={`${isWishlisted ? "text-rose-500" : "text-black"}`}
                      />
                      </Button>
                  </div>
                </div>

                 <div className="grid grid-cols-2 gap-4 mt-2">
                    <Button variant="outline" className="h-auto py-3 font-medium text-lg flex items-center justify-center gap-2 bg-gray-50 hover:cursor-pointer hover:bg-primary hover:text-white transition-all group">
                      <Image src="/images/icons/whatsapp.png" alt="Whatsapp icon" width={24} height={24} />
                      <span className="hidden lg:inline text-base uppercase">Whatsapp Us</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 font-medium text-lg flex items-center justify-center gap-2 bg-gray-50 hover:cursor-pointer group hover:bg-primary hover:text-white transition-all">
                      <Video size={30} className="text-black group-hover:text-white transition-all" />
                      <span className="hidden lg:inline text-base uppercase">Shop Live</span>
                    </Button>
                </div>

          </div>
        </div>
      </div>
      <LuxuryMarquee prop={["bg-primary", "text-white", "mt-10", "text-md", "font-semibold"]}/>
      <ProductStory/>  
      <FeaturedIn/>
      <OurProcess/>
      <CustomerReviews 
        reviews={product.reviews} 
        productId={product.shopifyId} 
        productTitle={product.title}
        productImage={getValidSrc(product.image)}
        productHandle={product.handle}
      />
      <FAQSection/>
      {!isGoldCoin && <DiamondComparison/>}
      {matchingProducts.length > 0 && (
        <ProductSlider 
          title="From the Same Collection" 
          subtitle="Discover matching pieces that perfectly complement one another"
          products={matchingProducts}
        />
      )}
      <ExploreOtherRings />
      <CategorySlider />
      <ProductSlider
        title={recentlyViewedState?.title || "Recently Viewed"}
        products={Array.isArray(recentlyViewedState?.products) && recentlyViewedState.products.length > 0 ? recentlyViewedState.products.slice(0, 12) : undefined}
        preservePriceOnColorChange={true}
      />
      <FindLuciraStore />
      <JoinLuciraCommunity/>
    </div>
  );
}

function DiamondDetail({ img, shape, pcs, carat, quality = "VVS-VS, EF" }) {
  return (
    <div className="flex-1 ps-6 pe-6 first:ps-0 last:pe-0 flex flex-col items-start">
      <div className="flex justify-start w-full mb-5">
        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-white">
          <Image src={getValidSrc(img)} alt={`${shape} diamond shape`} width={40} height={40} className="object-cover" />
        </div>
      </div>
      <div className="space-y-2 text-12px w-full">
        <div className="flex justify-between"><span className="w-18">Quality:</span><span className="font-medium">{quality}</span></div>
        <div className="flex justify-between"><span className="w-18">Shape:</span><span className="font-medium">{shape}</span></div>
        <div className="flex justify-between"><span className="w-18">No. of Pcs:</span><span className="font-medium">{pcs}</span></div>
        <div className="flex justify-between"><span className="w-18">Carat:</span><span className="font-medium">{carat}</span></div>
      </div>
    </div>
  );
}

function ExploreCard({ title, description, action, img }) {
  return (
    <div className="bg-[#F9F9F9] border border-gray-100 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="w-24 h-16 rounded-md bg-gray-200 shrink-0 relative overflow-hidden shadow-sm">
        {img && <Image src={getValidSrc(img)} alt={title} fill className="object-cover" />}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-12px font-medium leading-[1.3]">{description}</p>
      </div>
      <Button variant="link" className="text-sm p-0 m-0 font-bold underline underline-offset-4 whitespace-nowrap">
        {action}
      </Button>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <span className="leading-tight tracking-tight">{text}</span>
    </div>
  );
}

function GoldOption({ metal, karat, color, active, onClick, inStock }) {
  return (
    <div 
      onClick={() => onClick(metal, karat)}
      className={`border rounded-lg py-2 px-4 cursor-pointer relative flex flex-col items-center gap-3 transition-all ${active ? "border-primary bg-white ring-1 ring-primary shadow-sm" : "border-gray-200 bg-[#F9F9F9] hover:border-gray-300"}`}
    >
      {inStock && <span className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2DB36F]`}></span>}
      <div className={`w-7 h-7 rounded-full border border-gray-100 shadow-inner ${color}`}></div>
      <div className={`text-sm text-center text-black leading-tight uppercase tracking-tight flex flex-col gap-1 ${active ? "font-semibold" : "font-normal"}`}>
        <span>{karat}</span>
        <span>{metal}</span>
      </div>
    </div>
  );
}
