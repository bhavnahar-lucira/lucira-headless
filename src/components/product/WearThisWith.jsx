"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Force en-IN formatting to be consistent across environments
const formatPrice = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
};

export default function WearThisWith({ products = [] }) {
  const [swiper, setSwiper] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!products || products.length === 0) return null;

  return (
    <div className="pt-4 border-t border-gray-100">
      <h2 className="text-base font-semibold text-black mb-4">Wear This With:</h2>      
      <div className="relative">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          loop={products.length > 2}
          onSwiper={setSwiper}
          onSlideChange={(s) => setActiveSlide(s.realIndex)}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 2.2 },
          }}
          className="w-full"
        >
          {products.map((product) => {
            const displayPrice = product.price;
            const displayComparePrice = product.compare_price;
            const discount = displayComparePrice > displayPrice 
              ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100) + "% OFF"
              : null;

            return (
              <SwiperSlide key={product.id || product.shopifyId}>
                <Link href={`/products/${product.handle}`} className="flex flex-col gap-4 group/item">
                  {/* Image */}
                  <div className="aspect-square bg-[#F7F7F7] rounded-lg relative overflow-hidden">
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      fill
                      className="object-contain p-4 mix-blend-multiply group-hover/item:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  {/* Swatches (Mocked for now as we don't have all color variants data here easily) */}
                  <div className="flex gap-2.5">
                    {product.colors && product.colors.slice(0, 3).map((color, idx) => (
                      <div 
                        key={idx}
                        className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm ${
                          color.toLowerCase().includes('yellow') ? 'bg-[#E2C07E]' : 
                          color.toLowerCase().includes('rose') ? 'bg-[#E9B4AB]' : 'bg-[#E5E4E2]'
                        }`}
                      ></div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-[14px] font-bold text-black leading-tight line-clamp-1">{product.title}</h3>
                    {(() => {
                        const average = product.reviews?.average || product.reviewStats?.average || 0;
                        if (average < 3) return null;
                        
                        return (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center text-amber-400">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} size={12} fill={i <= Math.floor(average) ? "currentColor" : "none"} className={i <= Math.floor(average) ? "" : "text-zinc-200"} />
                              ))}
                            </div>
                            <span className="text-[12px] font-bold text-black ml-1">{average}</span>
                          </div>
                        );
                    })()}
                    <p className="text-[12px] text-gray-500 font-medium line-clamp-2 leading-snug">
                      {product.productMetafields?.carat_range || "Diamond"} · {product.productMetafields?.material_type || "Jewellery"}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[15px] font-bold text-black">₹{formatPrice(displayPrice)}</span>
                      {displayComparePrice > displayPrice && (
                        <>
                          <span className="text-[13px] text-gray-400 line-through">₹{formatPrice(displayComparePrice)}</span>
                          <span className="bg-[#F2F2F2] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {discount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Controls Row */}
        <div className="flex items-center justify-between mt-8">
          {/* Custom Pagination (Dots) */}
          <div className="flex items-center gap-2">
            {products.map((_, i) => (
              <div 
                key={i} 
                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                  activeSlide === i ? "w-6 bg-black" : "w-2 bg-gray-300"
                }`}
                onClick={() => swiper?.slideTo(i)}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => swiper?.slidePrev()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => swiper?.slideNext()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
