"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useId, useRef } from "react";

export function ProductSlider({ title, subtitle, products = [], preservePriceOnColorChange = false }) {
  if (!Array.isArray(products) || products.length === 0) return null;
  const id = useId().replace(/:/g, "");
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);

  const prevElClass = `prev-${id}`;
  const nextElClass = `next-${id}`;
  const paginationElClass = `pagination-${id}`;

  return (
    <section className="w-full bg-white overflow-hidden mt-15">
      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-28px font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-base text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="relative group">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation={true}
            pagination={{
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} !w-8 !h-1 !rounded-full !bg-gray-200 transition-all duration-300 [&.swiper-pagination-bullet-active]:!bg-black"></span>`;
              },
            }}
            onBeforeInit={(swiper) => {
              if (swiper.params.navigation) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
              if (swiper.params.pagination) {
                swiper.params.pagination.el = paginationRef.current;
              }
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="w-full overflow-visible!"
          >
            {products.map((product, idx) => (
              <SwiperSlide key={product.shopifyId || product.id || product.handle || idx}>
                <ProductCard
                  product={product}
                  fixedPrice={preservePriceOnColorChange ? product.price : undefined}
                  fixedComparePrice={preservePriceOnColorChange ? (product.compare_price || product.compareAtPrice) : undefined}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation & Pagination Controls */}
          <div className="flex justify-between items-center mt-12 px-2">
            <div ref={paginationRef} className={`${paginationElClass} flex items-center gap-2 !static !w-auto`}></div>
            
            <div className="flex items-center gap-4">
              <button ref={prevRef} className={`${prevElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all`}>
                <ChevronLeft size={24} />
              </button>
              <button ref={nextRef} className={`${nextElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all`}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .${paginationElClass} .swiper-pagination-bullet {
          margin: 0 !important;
        }
      `}} />
    </section>
  );
}
