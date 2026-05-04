"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

export default function OurProcess() {
  const steps = [
    {
      title: "Ideation & Sketching",
      desc: "Every ring begins as a refined concept inspired by timeless design. Ideas are translated into intentional sketches.",
      img: "/images/process/1.jpg",
    },
    {
      title: "3D Designing",
      desc: "Sketches evolve into detailed 3D models. Every curve and setting is perfected before production.",
      img: "/images/process/2.jpg",
    },
    {
      title: "Modeling & Casting",
      desc: "Designs are cast with precision for strength and accuracy. The foundation of a ring made to last.",
      img: "/images/process/3.jpg",
    },
    {
      title: "Filing & Polishing",
      desc: "Artisans hand-file the metal to refine every edge and surface. Polishing is done in stages for a flawless finish.",
      img: "/images/process/4.jpg",
    },
    {
      title: "Diamond Setting",
      desc: "Ethically sourced diamonds are carefully placed to ensure brilliance and durability.",
      img: "/images/process/5.jpg",
    },
  ];

  return (
    <section className="w-full mt-15 bg-white overflow-hidden">
      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17">
        <h2 className="text-28px font-bold mb-6 text-black">
          Our Process
        </h2>

        <Swiper
          modules={[FreeMode, Mousewheel]}
          spaceBetween={24}
          slidesPerView={1.2}
          freeMode={true}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4.2 },
          }}
          className="w-full overflow-visible!"
        >
          {steps.map((step, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col gap-4 group">
                {/* Image Container with Taller Aspect Ratio */}
                <div className="relative aspect-3/4 w-full bg-gray-50 overflow-hidden rounded-sm">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Placeholder overlay if image fails */}
                  <div className="absolute inset-0 bg-gray-50 -z-10" />
                </div>

                {/* Text Content */}
                <div className="space-y-2 pr-4">
                  <h3 className="text-xl font-semibold text-black tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-base leading-1.4">
                    {step.desc}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
