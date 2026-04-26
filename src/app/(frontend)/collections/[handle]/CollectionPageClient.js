"use client";

import { useState, useEffect, useCallback, useMemo, use, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sheet } from "react-modal-sheet";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, XIcon, ChevronsDown, Hammer, Filter as FilterIcon, LayoutDashboard, ShoppingBag, Loader2, ListFilter, ArrowUpDown, LayoutGrid, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { pushProductImpression, formatGtmPrice } from "@/lib/gtm";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SORT_OPTIONS = [
  { value: "best_selling", label: "Best selling" },
  { value: "discount_desc", label: "Discount: High to Low" },
  { value: "created_at_desc", label: "Date: New to Old" },
  { value: "created_at_asc", label: "Date: Old to New" },
  { value: "price_low_high", label: "Price, low to high" },
  { value: "price_high_low", label: "Price, high to low" },
  { value: "az", label: "Alphabetically, A-Z" },
];

const FilterSidebarSkeleton = () => (
  <div className="space-y-6 px-4 animate-pulse">
    <div className="flex justify-between items-center border-b pb-3">
      <div className="h-4 w-20 bg-gray-200 rounded" />
      <div className="h-3 w-12 bg-gray-100 rounded" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="border-b pb-5">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-100 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-gray-100 rounded" />
              <div className="h-3 w-32 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function CollectionPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const handle = params?.handle || "all";
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = 19; 

  const [expandedFilters, setExpandedFilters] = useState({ "In Store Available": true });
  const loadMoreRef = useRef(null);

  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [activeMobileGroup, setActiveMobileGroup] = useState(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  // Create a memoized version of searchParams without the 'page' for the queryKey
  const filterParamsString = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  // Fetch Filters
  const { data: availableFilters = {}, isPlaceholderData: isFiltersUpdating, isLoading: filtersLoading } = useQuery({
    queryKey: ["filters", handle, filterParamsString],
    queryFn: async () => {
      const res = await fetch(`/api/products/filters?handle=${handle}&${filterParamsString}`);
      const data = await res.json();
      
      const sortedData = {};
      Object.entries(data || {}).forEach(([groupKey, options]) => {
        sortedData[groupKey] = [...options].sort((a, b) => {
          const aLabel = a.label?.toString() || "";
          const bLabel = b.label?.toString() || "";
          const aNum = parseFloat(aLabel);
          const bNum = parseFloat(bLabel);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return aLabel.localeCompare(bLabel, undefined, { numeric: true, sensitivity: 'base' });
        });
      });
      return sortedData;
    },
    placeholderData: (previousData) => previousData,
  });

  // Set initial active mobile group when filters are loaded
  useEffect(() => {
    if (Object.keys(availableFilters).length > 0 && !activeMobileGroup) {
      setActiveMobileGroup(Object.keys(availableFilters)[0]);
    }
  }, [availableFilters, activeMobileGroup]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(availableFilters).forEach((options) => {
      options.forEach((opt) => {
        if (searchParams.getAll(opt.urlKey).includes(opt.value)) {
          count++;
        }
      });
    });
    return count;
  }, [availableFilters, searchParams]);

  // 1. Fetch Collection Metadata
  const { data: collection } = useQuery({
    queryKey: ["collection-metadata", handle],
    queryFn: async () => {
      const res = await fetch(`/api/collection?handle=${handle}&limit=1`);
      const data = await res.json();
      return {
        title: data.collection?.title || handle.replace(/-/g, " "),
        description: data.collection?.description || "Find the perfect piece for your special moment."
      };
    },
    initialData: { title: "", description: "" }
  });

  // 3. Infinite Query for Products
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ["products", handle, filterParamsString],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams(filterParamsString);
      
      const isInitialFetch = pageParam === 1;
      const currentLimit = (isInitialFetch && initialPage > 1) ? initialPage * limit : limit;
      const currentPage = isInitialFetch ? 1 : pageParam;

      p.set("page", currentPage.toString());
      p.set("limit", currentLimit.toString());
      
      const res = await fetch(`/api/products/search?handle=${handle}&${p.toString()}`);
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      if (page < totalPages) return page + 1;
      return undefined;
    }
  });

  // Infinite scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = useMemo(() => {
    const allProducts = data?.pages.flatMap((page) => page?.products || []) || [];
    // Deduplicate by shopifyId or id to prevent "duplicate key" errors
    const uniqueMap = new Map();
    allProducts.forEach(p => {
      if (!p) return;
      const key = p.shopifyId || p.id;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, p);
      }
    });
    return Array.from(uniqueMap.values());
  }, [data]);

  //gtm product impression tracking
  const trackedImpressions = useRef(new Set());
  useEffect(() => {
    if (products.length > 0) {
      const newProducts = products.filter(p => {
        const id = p.shopifyId || p.id;
        if (!trackedImpressions.current.has(id)) {
          trackedImpressions.current.add(id);
          return true;
        }
        return false;
      });

      if (newProducts.length > 0) {
        // Helper to extract numeric ID from Shopify GID
        const getNumericId = (gid) => {
          if (!gid) return 0;
          if (typeof gid === 'number') return gid;
          const match = String(gid).match(/\d+$/);
          return match ? Number(match[0]) : 0;
        };

        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";

        const impressionData = newProducts.map((prod, idx) => {
          const sellingPrice = Number(prod.price || 0);
          const originalPrice = Number(prod.compare_price || sellingPrice);

          return {
            item_id: String(getNumericId(prod.shopifyId || prod.id)),
            item_name: prod.title,
            item_sku: prod.variants?.[0]?.sku || "",
            category: handle || "",
            item_url: `${currentOrigin}/products/${prod.handle}`,
            price: originalPrice,
            offer_price: sellingPrice,
            index: trackedImpressions.current.size - newProducts.length + idx + 1
          };
        });
        pushProductImpression(impressionData);
      }
    }
  }, [products, handle]);

  const totalCount = data?.pages?.[0]?.pagination?.total || 0;
  const reachedEnd = products.length >= totalCount && totalCount > 0;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFilter = (urlKey, value) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(urlKey);

    if (currentValues.includes(value)) {
      const remaining = currentValues.filter((v) => v !== value);
      params.delete(urlKey);
      remaining.forEach((v) => params.append(urlKey, v));
    } else {
      params.append(urlKey, value);
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToTop();
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
    scrollToTop();
  };

  const toggleFilterExpand = (groupKey) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleSort = (value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "best_selling") {
      p.delete("sort");
    } else {
      p.set("sort", value);
    }
    p.delete("page");
    const query = p.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToTop();
  };

  const activeSort = searchParams.get("sort") || "best_selling";

  const renderGridItems = () => {
    const items = [];
    const basePositions = [3, 7];

    data?.pages.forEach((pageData, pageIdx) => {
      if (!pageData || !pageData.products) return;
      const isFirstPage = pageIdx === 0;
      
      pageData.products.forEach((prod, prodIdx) => {
        if (!prod) return;
        const posOnPage = prodIdx + 1;

        if (isFirstPage && basePositions.includes(posOnPage)) {
          items.push(
            <div key={`inpage-${posOnPage}`} className="overflow-hidden rounded-lg">
              <Image
                src="/images/inpage.jpg"
                alt="Promo"
                width={800}
                height={400}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          );
        }

        items.push(
          <ProductCard
            key={prod.shopifyId || prod.id || `prod-${pageIdx}-${prodIdx}`}
            product={prod}
            collectionHandle={handle}
          />
        );
      });
    });

    // Add skeletons at the end if we are fetching the next page
    if (isFetchingNextPage) {
      for (let i = 0; i < 3; i++) {
        items.push(<ProductCardSkeleton key={`skeleton-next-${i}`} />);
      }
    }

    return items;
  };

  const displayTitle = isMobile 
    ? (handle === "all" ? "All Products" : handle.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    : (collection.title || (handle === "all" ? "All Products" : handle.replace(/-/g, " ")));

  // Show full skeleton ONLY on the very first load of the page
  // After that, we keep the existing data visible while re-fetching
  const isInitialLoading = productsLoading && products.length === 0;
  const showInitialSkeleton = isInitialLoading || (initialPage > 1 && products.length < (initialPage - 1) * limit);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {isMobile ? (
        <div className="w-full">
          {/* Mobile Breadcrumb */}
          <div className="container-main mx-auto pt-2 px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="hover:text-[#35255F] transition-colors">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/collections/all" className="hover:text-[#35255F] transition-colors">Collections</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#35255F]">
                    {displayTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Mobile Banner */}
          <div className="w-full relative h-[160px]">
            <Image 
              src="/images/collection/category-banner.jpg" 
              alt={displayTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF5F1] overflow-hidden">
          <div className="container-main flex flex-col md:flex-row items-center">
            {/* Left Content */}
            <div className="flex-1 px-6 py-8 md:py-12 md:pr-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 capitalize">
                {displayTitle}
              </h1>
              <p className="text-gray-700 text-sm md:text-base mb-8 max-w-xl">
                {collection.description || "Find the perfect piece for your special moment."}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-6 text-xs md:text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Image src="/images/product/shipping.svg" alt="Shipping" width={20} height={20} className="md:w-6 md:h-6" />
                  <span>Free & secure shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/images/product/certified.svg" alt="Certified" width={20} height={20} className="md:w-6 md:h-6" />
                  <span>100% value guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/images/product/return.svg" alt="Return" width={20} height={20} className="md:w-6 md:h-6" />
                  <span>15-day free returns</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative w-full h-57.5">
              <Image 
                src="/images/category-banner.jpg" 
                alt={displayTitle}
                fill
                className="object-cover"
              />
              {/* Badges Overlay */}
              <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-6">
                <div className="bg-white p-2 pt-5 rounded-xl shadow-md text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Image src="/images/icons/diamond.svg" alt="Diamond" width={28} height={28} className="brightness-0" />
                  </div>
                  <div className="text-xs font-semibold">Flat</div>
                  <div className="font-bold text-base">20% OFF</div>
                  <div className="text-[10px] font-semibold whitespace-nowrap">On Diamond Prices</div>
                </div>
                <div className="bg-white p-2 pt-5 rounded-xl shadow-md text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Hammer size={28} className="text-black" strokeWidth={1.5} />
                  </div>
                  <div className="text-xs font-semibold">Up To</div>
                  <div className="font-bold text-base">100% OFF</div>
                  <div className="text-[10px] font-semibold whitespace-nowrap">On Making Charges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={isMobile ? "" : "flex xl:gap-12 lg:gap-6 py-6 container-main mx-auto"}>
        {/* ================= FILTERS SIDEBAR ================= */}
        <div className="hidden lg:block xl:w-78 lg:w-60 shrink-0">
          <div className="sticky top-19 self-start h-fit">
            <ScrollArea className="w-full h-[calc(100vh-5rem)]">
              {filtersLoading && Object.keys(availableFilters).length === 0 ? (
                <FilterSidebarSkeleton />
              ) : (
                <div className={`space-y-3 px-4 ${filtersLoading ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="flex justify-between items-center border-b">
                    <h3 className="font-semibold mb-3 uppercase tracking-widest text-sm">Filters</h3>
                    <button 
                      onClick={clearAllFilters} 
                      className="text-[10px] font-bold uppercase text-zinc-400 hover:text-black mb-3"
                    >
                      Clear All
                    </button>
                  </div>

                  {Object.entries(availableFilters || {}).map(([groupKey, options]) => {
                    const isExpanded = expandedFilters[groupKey] ?? false;
                    return (
                      <div key={groupKey} className="border-b mb-0 border-gray-200">                     
                          <button
                            onClick={() => toggleFilterExpand(groupKey)}
                            className="w-full flex items-center justify-between py-5 hover:opacity-70 transition-opacity"
                          >
                            <h4 className="font-medium text-sm capitalize">{groupKey}</h4>
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-0" : "rotate-180"
                              }`}
                            />
                          </button>

                        {isExpanded && (
                          <div className="space-y-4 my-2 pb-5">
                            {Array.isArray(options) &&
                              options.map((option) => {
                                const isSelected = searchParams.getAll(option.urlKey).includes(option.value);
                                return (
                                  <div key={option.value} className="flex items-center gap-3 text-sm">
                                    <input
                                      type="checkbox"
                                      id={`${groupKey}-${option.value}`}
                                      checked={!!isSelected}
                                      onChange={() => toggleFilter(option.urlKey, option.value)}
                                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                    />

                                    <label
                                      htmlFor={`${groupKey}-${option.value}`}
                                      className="flex-1 cursor-pointer flex justify-between"
                                    >
                                      <span>{option.label}</span>
                                      <span className="text-gray-400 text-xs">
                                        ({option.count})
                                      </span>
                                    </label>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* ================= PRODUCTS SECTION ================= */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className={`flex gap-4 items-center justify-between sticky top-0 bg-white z-20 ${isMobile ? "py-5 border-b border-gray-50 px-4" : "py-4"}`}>
            <div className={isMobile ? "flex items-baseline gap-2.5" : "flex gap-3 items-center"}>
              {isMobile ? (
                <>
                  <h2 className="text-lg font-bold text-[#35255F] capitalize leading-none">
                    {displayTitle}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {totalCount} Designs
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  {products.length}/{totalCount} products
                </span>
              )}
            </div>

            {!isMobile && (
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select 
                    value={activeSort} 
                    onChange={(e) => handleSort(e.target.value)} 
                    className="text-sm border rounded-md px-3 py-2 bg-white"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Applied Filters Badges */}
          {!isMobile && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {Object.entries(availableFilters).map(([groupKey, options]) => 
                options.filter(opt => searchParams.getAll(opt.urlKey).includes(opt.value)).map((opt) => (

                  <Badge
                    key={`${groupKey}-${opt.value}`}
                    variant="secondary"
                    className="bg-[#FFF5F1] text-black hover:bg-[#FFE4D9] border-none px-3 py-1 rounded-full flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleFilter(opt.urlKey, opt.value)}
                  >
                    <span className="text-xs font-medium">{opt.label.split(" (")[0]}</span>
                    <XIcon className="size-3" />
                  </Badge>
                ))
              )}
              {Object.entries(availableFilters).some(([groupKey, options]) => 
                options.some(opt => searchParams.getAll(opt.urlKey).includes(opt.value))
              ) && (

                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-black font-medium ml-2"
                >
                  Remove all
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          {showInitialSkeleton ? (
            <div className={`grid gap-6 mt-4 ${isMobile ? "grid-cols-2 gap-4 px-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {Array.from({ length: initialPage > 1 ? initialPage * limit : 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`grid mt-4 ${isMobile ? "grid-cols-2 gap-4 px-2" : "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 gap-6"}`}>
                {renderGridItems()}
              </div>

              {/* Load More Trigger */}
              <div 
                ref={loadMoreRef} 
                className="w-full flex justify-center items-center py-10"
              >
                {isFetchingNextPage ? (
                  null // Skeletons are already rendered in grid via renderGridItems
                ) : hasNextPage ? (
                  <div className="h-10" /> 
                ) : (
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    You've reached the end
                  </p>
                )}
              </div>
            </>
          ) : !productsLoading && (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile Filter Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-primary text-white flex justify-around items-center py-4 border-t border-white/10 px-4 gap-2">          
          <button 
            onClick={() => setIsSortSheetOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider border-r border-white/20"
          >
            <ArrowUpDown size={16} /> Sort
          </button>

          <button 
            onClick={() => setIsFilterSheetOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <SlidersHorizontal size={16} /> Filter 
            {activeFilterCount > 0 && (
              <span className="bg-[#FF69B4] text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Sort Sheet */}
      <Sheet 
        isOpen={isSortSheetOpen} 
        onClose={() => setIsSortSheetOpen(false)}
        snapPoints={[0, 1]}
        initialSnap={1}
      >
        <Sheet.Container className="!rounded-t-[24px] !h-auto max-h-[60vh] bottom-0">
          <Sheet.Header className="hidden" />
          <Sheet.Content className="bg-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <button onClick={() => setIsSortSheetOpen(false)} className="p-1">
                  <X size={20} className="text-black" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-widest">Sort By</h3>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto pb-10">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      handleSort(opt.value);
                      setIsSortSheetOpen(false);
                    }}
                    className={`w-full text-left py-4 px-4 rounded-lg transition-colors flex justify-between items-center ${
                      activeSort === opt.value ? "bg-[#FFF5F1] text-black font-bold" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {opt.label}
                    {activeSort === opt.value && <div className="w-2 h-2 rounded-full bg-[#35255F]" />}
                  </button>
                ))}
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsSortSheetOpen(false)} />
      </Sheet>

      {/* Filter Sheet */}
      <Sheet 
        isOpen={isFilterSheetOpen} 
        onClose={() => setIsFilterSheetOpen(false)}
        snapPoints={[0, 1]}
        initialSnap={1}
      >
        <Sheet.Container className="!rounded-t-none">
          <Sheet.Header className="hidden" />
          <Sheet.Content className="bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <button onClick={() => setIsFilterSheetOpen(false)} className="p-1">
                  <X size={20} className="text-black" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-widest">Filters</h3>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Groups */}
                <div className="w-[45%] bg-[#F8F7FF] border-r border-gray-100 overflow-y-auto">
                  {Object.entries(availableFilters).map(([groupKey]) => {
                    const count = availableFilters[groupKey].filter(opt => 
                      searchParams.getAll(opt.urlKey).includes(opt.value)
                    ).length;
                    
                    return (
                      <button
                        key={groupKey}
                        onClick={() => setActiveMobileGroup(groupKey)}
                        className={`w-full text-left px-4 py-5 text-[11px] font-figtree font-bold uppercase tracking-tight border-b border-gray-100 relative leading-tight ${
                          activeMobileGroup === groupKey ? "bg-white text-primary" : "text-gray-500"
                        }`}
                      >
                        {groupKey}
                        {count > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#35255F] text-white text-[9px] w-5 h-5 rounded-md flex items-center justify-center font-bold">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Options */}
                <div className="w-[55%] bg-white overflow-y-auto p-4">
                  {activeMobileGroup && availableFilters[activeMobileGroup] && (
                    <div className="space-y-6 pb-20">
                      {availableFilters[activeMobileGroup].map((option) => {
                        const isSelected = searchParams.getAll(option.urlKey).includes(option.value);
                        return (
                          <div 
                            key={option.value} 
                            className="flex items-center justify-between py-1 cursor-pointer group"
                            onClick={() => toggleFilter(option.urlKey, option.value)}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? (
                                <div className="w-4 h-4 bg-[#8A70FF] rounded flex items-center justify-center">
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-[#8A70FF]" />
                              )}
                              <span className={`text-[13px] ${isSelected ? "text-black font-semibold" : "text-gray-600"}`}>
                                {option.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">({option.count})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-gray-300 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={clearAllFilters}
                  className="py-4 px-2 text-[11px] font-black bg-accent text-white font-figtree uppercase tracking-[0.1em]"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="py-4 px-2 text-[11px] font-black bg-primary text-white font-figtree uppercase tracking-[0.1em]"
                >
                  APPLY FILTERS
                </button>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsFilterSheetOpen(false)} />
      </Sheet>
    </div>
  );
}
