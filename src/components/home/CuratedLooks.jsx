"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import LazyImage from "../common/LazyImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import "swiper/css";
import "swiper/css/pagination";

const LOOKS = [
  {
    id: "look-1",
    name: "Engagement",
    image: "/images/curated/1.jpg",
    href: "/collections/engagement",
    hotspots: [
      {
        id: 1,
        x: "32%",
        y: "38%",
        product: {
          name: "Diamond Stud Earrings",
          image: "/images/curated/product-1.jpg",
          price: "₹24,999",
          oldPrice: "₹29,999",
          href: "/products/diamond-stud-earrings",
        },
      },
      {
        id: 2,
        x: "46%",
        y: "73%",
        product: {
          name: "Gold Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹31,499",
          oldPrice: "₹35,999",
          href: "/products/gold-ring",
        },
      },
      {
        id: 3,
        x: "75%",
        y: "58%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-3.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/diamond-ring",
        },
      },
    ],
  },
  {
    id: "look-2",
    name: "Wedding",
    image: "/images/curated/2.jpg",
    href: "/collections/wedding",
    hotspots: [
      {
        id: 1,
        x: "74%",
        y: "50%",
        product: {
          name: "Hexora-Enamel Onyx Diamond Chain Pendant",
          image: "/images/curated/product-1.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/hexora-enamel-onyx-diamond-chain-pendant",
        },
      },
      {
        id: 2,
        x: "78%",
        y: "32%",
        product: {
          name: "Minimal Diamond Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹18,499",
          oldPrice: "₹21,999",
          href: "/products/minimal-diamond-ring",
        },
      },
      {
        id: 3,
        x: "54%",
        y: "82%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-3.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/diamond-ring",
        },
      },
    ],
  },
  {
    id: "look-3",
    name: "Anniversary",
    image: "/images/curated/3.jpg",
    href: "/collections/anniversary",
    hotspots: [
      {
        id: 1,
        x: "76%",
        y: "22%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-1.jpg",
          price: "₹38,999",
          oldPrice: "₹42,500",
          href: "/products/diamond-ring-anniversary",
        },
      },
      {
        id: 2,
        x: "52%",
        y: "64%",
        product: {
          name: "Tennis Bracelet",
          image: "/images/curated/product-2.jpg",
          price: "₹29,999",
          oldPrice: "₹34,999",
          href: "/products/tennis-bracelet",
        },
      },
      {
        id: 3,
        x: "86%",
        y: "77%",
        product: {
          name: "Diamond Necklace",
          image: "/images/curated/product-3.jpg",
          price: "₹56,499",
          oldPrice: "₹61,999",
          href: "/products/diamond-necklace",
        },
      },
    ],
  },
  {
    id: "look-4",
    name: "Valentine's",
    image: "/images/curated/4.jpg",
    href: "/collections/valentines",
    hotspots: [
      {
        id: 1,
        x: "86%",
        y: "34%",
        product: {
          name: "Hoop Earrings",
          image: "/images/curated/product-1.jpg",
          price: "₹16,999",
          oldPrice: "₹19,999",
          href: "/products/hoop-earrings",
        },
      },
      {
        id: 2,
        x: "47%",
        y: "73%",
        product: {
          name: "Solitaire Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹72,499",
          oldPrice: "₹78,999",
          href: "/products/solitaire-ring",
        },
      },
    ],
  },
];

