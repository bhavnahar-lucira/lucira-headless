"use client";

import { useState, useEffect, useCallback, useMemo, use, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, XIcon, Hammer, Filter as FilterIcon, Loader2, Search } from "lucide-react";
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

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const query = searchParams.get("q") || "";
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

  // 1. Fetch Filters
  const { data: availableFilters = {}, isPlaceholderData: isFiltersUpdating, isLoading: filtersLoading } = useQuery({
    queryKey: ["search-filters", query, filterParamsString],
    queryFn: async () => {
      const res = await fetch(`/api/products/filters?q=${encodeURIComponent(query)}&${filterParamsString}`);
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
    enabled: !!query,
  });

  // 2. Infinite Query for Products
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ["search-products", query, filterParamsString],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams(filterParamsString);
      
      const isInitialFetch = pageParam === 1;
      const currentLimit = (isInitialFetch && initialPage > 1) ? initialPage * limit : limit;
      const currentPage = isInitialFetch ? 1 : pageParam;

      p.set("page", currentPage.toString());
      p.set("limit", currentLimit.toString());
      
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&${p.toString()}`);
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      if (page < totalPages) return page + 1;
      return undefined;
    },
    enabled: !!query,
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
    const allProducts = data?.pages.flatMap((page) => page.products) || [];
    // Deduplicate by shopifyId or id
    const uniqueMap = new Map();
    allProducts.forEach(p => {
      const key = p.shopifyId || p.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, p);
      }
    });
    return Array.from(uniqueMap.values());
  }, [data]);

  const totalCount = data?.pages[0]?.pagination.total || 0;
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
    const queryStr = params.toString();
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
    scrollToTop();
  };

  const clearAllFilters = () => {
    router.push(`${pathname}?q=${encodeURIComponent(query)}`, { scroll: false });
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
    const queryStr = p.toString();
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
    scrollToTop();
  };

  const activeSort = searchParams.get("sort") || "best_selling";

  const renderGridItems = () => {
    const items = [];
    products.forEach((prod, idx) => {
      items.push(
        <ProductCard
          key={prod.shopifyId || prod.id || `search-prod-${idx}`}
          product={prod}
        />
      );
    });

    if (isFetchingNextPage) {
      for (let i = 0; i < 3; i++) {
        items.push(<ProductCardSkeleton key={`skeleton-next-${i}`} />);
      }
    }
    return items;
  };

  const isInitialLoading = productsLoading && products.length === 0;
  const showInitialSkeleton = isInitialLoading || (initialPage > 1 && products.length < (initialPage - 1) * limit);

  return (
    <div className="min-h-screen bg-white mt-3">
      {/* Search Header */}
      <div className="w-full">
        <div className="container-main mx-auto px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-400">
                  Search Results
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="bg-[#F9F9F9] py-12">
          <div className="container-main mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Results for "{query}"
            </h1>
            <p className="text-gray-600">
              {productsLoading ? "Searching..." : `Showing ${totalCount} products found for your request.`}
            </p>
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
                <div className={`space-y-3 px-4 ${isFiltersUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="flex justify-between items-center border-b">
                    <h3 className="font-semibold mb-3 font-black uppercase tracking-widest text-sm">Filters</h3>
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
                      <div className={`space-y-4 ${isFiltersUpdating ? "opacity-50 pointer-events-none" : ""}`}>
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select 
                  value={activeSort} 
                  onChange={(e) => handleSort(e.target.value)} 
                  className="text-sm border rounded-md px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-black"
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
          </div>

          {/* Products Grid */}
          {showInitialSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {renderGridItems()}
              </div>

              <div 
                ref={loadMoreRef} 
                className="w-full flex justify-center items-center py-10"
              >
                {isFetchingNextPage ? (
                  null
                ) : hasNextPage ? (
                  <div className="h-10" /> 
                ) : (
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    End of results
                  </p>
                )}
              </div>
            </>
          ) : !productsLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Search size={48} className="text-gray-300" strokeWidth={1} />
              </div>
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-gray-500 max-w-md">
                We couldn't find any products matching your search. Try adjusting your keywords or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
