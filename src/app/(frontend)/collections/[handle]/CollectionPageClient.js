"use client";

import { useState, useEffect, useCallback, useMemo, use, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, XIcon, ChevronsDown, Hammer, Filter as FilterIcon, LayoutDashboard, ShoppingBag, Loader2 } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "best_selling", label: "Best Selling" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "az", label: "A to Z" },
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

  // Create a memoized version of searchParams without the 'page' for the queryKey
  const filterParamsString = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    return p.toString();
  }, [searchParams]);

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

  // 2. Fetch Filters
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

  const displayTitle = collection.title || (handle === "all" ? "All Products" : handle.replace(/-/g, " "));

  // Show full skeleton ONLY on the very first load of the page
  // After that, we keep the existing data visible while re-fetching
  const isInitialLoading = productsLoading && products.length === 0;
  const showInitialSkeleton = isInitialLoading || (initialPage > 1 && products.length < (initialPage - 1) * limit);

  return (
    <div className="min-h-screen bg-white mt-3">
      {/* Collection Header */}
      <div className="w-full">
        {/* Breadcrumb */}
        <div className="container-main mx-auto px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/collections/all">Collections</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize text-gray-400">
                  {displayTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
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
      </div>

      <div className="flex gap-12 py-6 max-w-350 mx-auto">
        {/* ================= FILTERS SIDEBAR ================= */}
        <div className="hidden lg:block w-78 shrink-0">
          <div className="sticky top-5 self-start h-fit">
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
                      <div key={groupKey} className="border-b mb-0">                     
                          <button
                            onClick={() => toggleFilterExpand(groupKey)}
                            className="w-full flex items-center justify-between py-5 hover:opacity-70 transition-opacity hover:cursor-pointe"
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
          <div className="flex gap-4 items-center justify-between sticky top-0 bg-white z-20 py-4">
            <div className="flex gap-3 items-center">
              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <FilterIcon size={16} className="mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                    {filtersLoading && Object.keys(availableFilters).length === 0 ? (
                      <FilterSidebarSkeleton />
                    ) : (
                      <div className={`space-y-4 ${filtersLoading ? "opacity-50 pointer-events-none" : ""}`}>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs w-full">
                          Clear All
                        </Button>
                        {Object.entries(availableFilters).map(([groupKey, options]) => {
                          const isExpanded = expandedFilters[groupKey] ?? false;

                          return (
                            <div key={groupKey} className="border-b pb-4">
                              <div className="flex items-center justify-between py-2">
                                <button
                                  onClick={() => toggleFilterExpand(groupKey)}
                                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                                >
                                  <h4 className="font-medium text-sm capitalize">{groupKey}</h4>
                                  <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-300 ${
                                      isExpanded ? "rotate-0" : "rotate-180"
                                    }`}
                                  />
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="space-y-2 mt-3">
                                  {Array.isArray(options) &&
                                    options.map((option) => {
                                      const isSelected = searchParams.getAll(option.urlKey).includes(option.value);

                                      return (
                                        <div key={option.value} className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`m-${groupKey}-${option.value}`}
                                            checked={!!isSelected}
                                            onChange={() => toggleFilter(option.urlKey, option.value)}
                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                          />
                                          <label
                                            htmlFor={`m-${groupKey}-${option.value}`}
                                            className="text-sm cursor-pointer flex-1 flex justify-between"
                                          >
                                            <span>{option.label}</span>
                                            <span className="text-xs text-gray-500">{option.count}</span>
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
                </SheetContent>
              </Sheet>

              <span className="text-sm text-gray-500">
                {products.length}/{totalCount} products
              </span>
            </div>

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
          </div>

          {/* Applied Filters Badges */}
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

          {/* Products Grid */}
          {showInitialSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {Array.from({ length: initialPage > 1 ? initialPage * limit : 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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
    </div>
  );
}
