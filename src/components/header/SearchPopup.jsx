"use client";

import { useState, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const HighlightMatch = ({ text, query }) => {
  if (!query) return <span className="text-[#1A1A1A]">{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span className="text-[#1A1A1A]">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i} className="font-semibold text-black">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function SearchPopup({ onClose, searchQuery, searchResults, isSearching }) {
  // Mock categories based on image
  const MOCK_CATEGORIES = [
    { title: "Solitaire Rings", image: "/images/shapes/round.png", href: "/collections/solitaire-rings" },
    { title: "Solitaire Earrings", image: "/images/styles/dangles.png", href: "/collections/solitaire-earrings" },
    { title: "Solitaire Pendant", image: "/images/menu/earring.jpg", href: "/collections/solitaire-pendants" },
    { title: "Solitaire Bracelets", image: "/images/menu/wedding-ring.jpg", href: "/collections/solitaire-bracelets" },
    { title: "Solitaire Nosering", image: "/images/menu/more-jewellery.jpg", href: "/collections/solitaire-noserings" },
    { title: "Solitaire Mangalsutra", image: "/images/menu/engagement-ring.jpg", href: "/collections/solitaire-mangalsutras" },
  ];

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-225 bg-white rounded-lg shadow-2xl z-999 border border-gray-100 overflow-hidden pointer-events-auto"
    >
      <div className="p-8">
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
            
            {/* Left Column: Categories (Always visible or primary focus) */}
            <div className="pr-10 lg:border-r border-gray-100">
              <h3 className="text-[15px] font-semibold mb-6 text-[#1A1A1A]">Categories</h3>
              <div className="grid grid-cols-3 gap-5">
                {MOCK_CATEGORIES.map((cat, i) => (
                  <Link 
                    key={i} 
                    href={cat.href}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-[4/3] relative bg-[#F9F9F9] rounded-sm overflow-hidden mb-2.5">
                      <Image 
                        src={cat.image} 
                        alt={cat.title} 
                        fill 
                        className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-[12px] font-medium text-gray-700 text-center group-hover:text-primary transition-colors">
                      {cat.title}
                    </p>
                  </Link>
                ))}
              </div>

              {searchQuery.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-50">
                  <Link 
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={onClose}
                    className="text-primary font-bold text-[13px] underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all"
                  >
                    View All "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Products (Shows when typing) */}
            <div>
              <h3 className="text-[15px] font-semibold mb-6 text-[#1A1A1A]">Products</h3>
              
              {searchQuery.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                    <Search size={32} strokeWidth={1} className="mb-3 opacity-20" />
                    <p className="text-[13px]">Type to see product results</p>
                 </div>
              ) : isSearching ? (
                <div className="space-y-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-14 h-14 bg-gray-100 rounded-sm" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-5">
                  {searchResults.slice(0, 5).map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.handle}`}
                      onClick={onClose}
                      className="group flex gap-4 items-center"
                    >
                      <div className="w-14 h-14 relative bg-[#F9F9F9] rounded-sm overflow-hidden shrink-0">
                        <Image 
                          src={product.image || "/images/product/1.jpg"} 
                          alt={product.title} 
                          fill 
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
                          <HighlightMatch text={product.title} query={searchQuery} />
                        </h4>
                        <p className="text-[12px] font-bold text-gray-900 mt-0.5">{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-[13px] italic">No matching products found</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
