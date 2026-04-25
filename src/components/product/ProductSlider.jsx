"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useState } from "react";

export function ProductSlider({ title, subtitle, products = [], preservePriceOnColorChange = false }) {
  const [swiper, setSwiper] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="w-full bg-white overflow-hidden mt-15">
      <div className="max-w-480 mx-auto px-5 md:px-17 min-[1440px]:px-17">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-28px font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-base text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="relative">
          <Swiper
            modules={[Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveSlide(s.realIndex)}
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
            {/* Custom Pagination (Dots) */}
            <div className="flex items-center gap-2 md:max-w-full max-w-[60%]">
              {products.map((_, i) => (
                <div 
                  key={i} 
                  className={`transition-all duration-300 rounded-full h-1 cursor-pointer ${
                    activeSlide === i ? "w-8 bg-black" : "w-2 bg-gray-200"
                  }`}
                  onClick={() => swiper?.slideTo(i)}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => swiper?.slidePrev()}
                className="w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-30"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => swiper?.slideNext()}
                className="w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-30"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
