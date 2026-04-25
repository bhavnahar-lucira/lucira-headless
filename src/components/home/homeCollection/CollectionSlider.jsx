"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useId } from "react";

const SkeletonCard = () => (
  <div className="space-y-4 animate-pulse">
    <div className="aspect-square w-full bg-gray-100 rounded-lg" />
    <div className="space-y-3 px-1">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-6 bg-gray-100 rounded w-1/3 mt-6" />
    </div>
  </div>
);

export default function CollectionSlider ({ products = [], loading = false }) {
  const displayProducts = products;  const id = useId().replace(/:/g, "");
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full py-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) return null;
  
  const prevElClass = `prev-${id}`;
  const nextElClass = `next-${id}`;
  const paginationElClass = `pagination-${id}`;

  return (
    <>
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1.2}
          onSlideChange={(swiper) => {
            const progress = (swiper.activeIndex / (swiper.slides.length - swiper.params.slidesPerView)) * 100;
            const bar = document.getElementById(`progress-bar-${id}`);
            if (bar) bar.style.width = `${Math.min(100, Math.max(0, progress + (100 / swiper.slides.length)))}%`;
          }}
          navigation={{
            nextEl: `.${nextElClass}`,
            prevEl: `.${prevElClass}`,
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 30 },
          }}
          className="w-full overflow-visible!"
        >
          {displayProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation & Progress Controls (Updated for design) */}
        <div className="flex justify-between items-center mt-8 md:mt-6 px-1">
          {/* Progress Bar (Global) */}
          <div className="flex-1 max-w-[120px] md:max-w-[200px] h-[2px] bg-zinc-100 relative overflow-hidden">
            <div 
              id={`progress-bar-${id}`}
              className="absolute top-0 left-0 h-full bg-[#5B4740] transition-all duration-300"
              style={{ width: `${100 / displayProducts.length}%` }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className={`${prevElClass} w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all text-zinc-400 hover:border-black hover:text-white`}>
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button className={`${nextElClass} w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all text-zinc-400 hover:border-black hover:text-white`}>
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>  
    </>
  );
}
