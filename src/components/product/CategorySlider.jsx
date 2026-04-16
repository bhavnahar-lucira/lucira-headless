"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useId } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { id: 1, name: "Earrings", handle: "earrings", image: "/images/product/1.jpg" },
  { id: 2, name: "Bracelets", handle: "bracelets", image: "/images/product/2.jpg" },
  { id: 3, name: "Necklaces", handle: "necklaces", image: "/images/product/3.jpg" },
  { id: 4, name: "Pendants", handle: "pendants", image: "/images/product/4.jpg" },
  { id: 5, name: "Rings", handle: "rings", image: "/images/product/5.jpg" },
  { id: 6, name: "Bangles", handle: "bangles", image: "/images/product/6.jpg" },
];

export default function CategorySlider() {
  const id = useId().replace(/:/g, "");
  
  const prevElClass = `prev-${id}`;
  const nextElClass = `next-${id}`;
  const paginationElClass = `pagination-${id}`;

  return (
    <section className="w-full py-15 bg-[#FAFAFA] overflow-hidden mt-15">
      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17">
        <h2 className="text-28px font-bold mb-6 text-black">Explore Our Categories</h2>

        <div className="relative">
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
                return `<span class="${className} w-6! h-1! rounded-full! bg-gray-300! transition-all duration-300 [&.swiper-pagination-bullet-active]:bg-black! [&.swiper-pagination-bullet-active]:w-10!"></span>`;
              },
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4 },
            }}
            className="w-full overflow-visible!"
          >
            {CATEGORIES.map((category) => (
              <SwiperSlide key={category.id}>
                <Link href={`/collections/${category.handle}`} className="group block relative aspect-4/5 bg-[#EFEFEF] overflow-hidden rounded-sm">
                  {/* Category Image */}
                  <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover mix-blend-multiply opacity-90"
                    />
                  </div>

                  {/* Category Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 flex justify-between items-center bg-linear-to-t from-black/5 to-transparent">
                    <span className="text-[22px] font-semibold text-black">{category.name}</span>
                    <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:text-white">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation & Pagination Controls */}
          <div className="flex justify-between items-center mt-11">
            {/* Pagination on the left */}
            <div className={`${paginationElClass} flex items-center gap-2 !static !w-auto`}></div>
            
            {/* Arrows on the right */}
            <div className="flex items-center gap-4">
              <button className={`${prevElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed`}>
                <ChevronLeft size={24} />
              </button>
              <button className={`${nextElClass} w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed`}>
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
