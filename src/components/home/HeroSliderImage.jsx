"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight} from "lucide-react";
import { useId } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "../ui/button";
import LazyImage from "../common/LazyImage";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const slideData = [
  { name: "Eterna-Band", alt: "Eterna Band Collection" },
  { name: "Hina-Khan", alt: "Hina Khan Signature Series" },
];

export default function HeroBanner() {
  const id = useId().replace(/:/g, "");
  const paginationElClass = `pagination-${id}`;
//   const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="w-full bg-white">
      <div className="relative w-full h-auto md:h-[calc(100dvh-270px)] md:min-h-[450px] overflow-hidden group">
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
              <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-full">
                <picture className="w-full h-full block">
                  <source
                    srcSet={`/images/heroslider/${slide.name}-Desktop.jpg`}
                    media="(min-width: 1023px)"
                  />
                  <Image
                    src={`/images/heroslider/${slide.name}-Mobile.jpg`}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                </picture>
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
