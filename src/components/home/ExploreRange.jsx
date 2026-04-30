"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LazyImage from "../common/LazyImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useState, useId } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import "swiper/css";
import "swiper/css/pagination";

const CATEGORIES = [
  { name: "Rings", image: "/images/range/Rings.jpg", href: "/collections/rings" },
  { name: "Earrings", image: "/images/range/Earrings.jpg", href: "/collections/earrings" },
  { name: "Bracelets", image: "/images/range/Bracelets.jpg", href: "/collections/bracelets" },
  { name: "Necklaces", image: "/images/range/Necklaces.jpg", href: "/collections/all-necklaces" },
  { name: "Nosepins", image: "/images/range/Nosepin.jpg", href: "/collections/all-nosepins" },
  { name: "Mangalsutra", image: "/images/range/Mangalsutra.jpg", href: "/collections/mangalsutra" },
  { name: "Men's Ring", image: "/images/range/MensRing.jpg", href: "/collections/mens-ring" },
  { name: "Men's Stud", image: "/images/range/MensStud.jpg", href: "/collections/mens-stud" },
];

export default function ExploreRange() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId().replace(/:/g, "");
  
  // Group categories for mobile (4 per slide: 2x2 grid)
  const groupedCategories = [];
  for (let i = 0; i < CATEGORIES.length; i += 4) {
    groupedCategories.push(CATEGORIES.slice(i, i + 4));
  }

  return (
    <section className="w-full mt-10 bg-white overflow-hidden">
      <div className="container-main">
        <div className="text-left md:text-center mb-6 px-1 md:px-0">
          <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-2 text-black">Explore Our Range</h2>
          <p className="text-black text-base md:text-base font-normal">Find diamond jewelry pieces that match your style.</p>
        </div>

        {isMobile ? (
          <div className="relative pb-12">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={1}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full"
            >
              {groupedCategories.map((group, groupIdx) => (
                <SwiperSlide key={groupIdx}>
                  <div className="grid grid-cols-2 gap-3 px-1">
                    {group.map((cat, index) => (
                      <CategoryCard key={index} cat={cat} />
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Progress and Fraction Pagination */}
            <div className="absolute bottom-2 left-1 right-1 flex items-center justify-between gap-4 mt-6">
               <div className="flex-1 h-[2px] bg-zinc-100 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#5B4740] transition-all duration-300"
                    style={{ 
                      width: `${(100 / groupedCategories.length)}%`,
                      transform: `translateX(${activeIndex * 100}%)`
                    }}
                  />
               </div>
               <div className="text-sm font-bold text-zinc-800 tracking-tighter">
                  {activeIndex + 1}/{groupedCategories.length}
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, index) => (
              <CategoryCard key={index} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  return (
    <Link 
      href={cat.href}
      className="group relative aspect-313/362 overflow-hidden rounded-md bg-gray-50"
    >
      <LazyImage 
        src={cat.image} 
        alt={cat.name} 
        fill 
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-4 md:bottom-6 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center text-white">
        <span className="text-[14px] md:text-2xl font-semibold">{cat.name}</span>
        <div className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-white/40 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
          <ArrowRight size={16} className="md:w-5 md:h-5" />
        </div>
      </div>
    </Link>
  );
}
