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
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          navigation={{
            nextEl: `.${nextElClass}`,
            prevEl: `.${prevElClass}`,
          }}
          pagination={{
            el: `.${paginationElClass}`,
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} !w-8 !h-1 !rounded-full !bg-gray-200 transition-all duration-300 [&.swiper-pagination-bullet-active]:!bg-black"></span>`;
            },
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
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

        {/* Navigation & Pagination Controls */}
        <div className="flex justify-between items-center mt-12 px-2">
          <div className={`${paginationElClass} flex items-center gap-2`}></div>
          
          <div className="flex items-center gap-4">
            <button className={`${prevElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all`}>
              <ChevronLeft size={24} />
            </button>
            <button className={`${nextElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all`}>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>  
      <style jsx global>{`
        .${paginationElClass} {
          position: static !important;
          width: auto !important;
        }
        .${paginationElClass} .swiper-pagination-bullet {
          margin: 0 !important;
        }
      `}</style>
    </>
  );
}
