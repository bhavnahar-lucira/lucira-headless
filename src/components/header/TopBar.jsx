"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ANNOUNCEMENTS = [
  { text: "Upto 100% Off Making Charges" },
  { text: "Flat 10% Off on First Purchase" },
  { text: "Free Shipping on All Orders" },
];

export default function TopBar() {
  return (
    <div className="bg-[#5a413f] text-white group relative h-11 overflow-hidden">
      <button className="topbar-prev absolute left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer top-1/2 -translate-y-1/2 flex items-center justify-center">
        <ChevronLeft size={16} />
      </button>

      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          prevEl: ".topbar-prev",
          nextEl: ".topbar-next",
        }}
        loop={true}
        className="w-full h-full"
      >
        {ANNOUNCEMENTS.map((item, index) => (
          <SwiperSlide key={index} className="!flex items-center justify-center h-full">
            <p className="text-center font-medium text-[14px] leading-none tracking-[0.7px] flex items-center justify-center h-full w-full px-12">
              {item.text}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="topbar-next absolute right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer top-1/2 -translate-y-1/2 flex items-center justify-center">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}