export default function CuratedLooks() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const swiperRef = useRef(null);
  const [activeHotspot, setActiveHotspot] = useState({ slideIndex: null, hotspotId: null });

  // Group looks for mobile: 2 items per slide (vertical stack)
  const groupedLooks = [];
  for (let i = 0; i < LOOKS.length; i += 2) {
    groupedLooks.push(LOOKS.slice(i, i + 2));
  }

  if (isMobile) {
    return (
      <section className="w-full mt-12 bg-[#FEF5F1] py-12 overflow-hidden">
        <div className="container-main">
            <div className="text-center mb-6 px-1 md:px-0">
              <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-2 text-black">Curated Looks For You</h2>
              <p className="text-black text-base font-normal">Explore the jewelry pieces that defines the look</p>
            </div>

          <div className="relative">
            <Swiper
              modules={[Pagination]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              pagination={{
                clickable: true,
                el: ".curated-pagination",
              }}
              slidesPerView={1.12}
              spaceBetween={12}
              centeredSlides={false}
              loop={false}
              onSlideChange={() => setActiveHotspot({ slideIndex: null, hotspotId: null })}
              className="curated-swiper overflow-visible!"
            >
              {groupedLooks.map((group, groupIdx) => (
                <SwiperSlide key={groupIdx}>
                  <div className="flex flex-col gap-3">
                    {group.map((look, lookIdxInGroup) => {
                      const globalLookIdx = groupIdx * 2 + lookIdxInGroup;
                      return (
                        <div 
                          key={look.id}
                          className="relative aspect-[4/4.3] overflow-hidden rounded-xl bg-gray-100 shadow-md"
                          onClick={() => setActiveHotspot({ slideIndex: null, hotspotId: null })}
                        >
                          <LazyImage src={look.image} alt={look.name} fill className="object-cover" />

                          {look.hotspots.map((spot) => (
                            <div key={spot.id} className="absolute z-10" style={{ left: spot.x, top: spot.y }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveHotspot({ slideIndex: globalLookIdx, hotspotId: spot.id });
                                }}
                                className="relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/20 backdrop-blur-sm"
                              >
                                <span className="absolute h-7 w-7 animate-ping rounded-full bg-white/30" />
                                <Image src="/images/icons/hotspot-icon.svg" alt="Hotspot" width={20} height={20} />
                                {/* <span className="absolute h-4 w-0.5 bg-white" />
                                <span className="absolute h-0.5 w-4 bg-white" />
                                <span className="relative z-10 h-3 w-3 rounded-full bg-white" /> */}
                              </button>
                            </div>
                          ))}

                          {activeHotspot.slideIndex === globalLookIdx && (
                            <div className="absolute bottom-3 left-3 right-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              {look.hotspots.find(h => h.id === activeHotspot.hotspotId) && (
                                <Link 
                                  href={look.hotspots.find(h => h.id === activeHotspot.hotspotId).product.href}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-[20px] p-2.5 border border-white/10 shadow-2xl"
                                >
                                  <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                                    <LazyImage src={look.hotspots.find(h => h.id === activeHotspot.hotspotId).product.image} alt="Product" fill className="object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-[11px] font-bold leading-tight line-clamp-1 mb-0.5">{look.hotspots.find(h => h.id === activeHotspot.hotspotId).product.name}</h4>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-black text-xs">{look.hotspots.find(h => h.id === activeHotspot.hotspotId).product.price}</span>
                                      <span className="text-white/50 text-[9px] line-through">{look.hotspots.find(h => h.id === activeHotspot.hotspotId).product.oldPrice}</span>
                                    </div>
                                  </div>
                                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black shrink-0">
                                    <ArrowRight size={14} />
                                  </div>
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="flex items-center justify-between mt-8">
               <div className="curated-pagination flex gap-2" />
               <div className="flex gap-3">
                  <button onClick={() => swiperRef.current?.slidePrev()} className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-900 bg-white shadow-sm active:scale-90 transition-all"><ChevronLeft size={22} /></button>
                  <button onClick={() => swiperRef.current?.slideNext()} className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-900 bg-white shadow-sm active:scale-90 transition-all"><ChevronRight size={22} /></button>
               </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .curated-pagination .swiper-pagination-bullet { width: 8px; height: 8px; background: #D1D1D1; opacity: 1; border-radius: 4px; transition: all 0.3s ease; }
          .curated-pagination .swiper-pagination-bullet-active { width: 32px; background: #000; }
        `}</style>
      </section>
    );
  }

  return (
    <section className="mt-16 w-full bg-[#FEF5F1] py-10">
      <div className="container-main">
        <div className="mb-6 text-center">
          <h2 className="main-title mb-2 font-abhaya font-extrabold">
            Curated Looks For You
          </h2>
          <p className="text-base text-black">
            Explore the jewelry pieces that defines the look
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {LOOKS.map((occ, index) => (
            <div
              key={index}
              className="relative aspect-3/4 overflow-visible rounded-sm bg-gray-100"
            >
              <Link href={occ.href} className="block h-full w-full">
                <LazyImage
                  src={occ.image}
                  alt={occ.name}
                  fill
                  className="rounded-sm object-cover"
                />
              </Link>

              {occ.hotspots.map((spot) => {
                const xNum = parseFloat(spot.x);
                const alignRight = xNum > 70;
                const alignLeft = xNum < 30;

                return (
                  <div
                    key={spot.id}
                    className="absolute z-10"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={spot.product.name}
                        className="relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/20 backdrop-blur-sm"
                      >
                        <span className="absolute h-7 w-7 animate-ping rounded-full bg-white/30" />
                        <Image src="/images/icons/hotspot-icon.svg" alt="Hotspot" width={20} height={20} />
                                {/* <span className="absolute h-4 w-0.5 bg-white" />
                                <span className="absolute h-0.5 w-4 bg-white" />
                                <span className="relative z-10 h-3 w-3 rounded-full bg-white" /> */}
                      </button>

                      <div
                        className={[
                          "invisible pointer-events-none absolute top-full z-30 w-60 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100",
                          alignRight
                            ? "right-0"
                            : alignLeft
                              ? "left-0"
                              : "left-1/2 -translate-x-1/2",
                        ].join(" ")}
                      >
                        <div className="relative rounded-lg bg-[#4E3A35]/95 p-2 shadow-xl">
                          <Link
                            href={spot.product.href}
                            className="flex items-center gap-3"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                              <LazyImage
                                src={spot.product.image}
                                alt={spot.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-bold leading-4 text-white">
                                {spot.product.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {spot.product.price}
                                </span>
                                {spot.product.oldPrice && (
                                  <span className="text-xs text-white/70 line-through mt-1">
                                    {spot.product.oldPrice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black">
                              <ArrowRight size={14} />
                            </div>
                          </Link>

                          <span
                            className={[
                              "absolute top-0 h-3 w-3 -translate-y-1/2 rotate-45 bg-[#4E3A35]/95",
                              alignRight
                                ? "right-4"
                                : alignLeft
                                  ? "left-4"
                                  : "left-1/2 -translate-x-1/2",
                            ].join(" ")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}