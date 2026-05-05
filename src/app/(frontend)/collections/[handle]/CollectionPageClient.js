"use client";

import { useState, useEffect, useCallback, useMemo, use, useRef, Fragment } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sheet } from "react-modal-sheet";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, XIcon, ChevronsDown, Hammer, Filter as FilterIcon, LayoutDashboard, ShoppingBag, Loader2, ListFilter, ArrowUpDown, LayoutGrid, X, SlidersHorizontal, ChevronUp } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  // Price Filter State (Local for inputs)
  const [localPriceRange, setLocalPriceRange] = useState({
    min: searchParams.get("filter.v.price.gte") || "",
    max: searchParams.get("filter.v.price.lte") || ""
  });

  // Sync local state with URL (e.g. for Clear All or External Changes)
  useEffect(() => {
    setLocalPriceRange({
      min: searchParams.get("filter.v.price.gte") || "",
      max: searchParams.get("filter.v.price.lte") || ""
    });
  }, [searchParams]);

  const applyPriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (localPriceRange.min) params.set("filter.v.price.gte", localPriceRange.min);
    else params.delete("filter.v.price.gte");
    
    if (localPriceRange.max) params.set("filter.v.price.lte", localPriceRange.max);
    else params.delete("filter.v.price.lte");

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToTop();
  }, [localPriceRange, searchParams, pathname, router]);

  const resetPriceFilter = useCallback(() => {
    setLocalPriceRange({ min: "", max: "" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter.v.price.gte");
    params.delete("filter.v.price.lte");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToTop();
  }, [searchParams, pathname, router]);

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
        if (groupKey === "Price") {
          sortedData[groupKey] = options;
        } else if (Array.isArray(options)) {
          sortedData[groupKey] = [...options].sort((a, b) => {
            const aLabel = a.label?.toString() || "";
            const bLabel = b.label?.toString() || "";
            const aNum = parseFloat(aLabel);
            const bNum = parseFloat(bLabel);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return aLabel.localeCompare(bLabel, undefined, { numeric: true, sensitivity: 'base' });
          });
        }
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
    Object.entries(availableFilters).forEach(([groupKey, options]) => {
      if (groupKey === "Price") {
        if (searchParams.get("filter.v.price.gte") || searchParams.get("filter.v.price.lte")) {
          count++;
        }
      } else if (Array.isArray(options)) {
        options.forEach((opt) => {
          if (searchParams.getAll(opt.urlKey).includes(opt.value)) {
            count++;
          }
        });
      }
    });
    return count;
  }, [availableFilters, searchParams]);

  // 1. Fetch Collection Metadata from Shopify (Existing)
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

  // 2. Fetch Synced Collection Data from MongoDB (SEO & FAQ)
  const { data: dbCollection } = useQuery({
    queryKey: ["db-collection", handle],
    queryFn: async () => {
      const res = await fetch(`/api/collection/metadata?handle=${handle}`);
      const data = await res.json();
      return data.success ? data.collection : null;
    },
    enabled: !!handle
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

  const scrollToTop = () => {
    window.scrollTo(0, 0);
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

        const absoluteIndex = pageIdx * limit + prodIdx + 1;
        items.push(
          <ProductCard
            key={prod.shopifyId || prod.id || `prod-${pageIdx}-${prodIdx}`}
            product={prod}
            collectionHandle={handle}
            index={absoluteIndex}
          />
        );
      });
    });

    if (isFetchingNextPage) {
      items.push(
        <Fragment key="next-page-skeletons">
          <ProductCardSkeleton key="next-1" />
          <div className="hidden sm:block">
            <ProductCardSkeleton key="next-2" />
          </div>
          <div className="hidden lg:block">
            <ProductCardSkeleton key="next-3" />
          </div>
          <div className="hidden 2xl:block">
            <ProductCardSkeleton key="next-4" />
          </div>
        </Fragment>
      );
    }

    return items;
  };

  // Helper to render Shopify Rich Text JSON
  const renderShopifyRichText = (jsonString) => {
    if (!jsonString) return null;
    try {
      const data = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
      if (!data.children) return jsonString;

      return data.children.map((node, i) => {
        const renderChildren = (children) => 
          children?.map((child, j) => {
            if (child.type === "text") {
              return <span key={j} className={child.bold ? "font-bold" : ""}>{child.value}</span>;
            }
            if (child.type === "link") {
              return <a key={j} href={child.url} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">{renderChildren(child.children)}</a>;
            }
            return null;
          });

        switch (node.type) {
          case "heading":
            const HeadingTag = `h${node.level || 2}`;
            return (
              <HeadingTag key={i} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-gray-900 uppercase tracking-wider">
                {renderChildren(node.children)}
              </HeadingTag>
            );
          case "paragraph":
            return (
              <p key={i} className="mb-2 text-gray-600 leading-relaxed text-left">
                {renderChildren(node.children)}
              </p>
            );
          case "list":
            const ListTag = node.listType === "ordered" ? "ol" : "ul";
            return (
              <ListTag key={i} className={`mb-2 text-left space-y-2 ${node.listType === "ordered" ? "list-decimal pl-6" : "list-disc pl-6 text-gray-600"}`}>
                {node.children.map((item, k) => (
                  <li key={k}>{renderChildren(item.children)}</li>
                ))}
              </ListTag>
            );
          default:
            return null;
        }
      });
    } catch (e) {
      console.warn("Failed to parse rich text:", e);
      return jsonString;
    }
  };

  const displayTitle = isMobile 
    ? (handle === "all" ? "All Products" : handle.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    : (collection.title || (handle === "all" ? "All Products" : handle.replace(/-/g, " ")));

  const isInitialLoading = productsLoading && products.length === 0;
  const showInitialSkeleton = isInitialLoading || (initialPage > 1 && products.length < (initialPage - 1) * limit);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {isMobile ? (
        <div className="w-full">
          <div className="container-main mx-auto pt-2 px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="hover:text-[#5a413f] transition-colors">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/collections/all" className="hover:text-[#5a413f] transition-colors">Collections</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#5a413f]">
                    {displayTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="w-full relative h-40">
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
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 capitalize">
                {displayTitle}
              </h1>
              <p className="text-gray-700 text-sm md:text-base mb-8 max-w-xl">
                {collection.description || "Find the perfect piece for your special moment."}
              </p>
              <div className="flex flex-wrap gap-6 text-xs md:text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Group_f573cba5-716e-47c9-baeb-8303cf3ba2e8.png" alt="Shipping" width={20} height={20} className="md:w-6" />
                  <span>Free & secure shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/streamline_star-badge_1.png" alt="Certified" width={20} height={20} className="md:w-6" />
                  <span>100% value guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/hugeicons_delivery-return-01.png" alt="Return" width={20} height={20} className="md:w-6" />
                  <span>15-day free returns</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative w-full h-57.5">
              <Image 
                src="/images/category-banner.jpg" 
                alt={displayTitle}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <div className={isMobile ? "" : "flex xl:gap-12 lg:gap-6 py-6 container-main mx-auto"}>
        {/* ================= FILTERS SIDEBAR ================= */}
        <div className="hidden lg:block xl:w-78 lg:w-60 shrink-0">
          <div className="sticky top-19 self-start h-fit">
            <ScrollArea className="w-full h-[calc(100dvh-5rem)]">
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
                    
                    if (groupKey === "Price") {
                      return (
                        <div key={groupKey} className="border-b mb-0 border-gray-200">
                          <button
                            onClick={() => toggleFilterExpand(groupKey)}
                            className="w-full flex items-center justify-between py-5 hover:opacity-70 transition-opacity"
                          >
                            <h4 className="font-medium text-sm capitalize">{groupKey}</h4>
                            <ChevronUp
                              size={18}
                              className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-0" : "rotate-180"
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="space-y-4 my-2 pb-5">
                              <p className="text-xs text-gray-500">
                                The highest price is ₹{new Intl.NumberFormat("en-IN").format(options.max || 0)}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                  <Input
                                    type="number"
                                    placeholder="From"
                                    value={localPriceRange.min}
                                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="pl-7 h-10 text-sm focus-visible:ring-black"
                                  />
                                </div>
                                <div className="relative flex-1">
                                  <Input
                                    type="number"
                                    placeholder="To"
                                    value={localPriceRange.max}
                                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="h-10 text-sm focus-visible:ring-black"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <Button 
                                  onClick={applyPriceFilter}
                                  className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 text-white rounded-md uppercase font-bold tracking-wider"
                                >
                                  Apply
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={resetPriceFilter}
                                  className="h-9 text-xs border-gray-200 hover:bg-gray-50 rounded-md uppercase font-bold tracking-wider px-3"
                                >
                                  Reset
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={groupKey} className="border-b mb-0 border-gray-200">                     
                          <button
                            onClick={() => toggleFilterExpand(groupKey)}
                            className="w-full flex items-center justify-between py-5 hover:opacity-70 transition-opacity"
                          >
                            <h4 className="font-medium text-sm capitalize">{groupKey}</h4>
                            <ChevronUp
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
          <div className={`flex gap-4 items-center justify-between sticky top-0 bg-white z-20 ${isMobile ? "py-5 border-b border-gray-50 px-4" : "py-4"}`}>
            <div className={isMobile ? "flex items-baseline gap-2.5" : "flex gap-3 items-center"}>
              {isMobile ? (
                <>
                  <h2 className="text-lg font-bold text-black capitalize leading-none">
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

          {!isMobile && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {Object.entries(availableFilters).map(([groupKey, options]) => (
                <Fragment key={groupKey}>
                  {groupKey === "Price" ? (
                    (searchParams.get("filter.v.price.gte") || searchParams.get("filter.v.price.lte")) && (
                      <Badge
                        variant="secondary"
                        className="bg-[#FFF5F1] text-black hover:bg-[#FFE4D9] border-none px-3 py-1 rounded-full flex items-center gap-2 cursor-pointer"
                        onClick={resetPriceFilter}
                      >
                        <span className="text-xs font-medium">
                          Price: {searchParams.get("filter.v.price.gte") ? `₹${searchParams.get("filter.v.price.gte")}` : "0"} - {searchParams.get("filter.v.price.lte") ? `₹${searchParams.get("filter.v.price.lte")}` : "Max"}
                        </span>
                        <XIcon className="size-3" />
                      </Badge>
                    )
                  ) : (
                    Array.isArray(options) && options.filter(opt => searchParams.getAll(opt.urlKey).includes(opt.value)).map((opt) => (
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
                </Fragment>
              ))}
              {(activeFilterCount > 0) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-black font-medium ml-2"
                >
                  Remove all
                </button>
              )}
            </div>
          )}

          {showInitialSkeleton ? (
            <div className={`grid gap-6 mt-4 ${isMobile ? "grid-cols-2 gap-4 px-2" : "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3"}`}>
              {Array.from({ length: initialPage > 1 ? initialPage * limit : 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`grid mt-4 ${isMobile ? "grid-cols-2 gap-4 px-2" : "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 gap-6"}`}>
                {renderGridItems()}
              </div>
              <div ref={loadMoreRef} className="w-full flex justify-center items-center py-10">
                {!hasNextPage && totalCount > 0 && (
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

      {/* SEO & FAQ Content from MongoDB */}
      {(dbCollection?.metafields?.["custom.seocontent"] || 
        dbCollection?.metafields?.["custom.seo_content"] || 
        dbCollection?.metafields?.["custom.faqquestion"] || 
        dbCollection?.metafields?.["custom.faq_section"] ||
        (dbCollection?.bestsellerProducts && dbCollection.bestsellerProducts.length > 0)) && (
        <div className="seo-content container-main py-12 md:py-20 border-t border-gray-100">
          <div className="w-full px-2 lg:px-6">
            
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
              {/* Bestseller Products (SEO Links) */}
              {dbCollection?.bestsellerProducts && dbCollection.bestsellerProducts.length > 0 && (
                <div className={`${(dbCollection.metafields["custom.faqquestion"] || dbCollection.metafields["custom.faq_section"]) ? "lg:w-1/2" : "w-full"} order-1`}>
                  <div className="plp-seo-links-section">
                    <h2 className="text-lg lg:text-2xl font-bold mb-5 text-left text-gray-900 uppercase tracking-widest">
                      Bestsellers
                    </h2>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      <div className="grid grid-cols-[auto_1fr_auto] bg-gray-50 border-b border-gray-200 px-6 py-4 gap-4">
                        <div className="w-12 h-6" /> {/* Spacer for image */}
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">PRODUCT NAME</h3>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">PRICE</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {dbCollection.bestsellerProducts.slice(0, 10).map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[auto_1fr_auto] px-6 py-4 hover:bg-gray-50/50 transition-colors items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden relative shrink-0 border border-gray-100">
                              {item.image ? (
                                <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-200">
                                  <ShoppingBag size={20} />
                                </div>
                              )}
                            </div>
                            <Link href={`/products/${item.handle}`} className="text-sm font-bold text-gray-900 hover:text-primary transition-colors truncate pr-4">
                              {item.title}
                            </Link>
                            <span className="text-sm font-black text-gray-900 text-right">
                              ₹{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                      Last Updated: {new Date(dbCollection.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {(dbCollection.metafields["custom.faqquestion"] || dbCollection.metafields["custom.faq_section"]) && (
                <div className={`${(dbCollection?.bestsellerProducts && dbCollection.bestsellerProducts.length > 0) ? "lg:w-1/2" : "w-full"} order-2 mb-16`}>
                  <h2 className="text-lg lg:text-2xl font-bold mb-5 text-left text-gray-900 uppercase tracking-widest">
                    FAQ
                  </h2>
                  <div className="w-full">
                    {(() => {
                      let questions = [];
                      let answers = [];

                      try {
                        const rawQ = dbCollection.metafields["custom.faqquestion"];
                        const rawA = dbCollection.metafields["custom.faqanswers"];

                        if (rawQ?.startsWith("[")) {
                          questions = JSON.parse(rawQ);
                        } else {
                          questions = (rawQ || "").split("•").filter(Boolean);
                        }

                        if (rawA?.startsWith("[")) {
                          answers = JSON.parse(rawA);
                        } else {
                          answers = (rawA || "").split("•").filter(Boolean);
                        }
                      } catch (e) {
                        console.error("FAQ parse error:", e);
                      }
                      
                      if (questions.length > 0) {
                        return (
                          <Accordion type="single" collapsible className="w-full">
                            {questions.map((q, idx) => (
                              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-gray-200">
                                <AccordionTrigger className="text-base lg:text-lg font-medium text-gray-900 hover:no-underline py-4">
                                  {q.trim()}
                                </AccordionTrigger>
                                {answers[idx] && (
                                  <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                                    {answers[idx].trim()}
                                  </AccordionContent>
                                )}
                              </AccordionItem>
                            ))}
                          </Accordion>
                        );
                      }
                      
                      if (dbCollection.metafields["custom.faq_section"]) {
                        return (
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="text-gray-600 text-sm leading-relaxed">
                              {dbCollection.metafields["custom.faq_section"]}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* SEO Section */}
            {(dbCollection.metafields["custom.seocontent"] || dbCollection.metafields["custom.seo_content"]) && (
              <div className="prose prose-sm md:prose-base max-w-none mt-8 border-t border-gray-100 pt-12">
                <div className="text-gray-600 leading-loose">
                  {renderShopifyRichText(dbCollection.metafields["custom.seocontent"] || dbCollection.metafields["custom.seo_content"])}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Filter Bar & Sheets */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-primary text-white flex justify-around items-center py-4 border-t border-white/10 px-4 gap-2">          
          <button onClick={() => setIsSortSheetOpen(true)} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider border-r border-white/20">
            <ArrowUpDown size={16} /> Sort
          </button>
          <button onClick={() => setIsFilterSheetOpen(true)} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
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
      <Sheet isOpen={isSortSheetOpen} onClose={() => setIsSortSheetOpen(false)} snapPoints={[0, 1]} initialSnap={1}>
        <Sheet.Container className="!rounded-t-[24px] !h-auto max-h-[60vh] bottom-0">
          <Sheet.Header className="hidden" />
          <Sheet.Content className="bg-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <button onClick={() => setIsSortSheetOpen(false)} className="p-1"><X size={20} className="text-black" /></button>
                <h3 className="text-sm font-bold uppercase tracking-widest">Sort By</h3>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto pb-10">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { handleSort(opt.value); setIsSortSheetOpen(false); }}
                    className={`w-full text-left py-4 px-4 rounded-lg transition-colors flex justify-between items-center ${activeSort === opt.value ? "bg-[#FFF5F1] text-black font-bold" : "hover:bg-gray-50 text-gray-700"}`}>
                    {opt.label}
                    {activeSort === opt.value && <div className="w-2 h-2 rounded-full bg-[#5a413f]" />}
                  </button>
                ))}
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsSortSheetOpen(false)} />
      </Sheet>

      {/* Filter Sheet */}
      <Sheet isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)} snapPoints={[0, 1]} initialSnap={1}>
        <Sheet.Container className="!rounded-t-none">
          <Sheet.Header className="hidden" />
          <Sheet.Content className="bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <button onClick={() => setIsFilterSheetOpen(false)} className="p-1"><X size={20} className="text-black" /></button>
                <h3 className="text-sm font-bold uppercase tracking-widest">Filters</h3>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-[45%] bg-[#FEF5F1] border-r border-gray-100 overflow-y-auto">
                  {Object.entries(availableFilters).map(([groupKey]) => {
                    let count = 0;
                    if (groupKey === "Price") {
                      if (localPriceRange.min || localPriceRange.max) count = 1;
                    } else {
                      count = availableFilters[groupKey].filter(opt => searchParams.getAll(opt.urlKey).includes(opt.value)).length;
                    }
                    return (
                      <button key={groupKey} onClick={() => setActiveMobileGroup(groupKey)}
                        className={`w-full text-left px-4 py-5 text-[11px] font-figtree font-bold uppercase tracking-tight border-b border-gray-100 relative leading-tight ${activeMobileGroup === groupKey ? "bg-white text-primary" : "text-gray-500"}`}>
                        {groupKey}
                        {count > 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5a413f] text-white text-[9px] w-5 h-5 rounded-md flex items-center justify-center font-bold">{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="w-[55%] bg-white overflow-y-auto p-4">
                  {activeMobileGroup && availableFilters[activeMobileGroup] && (
                    <div className="space-y-6 pb-20">
                      {activeMobileGroup === "Price" ? (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500">
                            The highest price is ₹{new Intl.NumberFormat("en-IN").format(availableFilters["Price"]?.max || 0)}
                          </p>
                          <div className="space-y-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <Input
                                type="number"
                                placeholder="From"
                                value={localPriceRange.min}
                                onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                onBlur={applyPriceFilter}
                                className="pl-7 h-12 text-sm focus-visible:ring-black"
                              />
                            </div>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="To"
                                value={localPriceRange.max}
                                onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                onBlur={applyPriceFilter}
                                className="h-12 text-sm focus-visible:ring-black"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        availableFilters[activeMobileGroup].map((option) => {
                          const isSelected = searchParams.getAll(option.urlKey).includes(option.value);
                          return (
                            <div key={option.value} className="flex items-center justify-between py-1 cursor-pointer group" onClick={() => toggleFilter(option.urlKey, option.value)}>
                              <div className="flex items-center gap-3">
                                {isSelected ? <div className="w-4 h-4 bg-[#5a413f] rounded flex items-center justify-center"><svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div> : <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-[#5a413f]" />}
                                <span className={`text-[13px] ${isSelected ? "text-black font-semibold" : "text-gray-600"}`}>{option.label}</span>
                              </div>
                              <span className="text-[11px] text-gray-400">({option.count})</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-gray-300 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button onClick={clearAllFilters} className="py-4 px-2 text-[11px] font-black bg-accent text-white font-figtree uppercase tracking-[0.1em]">Clear All</button>
                <button onClick={() => setIsFilterSheetOpen(false)} className="py-4 px-2 text-[11px] font-black bg-primary text-white font-figtree uppercase tracking-[0.1em]">APPLY FILTERS</button>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsFilterSheetOpen(false)} />
      </Sheet>
    </div>
  );
}
