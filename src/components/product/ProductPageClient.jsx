"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
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
import { Star, Play, Info, Heart, Video, Store, ChevronRight, Share2, Check, Copy, Loader2, X, ArrowRight, MapPin, Phone, Package } from "lucide-react";
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
import { calculateDistance } from "@/utils/distance";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { SizeGuideSheet } from "@/components/product/SizeGuideSheet";
import { ProductCustomizerMobile } from "@/components/product/ProductCustomizerMobile";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { selectUser, setPincode as setGlobalPincode } from "@/redux/features/user/userSlice";
import {
  addWishlistItem,
  removeWishlistItem,
  addGuestWishlistItem,
  removeGuestWishlistItem,
  fetchWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import { addRecentlyViewed, selectRecentlyViewed } from "@/redux/features/recentlyViewed/recentlyViewedSlice";
import AtcBar from "@/components/AtcBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { pushProductView, pushAddToCart, pushAddToWishlist, pushRemoveFromWishlist, formatGtmPrice } from "@/lib/gtm";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import StyledByLucira from "../home/StyledByLucira";

import TryOnButton from "@/components/common/TryOnButton";

import { Sheet as MobileSheet } from "react-modal-sheet";

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

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

const parseOrnaverseComponent = (val) => {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};

const mapShapeCode = (code) => {
  if (!code || code === "NA") return null;
  const maps = {
    "PR": "Princess",
    "RD": "Round",
    "MQ": "Marquise",
    "OV": "Oval",
    "PE": "Pear",
    "EM": "Emerald",
    "CU": "Cushion",
    "HE": "Heart",
    "RA": "Radiant",
    "AS": "Asscher"
  };
  return maps[code.toUpperCase()] || code;
};

export default function ProductPageClient({ product, complementaryProducts = [], matchingProducts = [] }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showTopAtc, setShowTopAtc] = useState(false);
  const [showBottomAtc, setShowBottomAtc] = useState(true);
  const mainAtcRef = useRef(null);
  const productDetailsRef = useRef(null);
  const reviewsRef = useRef(null);

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

  const [allStores, setAllStores] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [nearestStore, setNearestStore] = useState(null);
  const [availableStoreCount, setAvailableStoreCount] = useState(0);
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);

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
  
  // Pincode & Dispatch Logic
  const globalPincode = useSelector((state) => state.user.pincode);
  const [pincode, setPincode] = useState(globalPincode || "");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    status: "idle", // idle, loading, deliverable, undeliverable
    message: "",
    coords: null
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setAllStores(data.stores || []);
      } catch (err) {
        console.error("Error fetching stores:", err);
      }
    };
    fetchStores();
  }, []);

  const calculateDispatchDate = useCallback(() => {
    // 1. Check if product is in stock or made to order
    const isInStock = activeVariant?.inStock === true || activeVariant?.inStock === "true";
    
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    if (isInStock) {
      // Estimated free dispatch by 48hrs
      const dispatchDate = new Date(today);
      dispatchDate.setDate(today.getDate() + 2);
      return `Estimated free dispatch by ${months[dispatchDate.getMonth()]} ${dispatchDate.getDate()}, ${dispatchDate.getFullYear()}`;
    } else {
      // Made to order - use lead_time from metafields (default to 7 if missing)
      const leadTimeValue = parseInt(product.productMetafields?.lead_time) || 12;
      const totalDays = leadTimeValue + 3; // Lead time + 3 days buffer
      
      const dispatchDate = new Date(today);
      dispatchDate.setDate(today.getDate() + totalDays);
      return `Estimated free dispatch by ${months[dispatchDate.getMonth()]} ${dispatchDate.getDate()}, ${dispatchDate.getFullYear()}`;
    }
  }, [activeVariant, product.productMetafields]);

  const handlePincodeCheck = useCallback(async (val) => {
    // If val is a string (like from useEffect), use it. 
    // Otherwise (from button click/event), use the current 'pincode' state.
    const pincodeToCheck = (typeof val === 'string' ? val : pincode).trim();
    
    if (pincodeToCheck.length !== 6) {
      if (pincodeToCheck) toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setCheckingPincode(true);
    setDeliveryInfo({ status: "loading", message: "Checking..." });

    try {
      const res = await fetch(`/api/pincodes/check?pincode=${pincodeToCheck}`);
      const data = await res.json();

      if (data.success && data.deliverable) {
        const dispatchMsg = calculateDispatchDate();
        setDeliveryInfo({
          status: "deliverable",
          message: dispatchMsg,
          coords: data.data?.latitude && data.data?.longitude ? { lat: data.data.latitude, lng: data.data.longitude } : null
        });
        // Store in global Redux for persistence
        dispatch(setGlobalPincode(pincodeToCheck));
      } else {
        setDeliveryInfo({
          status: "undeliverable",
          message: "Sorry, we do not deliver to this pincode yet.",
          coords: null
        });
      }
    } catch (err) {
      console.error("Pincode check error:", err);
      setDeliveryInfo({ status: "idle", message: "" });
      // Don't show toast on initial mount load
      if (typeof val !== 'string') toast.error("Error checking pincode. Please try again.");
    } finally {
      setCheckingPincode(false);
    }
  }, [pincode, calculateDispatchDate, dispatch]);

  // Initial check for persisted pincode - ONLY ON MOUNT
  useEffect(() => {
    if (globalPincode && globalPincode.length === 6) {
      handlePincodeCheck(globalPincode);
    }
    // We only want this to run once when the page loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update dispatch message when variant changes (size/color)
  useEffect(() => {
    if (deliveryInfo.status === "deliverable") {
      const dispatchMsg = calculateDispatchDate();
      setDeliveryInfo(prev => ({
        ...prev,
        message: dispatchMsg
      }));
    }
  }, [activeVariant, calculateDispatchDate, deliveryInfo.status]);

  // Handle Nearest Store Logic
  useEffect(() => {
    if (!allStores.length || !activeVariant) return;

    const tagMapping = {
      "Malad": ["divinecarat", "malad", "goregaon"],
      "Chembur": ["chembur", "cs1"],
      "Pune": ["pune", "ps1"],
      "Borivali": ["borivali", "bo1"],
      "Noida": ["noida", "nos18"]
    };

    const inStoreTags = activeVariant.metafields?.in_store_available || [];
    
    // 1. Identify which stores actually have stock
    const stockStoreIds = allStores.filter(store => {
      if (inStoreTags.includes(store.shopifyId)) return true;
      const storeNumericId = store.shopifyId.split("/").pop();
      if (inStoreTags.some(tag => String(tag).includes(storeNumericId))) return true;

      const storeNameLower = store.name.toLowerCase();
      const storeCityLower = (store.city || "").toLowerCase();
      
      return inStoreTags.some(tag => {
        const tagLower = String(tag).toLowerCase();
        if (tagLower.includes("gid://")) return false;
        const searchTerms = tagMapping[tag] || [tagLower];
        return searchTerms.some(term => storeNameLower.includes(term) || storeCityLower.includes(term));
      });
    }).map(s => s.shopifyId);

    setAvailableStoreCount(stockStoreIds.length);

    // 2. Prepare ALL stores with distance and stock status for the Side Sheet
    const storesWithData = allStores.map(store => {
      let distance = null;
      if (deliveryInfo.coords && (store.latitude || store.lat) && (store.longitude || store.lng)) {
        distance = calculateDistance(
          deliveryInfo.coords.lat, 
          deliveryInfo.coords.lng, 
          store.latitude || store.lat, 
          store.longitude || store.lng
        );
      }
      return { 
        ...store, 
        distance, 
        isInStock: stockStoreIds.includes(store.shopifyId) 
      };
    });

    // Sort: Distance priority if coords exist, then stock status, then alphabetical
    storesWithData.sort((a, b) => {
      // 1. Distance priority if coords exist
      if (deliveryInfo.coords) {
        if (a.distance !== null && b.distance !== null) {
          if (a.distance !== b.distance) return a.distance - b.distance;
        } else if (a.distance !== null) {
          return -1;
        } else if (b.distance !== null) {
          return 1;
        }
      }
      
      // 2. Stock status priority
      if (a.isInStock && !b.isInStock) return -1;
      if (!a.isInStock && b.isInStock) return 1;
      
      // 3. Alphabetical fallback
      return a.name.localeCompare(b.name);
    });

    setAvailableStores(storesWithData);

    // 3. Find the nearest store for the main display (Absolute nearest)
    setNearestStore(storesWithData.length > 0 ? storesWithData[0] : null);
  }, [allStores, activeVariant, deliveryInfo.coords]);

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
        if (isMobile) {
          // On mobile: Always use bottom sticky bar when main ATC is not in view
          setShowBottomAtc(!entry.isIntersecting);
          setShowTopAtc(false);
        } else {
          // On desktop: Top bar when scrolled past, Bottom bar when at top
          if (entry.isIntersecting) {
            setShowTopAtc(false);
            setShowBottomAtc(false);
          } else {
            if (entry.boundingClientRect.top < 0) {
              setShowTopAtc(true);
              setShowBottomAtc(false);
            } else {
              setShowTopAtc(false);
              setShowBottomAtc(true);
            }
          }
        }
      },
      { threshold: 0 }
    );

    if (mainAtcRef.current) {
      observer.observe(mainAtcRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile]);

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
        reviews: product.reviews,
        reviewStats: product.reviewStats,
        matchingProductIds: product.matchingProductIds,
        hasSimilar: product.hasSimilar,
        diamondDiscount: product.diamondDiscount,
        makingDiscount: product.makingDiscount,
        productMetafields: product.productMetafields,
      })
    );
  }, [product, dispatch]);

  const hasSimilarItems = product.hasSimilar || (product.matchingProductIds && product.matchingProductIds.length > 0);

  const getStoreDisplayName = (name) => {
    if (!name) return "";
    if (name.includes("Divinecarat")) return "Malad";
    if (name === "BO1") return "Borivali";
    if (name === "CS1") return "Chembur";
    if (name === "PS1") return "Pune";
    if (name === "NOS18") return "Noida";
    return name;
  };

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
          sku: variant.sku || "",
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

      //gtm            
      // Helper to extract numeric ID from Shopify GID
      const getNumericId = (gid) => {
        if (!gid) return 0;
        if (typeof gid === 'number') return gid;
        const match = String(gid).match(/\d+$/);
        return match ? Number(match[0]) : 0;
      };

      const productImageUrl = getValidSrc(activeVariant?.image || product.images?.[0]);
      const currentUrl = typeof window !== 'undefined' ? window.location.origin + `/products/${product.handle}` : "";

      const sellingPrice = Number(activeVariant?.price || product.price || 0);
      const originalPrice = Number(activeVariant?.compare_price || activeVariant?.compareAtPrice || product.compare_price || product.compareAtPrice || sellingPrice);

      pushAddToCart({
        eventId: `atc_${Date.now()}`,
        products: {
          productId: String(getNumericId(product.shopifyId || product.id)),
          variantId: getNumericId(activeVariant?.id || activeVariant?.shopifyId),
          sku: activeVariant?.sku || "",
          productName: product.title,
          productType: product.type || "",
          vendor: product.vendor || "Lucira Jewelry",
          price: String(originalPrice.toFixed(2)),
          productUrl: currentUrl,
          image: productImageUrl,
          offerPrice: Number(sellingPrice),
          category: "",
          subCategory: "",
          productPersona: ""
        }
      });
      //gtm

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

        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
        pushAddToWishlist({
          productName: product.title,
          product_url: `${currentOrigin}/products/${product.handle}?variant=${activeVariant?.id || activeVariant?.shopifyId}`,
          price: Number(activeVariant?.compare_price || activeVariant?.compareAtPrice || product.compare_price || product.compareAtPrice || activeVariant?.price || product.price || 0),
          offer_price: Number(activeVariant?.price || product.price || 0),
          thumbnail_image: getValidSrc(product.images?.[0]?.url || product.featuredImage || (product.media && product.media[0]?.url)),
          currency: "INR"
        });
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

    //gtm
    // Product View GTM Trigger, runs when variant changes or page loads
    useEffect(() => {
      if (activeVariant || product) {
        // Helper to extract numeric ID from Shopify GID
        const getNumericId = (gid) => {
          if (!gid) return 0;
          if (typeof gid === 'number') return gid;
          const match = String(gid).match(/\d+$/);
          return match ? Number(match[0]) : 0;
        };

        const productImageUrl = getValidSrc(activeVariant?.image || product.images?.[0]);
        const currentUrl = typeof window !== 'undefined' ? window.location.origin + `/products/${product.handle}` : "";

        // Correctly identify the Selling Price and the Original/Regular Price
        const sellingPrice = Number(activeVariant?.price || product.price || 0);
        const originalPrice = Number(activeVariant?.compare_price || activeVariant?.compareAtPrice || product.compare_price || product.compareAtPrice || sellingPrice);

        pushProductView({
          productId: getNumericId(product.shopifyId || product.id),
          sku: activeVariant?.sku || "",
          variantId: getNumericId(activeVariant?.id || activeVariant?.shopifyId),
          vendorCode: product.vendor || "Lucira Jewelry",
          productName: product.title,
          productType: product.type || "",
          category: product.type || "",
          subCategory: "0",
          productUrl: currentUrl,
          productUrlw: `/products/${product.handle}`,
          thumbnailImage: productImageUrl,
          image: productImageUrl,
          price: originalPrice,
          offerPrice: sellingPrice,
          productPersona: null
        });
      }
    }, [activeVariant, product]);



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
  const mounted = useMounted();
  const isDesktop = useMediaQuery("(max-width: 1023px)");
  if (!mounted) return null;

  return (
    <div className="w-full">
      <AtcBar 
        isTopVisible={showTopAtc}
        isBottomVisible={showBottomAtc} 
        product={product} 
        activeVariant={activeVariant}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        wishlistLoading={wishlistLoading}
      />
      <div className="w-[91%] lg:w-full lg:max-w-480 mx-auto lg:px-17">
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
            <BreadcrumbItem className="text-sm font-medium text-gray-400 truncate">
              {product.title}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_530px] gap-10 items-start">
          {/* Left: Product Gallery */}
          <ProductGallery
            media={product.media || []}
            title={product.title}
            activeColor={activeColor}
            onViewSimilar={fetchSimilar}
            hasSimilar={hasSimilarItems}
            product={product}
            activeVariant={activeVariant}
          />
          {/* Right: Product Info */}
          <div className="w-full">
            <div className="space-y-4">
              {/* Title */}
              <div className="w-full">
                <div className="space-y-3">
                  <h1 className="text-xl font-bold leading-[1.2] tracking-tight">
                    {product.title}
                  </h1>
                  <div className="flex justify-between gap-2 items-center">
                    {(() => {
                      const variantMeta = activeVariant?.metafields;
                      const prodMeta = product.productMetafields;
                      const pricingDiamond = priceBreakup?.diamond_info;
                      const ornaverseComp = parseOrnaverseComponent(variantMeta?.components || prodMeta?.components);
                      
                      // Find the first diamond component for summary display
                      const firstDiamond = ornaverseComp?.components?.find(c => 
                        (c.item_group_name === "Diamond" || (c.quality_code && c.quality_code !== "NA")) && (parseFloat(c.weight) > 0 || parseInt(c.pieces) > 0)
                      );
                      
                      const variantDiamonds = variantMeta?.diamonds?.filter(d => parseFloat(d.weight) > 0 || parseInt(d.pieces) > 0) || [];
                      const isDiamondProduct = !!firstDiamond || variantDiamonds.length > 0 || (!!pricingDiamond && (parseFloat(pricingDiamond.weight) > 0 || parseInt(pricingDiamond.pcs) > 0));
                      
                      const parts = [];
                      
                      if (isDiamondProduct) {
                        // 1. Diamond Quality
                        const quality = (firstDiamond?.quality_code && firstDiamond?.stone_color_code && firstDiamond.quality_code !== "NA" && firstDiamond.stone_color_code !== "NA")
                          ? `${firstDiamond.quality_code}, ${firstDiamond.stone_color_code}`
                          : (firstDiamond?.purity || variantDiamonds[0]?.quality || pricingDiamond?.title || prodMeta?.quality);
                        
                        // 2. Diamond Carat
                        const carat = variantDiamonds[0]?.weight 
                          ? `${variantDiamonds[0].weight}ct` 
                          : (firstDiamond?.weight ? `${firstDiamond.weight}ct` : prodMeta?.carat_range);
                          
                        if (quality && quality !== "NA") parts.push(quality);
                        if (carat && carat !== "NA" && !carat.startsWith("0ct")) parts.push(carat);
                      } 
                      
                      // If no diamond parts were added, or it's not a diamond product, show metal purity
                      if (parts.length === 0) {
                        const metalPurity = variantMeta?.metal_purity || activeKarat;
                        if (metalPurity) parts.push(metalPurity);
                      }
                      
                      // 3. Metal Weight
                      const weightVal = variantMeta?.metal_weight || prodMeta?.weight;
                      const weight = weightVal ? `${weightVal}${String(weightVal).toLowerCase().includes('g') ? '' : 'g'}` : null;
                      if (weight) parts.push(weight);

                      if (parts.length === 0) return null;
                      
                      return (
                        <p className="font-figtree text-[10px] lg:text-sm font-medium text-gray-800 uppercase tracking-tight">
                          {parts.join(" · ")}
                        </p>
                      );
                    })()}
                    {/* Rating */}
                    {(product.reviews || product.reviewStats) && (
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <Star size={14} fill="currentColor" className="text-amber-400" />
                        <span className="font-figtree text-[10px] lg:text-sm font-semibold text-gray-800 uppercase tracking-tight">
                          {product.reviews?.average || product.reviewStats?.average || 0} ({product.reviews?.count || product.reviewStats?.count || 0})
                        </span>
                      </div>
                    )}
                  </div>                  
                </div>
              </div>

              {/* Price */}
              <div className="w-full">  
                <div className="flex flex-row flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">&#8377;{formatPrice(currentPrice)}</span>
                    {currentComparePrice > currentPrice && (
                      <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through font-medium">
                        &#8377;{formatPrice(currentComparePrice)}
                      </span>
                    )}
                    {currentComparePrice > currentPrice && (
                      <span className="shrink-0 bg-gray-100 text-black text-xs sm:text-sm md:text-base font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                        {Math.round((1 - currentPrice / currentComparePrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() =>
                      productDetailsRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-xs sm:text-sm font-semibold underline underline-offset-4 decoration-gray-300 hover:cursor-pointer sm:ml-auto whitespace-nowrap">
                    See Savings Breakup
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-tight mt-2">
                  Inclusive of all taxes.
                </p>
              </div>
              
              {/* Savings Banners Slider */}
              {(() => {
                const raw = priceBreakup?.raw_breakup;
                const diamondDiscount = raw?.diamond?.discount_percent || 0;
                const mcDiscount = raw?.making_charges?.discount_percent || 0;
                const isDiamondJewelry = (raw?.diamond?.final || 0) > 0;
                const currentTotalPrice = activeVariant?.price || 0;
                const isGoldCoinEligible = isDiamondJewelry && currentTotalPrice >= 20000;

                const slides = [];
                if (diamondDiscount > 0) {
                  slides.push({
                    icon: "💎",
                    text: <>You&apos;re saving flat <span className="font-extrabold text-black">{diamondDiscount}% OFF</span> on diamond prices.</>
                  });
                }
                if (mcDiscount > 0) {
                  slides.push({
                    icon: "⚒️",
                    text: <>You&apos;re saving flat <span className="font-extrabold text-black">{mcDiscount}% OFF</span> on making charges.</>
                  });
                }
                if (isGoldCoinEligible) {
                  slides.push({
                    icon: "🪙",
                    text: <>Complimentary <span className="font-extrabold text-black">Gold Coin</span> available on this order</>
                  });
                }

                if (slides.length === 0) return null;

                return (
                  <div className="w-full">
                    <Swiper
                      modules={[Autoplay]}
                      spaceBetween={8}
                      // slidesPerView={slides.length > 1 ? 1.1 : 1}
                      speed={1800}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      loop={slides.length > 2}
                      breakpoints={{
                        0: {
                          slidesPerView: slides.length > 1 ? 1 : 1,
                          spaceBetween: 8,
                        },
                        768: {
                          slidesPerView: slides.length > 1 ? 1.8 : 1,
                          spaceBetween: 12,
                        },
                        1024: {
                          slidesPerView: slides.length > 1 ? 1.1 : 1,
                          spaceBetween: 16,
                        },
                        1280: {
                          slidesPerView: slides.length > 1 ? 1.4 : 1,
                          spaceBetween: 20,
                        }
                      }}
                    >
                      {slides.map((slide, idx) => (
                        <SwiperSlide key={`promo-slide-${idx}`}>
                          <div className="border border-dashed border-gray-400 rounded-lg px-3 py-3 flex items-center gap-2 bg-secondary/50 h-full w-fit">
                            <span className="text-base shrink-0">{slide.icon}</span>
                            <p className="text-sm font-semibold text-black whitespace-nowrap">
                              {slide.text}
                            </p>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                );
              })()}
              <Separator />
            </div> 

            <div className="space-y-6 mt-4">
              {/* Mobile Customizer */}
              <ProductCustomizerMobile
                activeColor={activeColor}
                activeKarat={activeKarat}
                selectedSize={selectedSize}
                handleGoldSelection={handleGoldSelection}
                handleSizeSelection={handleSizeSelection}
                availableSizes={availableSizes}
                product={product}
                isColorInStock={isColorInStock}
                isSizeInStock={isSizeInStock}
                nearestStore={nearestStore}
                availableStores={availableStores}
                availableStoreCount={availableStoreCount}
                deliveryInfo={deliveryInfo}
                getStoreDisplayName={getStoreDisplayName}
              />

              {/* Desktop Selection Blocks */}
              <div className="hidden lg:block space-y-6">
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
                      {String(product.type || "").toLowerCase().includes("ring") && (
                        <SizeGuideSheet>
                          <button className="text-sm font-medium underline underline-offset-4 decoration-gray-300 hover:cursor-pointer">Size Guide</button>
                        </SizeGuideSheet>
                      )}
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
                      <div className="bg-[#ECF7F2] border border-[#B3E1CD] text-black rounded-lg px-4 py-3 flex items-center gap-1 xl:flex-nowrap lg:flex-wrap">
                        <span className="w-2.5 h-2.5 bg-[#189351] rounded-full"></span>
                        This combination is <span className="font-semibold xl:basis-auto lg:basis-full">in-stock & ready to ship in 24 hrs</span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 text-black rounded-lg px-4 py-3 flex items-center gap-1 xl:flex-nowrap lg:flex-wrap">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                        This combination will be <span className="font-semibold xl:basis-auto lg:basis-full">made to order (dispatched in 10-15 days)</span>
                      </div>
                    )}
                  </div>
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
                              className="text-gray-800 text-xl sm:text-2xl tracking-[0.15em] opacity-80 italic -translate-y-9 sm:-translate-y-9"
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
            <div className="space-y-2 mb-4">
                <Drawer open={showSimilar} onOpenChange={setShowSimilar}>                  
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

            <div ref={mainAtcRef} className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 h-12 text-lg font-bold rounded-md hover:cursor-pointer"
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
           
            {/* Features */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-y-4 gap-x-6 lg:gap-x-6 text-xs sm:text-sm font-medium text-black`">
                <Feature icon={<Image src="/images/product/shipping.svg" alt="Shipping icon" width={28} height={28} />} text="Free and secure shipping" />
                <Feature icon={<Image src="/images/product/return.svg" alt="Return icon" width={28} height={28} />} text="15-day free returns" />
                <Feature icon={<Image src="/images/product/exchange.svg" alt="Exchange icon" width={28} height={28} />} text="Lifetime exchange and 100% value guarantee" />
                <Feature icon={<Image src="/images/product/certified.svg" alt="Return icon" width={28} height={28} />} text="IGI and Hallmark certified" />
              </div>

              <Separator/>

              {/* Lucira Coins */}
              <div className="flex gap-4 items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Star size={24} className="text-primary fill-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-tight">
                    Earn {Math.floor(currentPrice * 0.04)} Lucira Coins worth ₹{formatPrice(Math.floor(currentPrice * 0.04))} with this order
                  </p>
                  <p className="text-sm font-medium text-black">
                    1 Lucira Coin = ₹1
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
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePincodeCheck()}
                    className="h-14 bg-white border-gray-200 rounded-md text-sm font-medium pr-40"
                  />
                  <Button 
                    onClick={handlePincodeCheck}
                    disabled={checkingPincode}
                    className="h-12 px-10 font-bold rounded-md absolute right-1 top-1/2 transform -translate-y-1/2 hover:cursor-pointer"
                  >
                    {checkingPincode ? <Loader2 className="animate-spin" size={18} /> : "CHECK"}
                  </Button>
                </div>
                {deliveryInfo.status !== "idle" && (
                  <div className={`text-sm flex items-center gap-2 ${deliveryInfo.status === "undeliverable" ? "text-red-500" : "text-black"}`}>
                    {deliveryInfo.status === "undeliverable" ? (
                      <X size={16} />
                    ) : (
                      <Info size={16} className={deliveryInfo.status === "loading" ? "animate-pulse" : "text-black"} />
                    )}
                    <span className={deliveryInfo.status === "deliverable" ? "font-normal" : "font-medium"}>
                      {deliveryInfo.message}
                    </span>
                  </div>
                )}
              </div>

              {/* Nearest Store */}
              <div className="border border-gray-200 rounded-md p-4 space-y-2.5 bg-gray-50">
                {availableStoreCount > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Store size={20} className="text-black" strokeWidth={1.2} />
                      <span className="text-base font-bold">
                        {nearestStore ? (
                          <>Nearest Store - <span className="italic font-semibold text-black">{getStoreDisplayName(nearestStore.name)}{nearestStore.distance !== null ? ` (${Math.round(nearestStore.distance)}Km)` : ""}</span></>
                        ) : (
                          <>Available in <span className="italic font-semibold text-black">{availableStoreCount} stores</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#E3F5E0] text-black px-3 py-1.5 rounded-full w-fit">
                          <div className="w-3.5 h-3.5 bg-[#76D168] rounded-full flex items-center justify-center">
                            <Check size={9} className="text-white" strokeWidth={4} />
                          </div>
                          <span className="text-12px font-semibold tracking-tight">Design Available</span>
                    </div>
                  </>
                )}
                {availableStoreCount > 1 && (
                  <p className="text-sm text-black">
                    Also available in <button onClick={() => setIsStoreDrawerOpen(true)} className="underline underline-offset-2 font-bold">{availableStoreCount - 1} other stores</button>
                  </p>
                )}
                <Button 
                  onClick={() => setIsStoreDrawerOpen(true)}
                  className="w-full h-12 font-bold rounded-md mt-1 text-sm uppercase tracking-widest"
                >
                  {availableStoreCount > 0 ? "FIND IN STORE" : "FIND STORE"}
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
                url="https://wa.me/919004435760?text=Hi,%20I%20want%20to%20book%20an%20appointment"
              />
              <ExploreCard
                key="try-at-home"
                title="Try At Home"
                description="Try your selected pieces from the comfort of your home. Available in all major cities"
                action="BOOK HOME TRIAL"
                img="/images/subscribe-2.jpg"
                url="https://wa.me/919004435760?text=Hi,%20I%20want%20to%20try%20this%20at%20home"
              />
              <Separator/>
            </div>

            {/* Product Details Section */}
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold tracking-tight uppercase">Product Details</h2>
                {activeVariant?.sku && (
                  <div 
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title="Click to copy SKU"
                    onClick={() => {
                      navigator.clipboard.writeText(activeVariant.sku);
                      toast.success("SKU Copied!", { 
                        position: "bottom-center",
                        autoClose: 1500,
                        hideProgressBar: true,
                        theme: "light"
                      });                    }}
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                      SKU: {activeVariant.sku}
                    </span>
                    <Copy size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {/* Metal Card */}
                <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                    <Image src="/images/icons/metal.svg" alt="Metal" width={18} height={18} />
                    Metal <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                  </div>
                  <div className="space-y-2">
                    {activeVariant?.metafields?.metal_purity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Purity</span>
                        <span className="font-medium">{activeVariant.metafields.metal_purity}</span>
                      </div>
                    )}
                    {activeVariant?.metafields?.metal_color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Color</span>
                        <span className="font-medium">{activeVariant.metafields.metal_color}</span>
                      </div>
                    )}
                    {activeVariant?.metafields?.metal_weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Net Wt</span>
                        <span className="font-medium">{activeVariant.metafields.metal_weight} g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dimensions Card */}
                <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                    <Image src="/images/icons/dimension.svg" alt="Dimensions" width={18} height={18} />
                    Dimension <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                  </div>
                  <div className="space-y-2">
                    {activeVariant?.metafields?.top_height && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Height</span>
                        <span className="font-medium">{activeVariant.metafields.top_height} mm</span>
                      </div>
                    )}
                    {activeVariant?.metafields?.top_width && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Width</span>
                        <span className="font-medium">{activeVariant.metafields.top_width} mm</span>
                      </div>
                    )}
                    {activeVariant?.metafields?.gross_weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gross Wt</span>
                        <span className="font-medium">{activeVariant.metafields.gross_weight} g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Diamond Card */}
                {!isGoldCoin && activeVariant?.metafields?.diamonds && activeVariant.metafields.diamonds.length === 1 && (
                  <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                      <Image src="/images/icons/diamond.svg" alt="Diamond" width={18} height={18} />
                      Diamond <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                    </div>
                    <div className="space-y-2.5">
                      {activeVariant.metafields.diamonds[0].quality && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quality</span>
                          <span className="font-medium">{activeVariant.metafields.diamonds[0].quality}</span>
                        </div>
                      )}
                      {activeVariant.metafields.diamonds[0].shape && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Shape</span>
                          <span className="font-medium uppercase">{mapShapeCode(activeVariant.metafields.diamonds[0].shape) || activeVariant.metafields.diamonds[0].shape}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantity</span>
                        <span className="font-medium">{activeVariant.metafields.diamonds[0].pieces || "1"}pcs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Carat</span>
                        <span className="font-medium">{activeVariant.metafields.diamonds[0].weight}ct</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Single Gemstone Card */}
                {activeVariant?.metafields?.gemstones && activeVariant.metafields.gemstones.length === 1 && (
                  <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                      <Image src="/images/icons/diamond.svg" alt="Gemstone" width={18} height={18} className="grayscale opacity-70" />
                      Gemstone <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                    </div>
                    <div className="space-y-2.5">
                      {activeVariant.metafields.gemstones[0].color && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Color</span>
                          <span className="font-medium uppercase">{activeVariant.metafields.gemstones[0].color}</span>
                        </div>
                      )}
                      {activeVariant.metafields.gemstones[0].shape && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Shape</span>
                          <span className="font-medium uppercase">{mapShapeCode(activeVariant.metafields.gemstones[0].shape) || activeVariant.metafields.gemstones[0].shape}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantity</span>
                        <span className="font-medium">{activeVariant.metafields.gemstones[0].pieces || "1"}pcs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Carat</span>
                        <span className="font-medium">{activeVariant.metafields.gemstones[0].weight || "0"}ct</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Diamond Card - Full Width */}
              {!isGoldCoin && activeVariant?.metafields?.diamonds && activeVariant.metafields.diamonds.length > 1 && (
                <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-5">
                  <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                    <Image src="/images/icons/diamond.svg" alt="Diamond" width={18} height={18} />
                    Diamond <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                  </div>
                  
                  <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Labels Column */}
                    <div className="space-y-1 shrink-0">
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Quality :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Shape :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Quantity :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Carat :</div>
                    </div>
                    
                    {/* Values Columns */}
                    {activeVariant.metafields.diamonds.map((d, i) => (
                      <div key={`dia-col-${i}`} className="space-y-1 shrink-0">
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap">{d.quality || "VVS-VS, EF"}</div>
                        <div className="text-sm font-semibold h-5 flex items-center uppercase text-gray-900 whitespace-nowrap">{mapShapeCode(d.shape) || d.shape || "-"}</div>
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap">{d.pieces || "1"}pcs</div>
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap">{d.weight}ct</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Gemstone Card - Full Width */}
              {activeVariant?.metafields?.gemstones && activeVariant.metafields.gemstones.length > 1 && (
                <div className="bg-[#F9F9F9] rounded-2xl p-5 space-y-5">
                  <div className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                    <Image src="/images/icons/diamond.svg" alt="Gemstone" width={18} height={18} className="grayscale opacity-70" />
                    Gemstone <Info size={14} className="text-gray-400 cursor-pointer ml-auto" />
                  </div>
                  
                  <div className="flex gap-10 md:gap-16 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Labels Column */}
                    <div className="space-y-3 shrink-0">
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Color :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Shape :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Quantity :</div>
                      <div className="text-sm text-gray-500 font-medium h-5 flex items-center">Carat :</div>
                    </div>
                    
                    {/* Values Columns */}
                    {activeVariant.metafields.gemstones.map((g, i) => (
                      <div key={`gem-col-${i}`} className="space-y-3 shrink-0">
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap uppercase">{g.color || "-"}</div>
                        <div className="text-sm font-semibold h-5 flex items-center uppercase text-gray-900 whitespace-nowrap">{mapShapeCode(g.shape) || g.shape || "-"}</div>
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap">{g.pieces || "1"}pcs</div>
                        <div className="text-sm font-semibold h-5 flex items-center text-gray-900 whitespace-nowrap">{g.weight || "0"}ct</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-gray-400 italic mt-2">
                * Our products are handcrafted and personalised for your delight, hence a weight variance is expected.
              </p>
            </div>

            <div ref={productDetailsRef}>
              <PriceSavingsDetails priceBreakup={priceBreakup?.price_breakup}/>
            </div>

            {priceBreakup?.price_breakup?.total_savings && priceBreakup?.price_breakup?.total_savings !== "₹0" && (
              <div className="mt-4 flex justify-between items-center bg-success/8 border border-success rounded-xl p-5">
                <span className="text-base font-bold text-gray-900 uppercase tracking-tight">Save on this jewelry</span>
                <span className="text-lg font-bold text-success">{priceBreakup.price_breakup.total_savings}</span>
              </div>
            )}

            {/* Certification */}
            {!isGoldCoin && (
              <div className="pt-6">
                <div className="bg-gray-50 border border-gray-100 rounded-xl ps-4 pe-16 py-4">
                  <div className="flex items-center gap-2 text-base font-semibold text-black mb-4">
                     Certified Quality Guaranteed.
                  </div>
                  <div className="flex items-start justify-between gap-4 xl:flex-nowrap flex-wrap">
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
          </div>
        </div>
      </div>
      <LuxuryMarquee prop={["bg-primary", "text-white", "mt-10", "text-md", "font-semibold"]}/>
      <ProductStory description={product.description}/>  
      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
        <StyledByLucira/>
      </Suspense>
      <FeaturedIn/>
      <OurProcess/>
      <div ref={reviewsRef}>
        <CustomerReviews 
          reviews={product.reviews} 
          productId={product.shopifyId} 
          productTitle={product.title}
          productImage={getValidSrc(product.image)}
          productHandle={product.handle}
        />
      </div>
      {matchingProducts.length > 0 && (
        <ProductSlider 
          title="From the Same Collection" 
          subtitle="Discover matching pieces that perfectly complement one another"
          products={matchingProducts}
        />
      )}
      <FAQSection/>
      <ProductSlider
        title={recentlyViewedState?.title || "Recently Viewed"}
        products={Array.isArray(recentlyViewedState?.products) && recentlyViewedState.products.length > 0 ? recentlyViewedState.products.slice(0, 12) : undefined}
        preservePriceOnColorChange={true}
      />
      {!isGoldCoin && <DiamondComparison/>}      
      <ExploreOtherRings />
      <CategorySlider />      
      <FindLuciraStore 
        pincode={pincode}
        setPincode={setPincode}
        handlePincodeCheck={handlePincodeCheck}
        checkingPincode={checkingPincode}
        deliveryInfo={deliveryInfo}
        availableStores={availableStores}
        product={product}
        activeVariant={activeVariant}
      />
      <JoinLuciraCommunity/>

      {isDesktop ? (
        <MobileSheet
          isOpen={isStoreDrawerOpen}
          onClose={() => setIsStoreDrawerOpen(false)}
          detents={[0.9, 0.5]}
        >
          <MobileSheet.Container className="z-[9999]">
            <MobileSheet.Header />
                <MobileSheet.Content>
                  <div className="h-[100dvh]">
                    <div className="flex items-center justify-between px-4 pb-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold">Store Availability</h2>
                      <button onClick={() => setIsStoreDrawerOpen(false)} className="p-2">
                        <X size={20} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="space-y-6  overflow-y-auto h-full">
                    {availableStores.length > 0 ? (
                      availableStores.map((store) => (
                        <div key={store.id || store.shopifyId} className="border border-gray-100 rounded-xl p-5 space-y-4 bg-gray-50/50">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg">{getStoreDisplayName(store.name)}</h3>
                              {store.distance !== null && (
                                <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                                  <MapPin size={14} />
                                  {Math.round(store.distance)} Km away
                                </div>
                              )}
                            </div>
                            {store.isInStock ? (
                              <div className="bg-[#E3F5E0] text-black px-3 py-1 rounded-full flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-[#76D168] rounded-full"></div>
                                <span className="text-xs font-bold uppercase">In Stock</span>
                              </div>
                            ) : (
                              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-100">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                <span className="text-xs font-bold uppercase">Ships to Store</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                              <MapPin size={18} className="shrink-0 text-gray-400 mt-0.5" />
                              <p className="leading-relaxed font-medium">{store.address1 || store.address}, {store.city}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <Phone size={18} className="shrink-0 text-gray-400" />
                              <p className="font-medium">{store.phone || "+91 91724 99912"}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <Package size={18} className="shrink-0 text-gray-400" />
                              <p className="font-medium">Ready for pickup in 2-4 hours</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="outline" className="font-bold h-11 rounded-lg border-gray-200" asChild>
                              <a href={`tel:${store.phone || "+919172499912"}`}>CALL STORE</a>
                            </Button>
                            <Button className="font-bold h-11 rounded-lg">
                              DIRECTIONS
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Store className="text-gray-300" size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">No Stores with Stock</p>
                        <p className="text-sm text-gray-500">This design is currently not available in any nearby stores.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </MobileSheet.Content>
          </MobileSheet.Container>
          <MobileSheet.Backdrop />
        </MobileSheet>
          ) : (
            <Sheet open={isStoreDrawerOpen} onOpenChange={setIsStoreDrawerOpen}>
            <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <SheetTitle className="text-lg font-bold">Store Availability</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {availableStores.length > 0 ? (
                    availableStores.map((store) => (
                      <div key={store.id || store.shopifyId} className="border border-gray-100 rounded-xl p-5 space-y-4 bg-gray-50/50">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg">{getStoreDisplayName(store.name)}</h3>
                            {store.distance !== null && (
                              <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                                <MapPin size={14} />
                                {Math.round(store.distance)} Km away
                              </div>
                            )}
                          </div>
                          {store.isInStock ? (
                            <div className="bg-[#E3F5E0] text-black px-3 py-1 rounded-full flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-[#76D168] rounded-full"></div>
                              <span className="text-xs font-bold uppercase">In Stock</span>
                            </div>
                          ) : (
                            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-100">
                              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                              <span className="text-xs font-bold uppercase">Ships to Store</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-start gap-3 text-sm text-gray-600">
                            <MapPin size={18} className="shrink-0 text-gray-400 mt-0.5" />
                            <p className="leading-relaxed font-medium">{store.address1 || store.address}, {store.city}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone size={18} className="shrink-0 text-gray-400" />
                            <p className="font-medium">{store.phone || "+91 91724 99912"}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Package size={18} className="shrink-0 text-gray-400" />
                            <p className="font-medium">Ready for pickup in 2-4 hours</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button variant="outline" className="font-bold h-11 rounded-lg border-gray-200" asChild>
                            <a href={`tel:${store.phone || "+919172499912"}`}>CALL STORE</a>
                          </Button>
                          <Button className="font-bold h-11 rounded-lg">
                            DIRECTIONS
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Store className="text-gray-300" size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">No Stores with Stock</p>
                        <p className="text-sm text-gray-500">This design is currently not available in any nearby stores.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
    </div>
  );
}

function DiamondDetail({ img, shape, pcs, carat, quality }) {
  return (
    <div className="flex-1 ps-6 pe-6 first:ps-0 last:pe-0 flex flex-col items-start">
      <div className="flex justify-start w-full mb-5">
        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-white">
          <Image src={getValidSrc(img)} alt={`${shape} diamond shape`} width={40} height={40} className="object-cover" />
        </div>
      </div>
      <div className="space-y-2 text-12px w-full">
        {quality && <div className="flex justify-between"><span className="w-18">Quality:</span><span className="font-medium">{quality}</span></div>}
        <div className="flex justify-between"><span className="w-18">Shape:</span><span className="font-medium">{shape}</span></div>
        <div className="flex justify-between"><span className="w-18">No. of Pcs:</span><span className="font-medium">{pcs}</span></div>
        <div className="flex justify-between"><span className="w-18">Carat:</span><span className="font-medium">{carat}</span></div>
      </div>
    </div>
  );
}

function ExploreCard({ title, description, action, img, url }) {
  return (
    <div className="bg-[#F9F9F9] border border-gray-100 rounded-lg p-3 md:p-4 flex items-start gap-3 md:gap-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-16 shrink-0 rounded-md bg-gray-200 relative overflow-hidden shadow-sm">
        {img && ( <Image src={getValidSrc(img)} alt={title} fill className="object-cover" /> )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm md:text-base font-semibold leading-tight"> {title} </p>
        <p className="text-xs md:text-sm font-medium leading-[1.5] text-gray-700"> {description} </p>
        <Button variant="link" className=" p-0 m-0 h-auto w-fit text-sm font-bold underline underline-offset-4 justify-start" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer"> 
            {action}
          </a>
        </Button>
      </div>
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