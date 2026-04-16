"use client";

import Link from "next/link";
import { useId, useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star, BadgeCheck } from "lucide-react";
import ReviewDetailedPopup from "@/components/review/ReviewDetailedPopup";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ReviewCard({ item, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
        onClick={onClick}
        className="overflow-hidden rounded-sm border border-[#e6e1de] bg-white transition-all hover:border-black/10 h-full flex flex-col cursor-pointer group"
    >
      <div className="block">
        <div className="relative aspect-[0.92/1] w-full bg-gray-50 overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-[5]">
              <Image src="/images/loader.gif" alt="Loading..." width={48} height={48} className="object-contain" />
            </div>
          )}
          <Image
            src={item.personImage || "/images/review/1.jpg"}
            alt={item.personName}
            fill
            onLoad={() => setIsLoaded(true)}
            className={`object-cover group-hover:scale-105 transition-all duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        <div className="p-3">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-black uppercase tracking-wider">
              {item.personName}
            </h3>

            {item.verified && (
              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest">
                <BadgeCheck size={14} className="fill-primary text-white" />
                <span>Verified</span>
              </div>
            )}
          </div>

          <p className="mb-3.5 line-clamp-4 min-h-19 text-sm leading-5 text-gray-600 italic">
            “{item.review}”
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 mt-auto">
        <div
          className="group/link block border-t border-[#ece7e4] pt-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#ddd] bg-white">
              <Image
                src={item.productImage || "/images/product/1.jpg"}
                alt={item.productTitle}
                fill
                className="object-cover group-hover/link:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all group-hover/link:text-black">
                {item.productTitle}
              </p>

              <div className="mt-1 flex items-center gap-1 text-[10px] font-black">
                <div className="flex items-center gap-px text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={i < Math.round(item.rating) ? "currentColor" : "none"}
                      className={i < Math.round(item.rating) ? "" : "text-zinc-200"}
                    />
                  ))}
                </div>
                <span className="mt-0.5">{item.rating}.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerReview({
  title = "Why Our Customers Love Us",
  subtitle,
}) {
  const id = useId().replace(/:/g, "");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Popup State
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/home-reviews");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const prevElClass = `prev-${id}`;
  const nextElClass = `next-${id}`;
  const paginationElClass = `pagination-${id}`;

  if (loading) {
    return (
        <section className="w-full pt-10 overflow-hidden">
            <div className="container-main">
                <div className="mb-6 animate-pulse">
                    <div className="h-10 w-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-96 bg-gray-100 rounded-sm"></div>
                    ))}
                </div>
            </div>
        </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="w-full pt-10 overflow-hidden">
      <div className="container-main">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h2 className="main-title mb-2 font-abhaya font-extrabold uppercase tracking-widest">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-base text-gray-600 italic">{subtitle}</p>}
          </div>
        )}

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={4.2}
            loop={false}
            onSwiper={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            navigation={{
              nextEl: `.${nextElClass}`,
              prevEl: `.${prevElClass}`,
            }}
            pagination={{
              el: `.${paginationElClass}`,
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} m-0! mr-2! h-2! w-2! rounded-full! bg-[#d7d2cf]! transition-all duration-300 [&.swiper-pagination-bullet-active]:w-6! [&.swiper-pagination-bullet-active]:rounded-full! [&.swiper-pagination-bullet-active]!bg-black!"></span>`;
              },
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="w-full overflow-visible!"
          >
            {reviews.map((item, idx) => (
              <SwiperSlide key={item.id}>
                <ReviewCard item={item} onClick={() => setPopupState({ isOpen: true, index: idx })} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mt-8 flex items-center justify-between px-1">
            <div className={`${paginationElClass} flex items-center`}></div>

            <div className="flex items-center gap-3">
              <button
                disabled={isBeginning}
                className={`${prevElClass} flex h-11 w-11 items-center justify-center rounded-full border border-black text-black transition hover:bg-black hover:text-white disabled:opacity-20 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer`}
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                disabled={isEnd}
                className={`${nextElClass} flex h-11 w-11 items-center justify-center rounded-full border border-black text-black transition hover:bg-black hover:text-white disabled:opacity-20 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer`}
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
            <Link 
                href="/reviews"
                className="inline-flex items-center justify-center border-b-2 border-black pb-1 font-black text-xs tracking-[0.3em] uppercase hover:text-primary hover:border-primary transition-all duration-300"
            >
                View All Reviews
            </Link>
        </div>
      </div>

      <ReviewDetailedPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        reviews={reviews}
        activeIndex={popupState.index}
        onIndexChange={(index) => setPopupState({ ...popupState, index })}
      />

      <style jsx global>{`
        .${paginationElClass} {
          position: static !important;
          width: auto !important;
        }
      `}</style>
    </section>
  );
}