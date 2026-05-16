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
import { ChevronDown, XIcon, Hammer, Filter as FilterIcon, ShoppingBag, Loader2, ArrowUpDown, SlidersHorizontal, ChevronUp, X } from "lucide-react";
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
import { pushProductImpression } from "@/lib/gtm";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import StoreCollectionBanner from "@/components/collections/StoreCollectionBanner";

const STORE_HANDLES = ["pune-store", "chembur-store", "noida-store", "sky-city-borivali-store", "malad"];

const STORE_IMAGES = {
  "pune-store": ["/images/store/Pune.jpg"],
  "chembur-store": ["/images/store/Chembur.jpg"],
  "noida-store": ["/images/store/Noida.jpg"],
  "sky-city-borivali-store": ["/images/store/Borivali.jpg"],
  "malad": ["/images/store/store.jpg"],
};

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

  const limit = 20;

  const [expandedFilters, setExpandedFilters] = useState({ "In Store Available": true });
  const loadMoreRef = useRef(null);

  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [activeMobileGroup, setActiveMobileGroup] = useState(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  // Data State
  const [availableFilters, setAvailableFilters] = useState({});
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [collection, setCollection] = useState({ title: "", description: "" });
  const [dbCollection, setDbCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ hasNextPage: false, endCursor: null });
  const [productsLoading, setProductsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Price Filter State
  const [localPriceRange, setLocalPriceRange] = useState({
    min: searchParams.get("filter.v.price.gte") || "",
    max: searchParams.get("filter.v.price.lte") || ""
  });

  useEffect(() => {
    setLocalPriceRange({
      min: searchParams.get("filter.v.price.gte") || "",
      max: searchParams.get("filter.v.price.lte") || ""
    });
  }, [searchParams]);

  const filterParamsString = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    p.delete("cursor");
    return p.toString();
  }, [searchParams]);

  // Initial Fetch & Filter Changes
  useEffect(() => {
    async function fetchData() {
      setProductsLoading(true);
      setFiltersLoading(true);
      
      try {
        // Fetch Collection Metadata & Products
        const collRes = await fetch(`/api/collection?handle=${handle}&${filterParamsString}&limit=${limit}`);
        const collData = await collRes.json();
        setCollection({
          title: collData.collection?.title || handle.replace(/-/g, " "),
          description: collData.collection?.description || ""
        });
        setProducts(collData.products || []);
        setPagination(collData.pageInfo || { hasNextPage: false, endCursor: null });
        setTotalCount(collData.totalProducts || 0);

        // Fetch DB Collection (SEO/FAQ)
        const dbRes = await fetch(`/api/collection/metadata?handle=${handle}`);
        const dbData = await dbRes.json();
        if (dbData.success) setDbCollection(dbData.collection);

        // Fetch Filters
        const filtersRes = await fetch(`/api/products/filters?handle=${handle}&${filterParamsString}`);
        const filtersData = await filtersRes.json();
        setAvailableFilters(filtersData);
        setFiltersLoading(false);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchData();
  }, [handle, filterParamsString]);

  // Fetch Next Page
  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !pagination.hasNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const res = await fetch(`/api/products/search?handle=${handle}&${filterParamsString}&limit=${limit}&cursor=${pagination.endCursor}`);
      const data = await res.json();
      setProducts(prev => [...prev, ...(data.products || [])]);
      setPagination(data.pagination || { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("Failed to fetch next page:", err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [handle, filterParamsString, pagination, isFetchingNextPage]);

  // Infinite scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [pagination.hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(availableFilters).forEach(([groupKey, options]) => {
      if (groupKey === "Price") {
        if (searchParams.get("filter.v.price.gte") || searchParams.get("filter.v.price.lte")) count++;
      } else if (Array.isArray(options)) {
        options.forEach((opt) => {
          if (searchParams.getAll(opt.urlKey || groupKey).includes(opt.value)) count++;
        });
      }
    });
    return count;
  }, [availableFilters, searchParams]);

  const applyPriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (localPriceRange.min) params.set("filter.v.price.gte", localPriceRange.min);
    else params.delete("filter.v.price.gte");
    if (localPriceRange.max) params.set("filter.v.price.lte", localPriceRange.max);
    else params.delete("filter.v.price.lte");
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [localPriceRange, searchParams, pathname, router]);

  const resetPriceFilter = useCallback(() => {
    setLocalPriceRange({ min: "", max: "" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter.v.price.gte");
    params.delete("filter.v.price.lte");
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

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
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const toggleFilterExpand = (groupKey) => {
    setExpandedFilters((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleSort = (value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "best_selling") p.delete("sort");
    else p.set("sort", value);
    p.delete("cursor");
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const activeSort = searchParams.get("sort") || "best_selling";

  const renderGridItems = () => {
    const items = [];
    products.forEach((prod, idx) => {
      if (!prod) return;
      if (idx === 3 || idx === 7) {
        items.push(
          <div key={`inpage-${idx}`} className="overflow-hidden rounded-lg">
            <Link href="/collections/bestsellers">
              <Image src="/images/inpage.jpg" alt="Promo" width={800} height={400} className="w-full h-full object-cover rounded-lg" />
            </Link>
          </div>
        );
      }
      items.push(<ProductCard key={prod.id || idx} product={prod} collectionHandle={handle} index={idx + 1} />);
    });
    if (isFetchingNextPage) {
      items.push(<ProductCardSkeleton key="next-1" />, <ProductCardSkeleton key="next-2" />, <ProductCardSkeleton key="next-3" />);
    }
    return items;
  };

  const displayTitle = isMobile
    ? (handle === "all" ? "All Products" : handle.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    : (collection.title || (handle === "all" ? "All Products" : handle.replace(/-/g, " ")));

  return (
    <div className="min-h-screen bg-white">
      {/* Restore Full UI sections */}
      {STORE_HANDLES.includes(handle) ? (
        <StoreCollectionBanner collectionHandle={handle} bannerImages={STORE_IMAGES[handle] || []} />
      ) : isMobile ? (
        <div className="w-full">
          <div className="container-main mx-auto pt-2 px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                <BreadcrumbItem><BreadcrumbLink href="/" className="hover:text-[#5a413f] transition-colors">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem><BreadcrumbLink href="/collections/all" className="hover:text-[#5a413f] transition-colors">Collections</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="scale-75" />
                <BreadcrumbItem><BreadcrumbPage className="text-[#5a413f]">{displayTitle}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="w-full relative h-40">
            <Image src="/images/collection/category-banner.jpg" alt={displayTitle} fill className="object-cover" priority />
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF5F1] overflow-hidden">
          <div className="container-main flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 capitalize">{displayTitle}</h1>
              <p className="text-gray-900 text-sm md:text-base mb-8 max-w-xl">{collection.description || "Find the perfect piece for your special moment."}</p>
              <div className="flex flex-wrap gap-6 text-xs md:text-sm font-medium">
                <div className="flex items-center gap-2"><Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Group_f573cba5-716e-47c9-baeb-8303cf3ba2e8.png" alt="Shipping" width={20} height={20} className="md:w-6" /><span>Free & secure shipping</span></div>
                <div className="flex items-center gap-2"><Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/streamline_star-badge_1.png" alt="Certified" width={20} height={20} className="md:w-6" /><span>100% value guarantee</span></div>
                <div className="flex items-center gap-2"><Image src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/hugeicons_delivery-return-01.png" alt="Return" width={20} height={20} className="md:w-6" /><span>15-day free returns</span></div>
              </div>
            </div>
            <div className="flex-1 relative w-full h-57.5"><Image src="/images/category-banner.jpg" alt={displayTitle} fill className="object-cover" /></div>
          </div>
        </div>
      )}

      <div className={isMobile ? "" : "flex xl:gap-12 lg:gap-6 py-6 container-main mx-auto"}>
        {/* Sidebar */}
        <div className="hidden lg:block xl:w-78 lg:w-60 shrink-0">
          <div className="sticky top-19 self-start h-fit">
            <ScrollArea className="w-full h-[calc(100dvh-5rem)]">
              {filtersLoading ? <FilterSidebarSkeleton /> : (
                <div className="space-y-3 px-4">
                  <div className="flex justify-between items-center border-b"><h3 className="font-semibold mb-3 uppercase tracking-widest text-sm">Filters</h3><button onClick={clearAllFilters} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-black mb-3">Clear All</button></div>
                  {Object.entries(availableFilters).map(([groupKey, options]) => (
                    <div key={groupKey} className="border-b mb-0 border-gray-200">
                      <button onClick={() => toggleFilterExpand(groupKey)} className="w-full flex items-center justify-between py-5 hover:opacity-70 transition-opacity"><h4 className="font-medium text-sm capitalize">{groupKey}</h4><ChevronUp size={18} className={`transition-transform duration-300 ${expandedFilters[groupKey] ? "rotate-0" : "rotate-180"}`} /></button>
                      {expandedFilters[groupKey] && Array.isArray(options) && (
                        <div className="space-y-4 my-2 pb-5">
                          {options.map((opt) => (
                            <div key={opt.value} className="flex items-center gap-3 text-sm">
                              <input type="checkbox" checked={searchParams.getAll(opt.urlKey || groupKey).includes(opt.value)} onChange={() => toggleFilter(opt.urlKey || groupKey, opt.value)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                              <label className="flex-1 cursor-pointer flex justify-between"><span>{opt.label}</span><span className="text-gray-400 text-xs">({opt.count})</span></label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1">
          <div className={`flex gap-4 items-center justify-between sticky top-0 bg-white z-20 ${isMobile ? "py-5 border-b border-gray-50 px-4" : "py-4"}`}>
            <div className={isMobile ? "flex items-baseline gap-2.5" : "flex gap-3 items-center"}>
              {isMobile ? (<><h2 className="text-lg font-bold text-black capitalize leading-none">{displayTitle}</h2><span className="text-xs text-gray-400 font-medium whitespace-nowrap">{totalCount} Designs</span></>) : (<span className="text-sm text-gray-500">{products.length}/{totalCount} products</span>)}
            </div>
            {!isMobile && (
              <div className="flex items-center gap-4"><div className="flex items-center gap-2"><span className="text-sm text-gray-600">Sort:</span><select value={activeSort} onChange={(e) => handleSort(e.target.value)} className="text-sm border rounded-md px-3 py-2 bg-white">{SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div></div>
            )}
          </div>

          <div className={`grid mt-4 ${isMobile ? "grid-cols-2 gap-4 px-2" : "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 gap-6"}`}>
            {productsLoading && products.length === 0 ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />) : renderGridItems()}
          </div>
          <div ref={loadMoreRef} className="h-20" />
        </div>
      </div>
    </div>
  );
}
