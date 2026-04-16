"use client";

import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function VideoPopup({ isOpen, onClose, videoData, initialIndex }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
      
      {/* Main Container */}
      <div className="relative w-full max-w-5xl">
        
        {/* Navigation Arrows - Placed relative to this container */}
        <button className="popup-prev absolute -left-12 md:-left-20 top-1/2 -translate-y-1/2 z-[110] text-white hover:text-gray-300 transition-colors cursor-pointer outline-none">
          <ChevronLeft size={56} strokeWidth={1} />
        </button>
        <button className="popup-next absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 z-[110] text-white hover:text-gray-300 transition-colors cursor-pointer outline-none">
          <ChevronRight size={56} strokeWidth={1} />
        </button>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".popup-prev",
            nextEl: ".popup-next",
          }}
          initialSlide={initialIndex}
          loop={true}
          slidesPerView={1}
          className="w-full bg-white rounded-md shadow-2xl overflow-hidden"
          onSlideChange={(swiper) => {
            const allVideos = swiper.el.querySelectorAll("video");
            allVideos.forEach((v) => v.pause());
            
            const activeSlide = swiper.slides[swiper.activeIndex];
            const activeVideo = activeSlide.querySelector("video");
            if (activeVideo) {
              activeVideo.currentTime = 0;
              activeVideo.play().catch(() => {});
            }
          }}
        >
          {videoData.map((item, idx) => (
            <SwiperSlide key={`popup-${idx}`}>
              <div className="flex flex-col md:flex-row min-h-[500px] md:h-[600px]">
                
                {/* Left Side: Video */}
                <div className="w-full md:w-[42%] relative bg-black flex items-center justify-center group">
                  <video
                    src={item.video}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                        if (e.target.paused) e.target.play();
                        else e.target.pause();
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                        <Play size={28} fill="white" className="text-white ml-1" />
                     </div>
                  </div>
                </div>

                {/* Right Side: Product List */}
                <div className="w-full md:w-[58%] p-6 md:p-12 bg-white relative flex flex-col h-full">
                  
                  {/* Close Button Inside Content Box (Top Right) */}
                  <button
                      onClick={onClose}
                      className="absolute top-6 right-6 z-[120] text-gray-400 hover:text-black transition-colors cursor-pointer p-1"
                  >
                      <X size={28} />
                  </button>

                  <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-8 mt-4 md:mt-0">
                        {item.products && item.products.map((product, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative">
                            <Image 
                                src={product.image} 
                                alt={product.title} 
                                fill
                                className="object-cover"
                            />
                            </div>
                            <div className="flex-grow min-w-0">
                            <h3 className="text-sm md:text-base font-bold text-gray-800 leading-snug mb-2 pr-4">
                                {product.title}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-base md:text-lg font-extrabold text-gray-900">{product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through font-medium">{product.originalPrice}</span>
                                )}
                                {product.discount && (
                                    <span className="text-[10px] md:text-xs font-bold bg-[#F5E6E4] text-[#8B4513] px-2 py-1 rounded tracking-wide uppercase">
                                        {product.discount}
                                    </span>
                                )}
                            </div>
                            </div>
                            <button className="flex-shrink-0 bg-[#5A413F] text-white px-6 py-2.5 rounded text-xs font-black hover:bg-[#4a3533] transition-all uppercase tracking-widest shadow-sm">
                            Add
                            </button>
                        </div>
                        ))}
                    </div>
                  </div>

                  {/* Add All Button */}
                  <div className="mt-10">
                    <button className="w-full border-2 border-[#5A413F] text-[#5A413F] py-4 px-6 rounded text-sm font-black hover:bg-[#5A413F] hover:text-white transition-all uppercase tracking-[0.1em] flex items-center justify-center">
                        Add All Products To Cart - {item.totalPrice}
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
}