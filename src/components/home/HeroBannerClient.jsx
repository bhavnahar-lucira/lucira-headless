// components/HeroBannerClient.tsx ← Client Component
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroBannerClient({ slideData }) {
  const id = useId().replace(/:/g, "");
  const paginationElClass = `pagination-${id}`;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback
      ? requestIdleCallback(() => setMounted(true))
      : setTimeout(() => setMounted(true), 200);

    return () => {
      if (requestIdleCallback) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-10">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
        pagination={{
          el: `.${paginationElClass}`,
          clickable: true,
          renderBullet: (index, className) =>
            `<span class="${className} w-2! h-2! rounded-full! bg-gray-700! transition-all duration-300 [&.swiper-pagination-bullet-active]:bg-primary! [&.swiper-pagination-bullet-active]:w-6! md:[&.swiper-pagination-bullet-active]:w-6!"></span>`,
        }}
        className="h-full w-full"
      >
        {slideData.map((slide, index) => {
          const { props: { srcSet: desktop } } = getImageProps({
            src: `/images/heroslider/${slide.name}-Desktop.jpg`,
            alt: slide.alt,
            fill: true,
            sizes: "100vw",
            priority: false,
          });

          const { props: { srcSet: mobile, ...rest } } = getImageProps({
            src: `/images/heroslider/${slide.name}-Mobile.jpg`,
            alt: slide.alt,
            fill: true,
            sizes: "100vw",
            priority: false,
          });

          return (
            <SwiperSlide key={slide.name}>
              <Link href={slide.url} className="block w-full h-full">
                <div className="relative w-full h-full">
                  <picture>
                    <source media="(min-width: 1025px)" srcSet={desktop} />
                    <source media="(max-width: 1024px)" srcSet={mobile} />
                    <img
                      {...rest}
                      className="w-full h-full object-cover object-center"
                      fetchPriority="low"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 rounded-full bg-white/80 items-center justify-center shadow-md hover:bg-white transition-all">
        <ChevronLeft size={24} className="text-black" />
      </button>
      <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 rounded-full bg-white/80 items-center justify-center shadow-md hover:bg-white transition-all">
        <ChevronRight size={24} className="text-black" />
      </button>

      <div className="absolute bottom-4 left-0 right-0 z-20 md:bottom-8">
        <div className={`${paginationElClass} flex items-center justify-center gap-2`} />
      </div>
    </div>
  );
}