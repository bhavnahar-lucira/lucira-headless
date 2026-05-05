"use client";
import { useEffect, useState } from "react";
import ShopifyProductCard from "@/components/scheme/productCard/ShopifyProductCard";
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCard() {
  const TABS = [
    { label: "RINGS", value: "Rings", start:30000, end:100000 },
    { label: "EARRINGS", value: "Earrings", start:30000, end:100000 },
    { label: "BRACELETS", value: "Bracelets", start:30000, end:100000 },
    { label: "NECKLACES", value: "Necklaces", start:30000, end:100000 },
  ];

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
       const res = await fetch(
        `/api/scheme/shopify/products?type=${activeTab.value}&start=${activeTab.start}&end=${activeTab.end}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [activeTab]);

  return (
    <section className="w-[92%] mx-auto">
      <h2 className="text-xl md:text-2xl font-medium mb-8 text-center">
        Explore your dream jewelry that you can buy at 11th month
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap mb-8 md:mb-12">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-9 h-10 md:h-12 rounded-lg border text-[10px] md:text-sm transition uppercase cursor-pointer ${
              activeTab.value === tab.value
                ? "bg-primary text-white border-primary"
                : "border-primary text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-2 hover:shadow-md transition" key={index}>
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-80 w-full rounded-xl bg-[#fafafa]" />
                <div className="space-y-2 p-4 mt-2">
                  <Skeleton className="h-4 w-full bg-[#fafafa]" />
                  <Skeleton className="h-4 w-3/4 bg-[#fafafa]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product, index) => (
            <ShopifyProductCard key={index} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
