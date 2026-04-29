"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Link from "next/link";

const slideData = [
  { name: "Eterna-Band", alt: "Eterna Band Collection", url: "/collections/all" },
  { name: "Hina-Khan", alt: "Hina Khan Signature Series", url: "/collections/all" },
];

export default function HeroBanner() {
  const id = useId().replace(/:/g, "");
  const paginationElClass = `pagination-${id}`;
  const isMobile = useMediaQuery("(min-width: 1025px)");

  return (
    <div className="w-full bg-white">
      <div className="relative w-full h-auto md:h-[calc(100dvh-225px)] md:min-h-[450px] overflow-hidden group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
          pagination={{
            el: `.${paginationElClass}`,
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} w-2! h-2! rounded-full! bg-gray-700! transition-all duration-300 [&.swiper-pagination-bullet-active]:bg-primary! [&.swiper-pagination-bullet-active]:w-2!"></span>`;
            },
          }}
          className="h-full w-full"
        >
          {slideData.map((slide, index) => (
            <SwiperSlide key={slide.name}>
              <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-full overflow-hidden">
                <Link href={slide.url}>
                  <Image key={`${slide.name}-${isMobile ? "desktop" : "mobile"}`}                  
                    src={`/images/heroslider/${slide.name}-${isMobile ? "Desktop" : "Mobile"}.jpg`}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover object-center transition-none"
                    sizes="100vw"
                  />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Controls */}
        <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 rounded-full bg-white/80 items-center justify-center shadow-md hover:bg-white transition-all">
          <ChevronLeft size={24} className="text-black" />
        </button>
        <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 rounded-full bg-white/80 items-center justify-center shadow-md hover:bg-white transition-all">
          <ChevronRight size={24} className="text-black" />
        </button>

        <div className="absolute bottom-4 left-0 right-0 z-20 md:bottom-8">
          <div className={`${paginationElClass} flex items-center justify-center gap-2`}></div>
        </div>
      </div>
    </div>
  );
}