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

const slides = [
  "/images/heroslider/banner-1.jpg",
  "/images/heroslider/banner-2.jpg",
  "/images/heroslider/banner-3.jpg",
];

export default function HeroBanner() {
  const id = useId().replace(/:/g, "");
  const paginationElClass = `pagination-${id}`;
  return (
    <div className="w-full">

      {/* HERO */}
      <div className="hero-slider relative w-full h-145 pb-5">

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          loop
          // autoplay={{ delay: 5000 }}
          navigation={{
            nextEl: ".hero-next",
            prevEl: ".hero-prev",
          }}
            pagination={{
              el: `.${paginationElClass}`,
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} w-2! h-2! rounded-full! bg-gray-700! transition-all duration-300 [&.swiper-pagination-bullet-active]:bg-primary! [&.swiper-pagination-bullet-active]:w-2!"></span>`;
              },
            }}
          className="h-full"
        >
          {slides.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="grid grid-cols-2 h-full bg-secondary">

                {/* LEFT TEXT */}
                <div className="flex flex-col justify-center pl-24 pr-16">

                  <h1
                    className={`text-[42px] font-semibold mb-4 font-abhaya`}
                  >
                    For Moments that Matter
                  </h1>

                  <p className="text-black max-w-105 mb-6">
                    Expertly crafted with exceptional clarity & sparkle,
                    designed to shine in every moment with effortless elegance.
                  </p>

                  <Button className="h-11 px-6 py-3 w-fit text-sm tracking-wide hover:cursor-pointer">
                    SHOP BESTSELLERS
                  </Button>

                </div>

                {/* RIGHT IMAGE */}
                <div className="relative h-full">
                  {index === 0 ? (
                    <Image
                      src={img}
                      alt="Hero Banner"
                      fill
                      priority
                      fetchPriority="high"
                      className="object-cover"
                    />
                  ) : (
                    <LazyImage
                      src={img}
                      alt="Hero Banner"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* LEFT ARROW */}
        <button className="hero-prev absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:cursor-pointer">
          <ChevronLeft size={18} className="text-white" />
        </button>

        {/* RIGHT ARROW */}
        <button className="hero-next absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:cursor-pointer">
          <ChevronRight size={18} className="text-white" />
        </button>

        {/* PAGINATION DOTS */}
        <div className={`${paginationElClass} flex items-center justify-center gap-1 mt-2`}></div>

      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {icon}
      <span>{text}</span>
    </div>
  );
}