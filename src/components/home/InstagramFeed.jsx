"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Play, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import InstaPopup from "./InstaPopup";
import "swiper/css";

function InstaSlide({ item, onClick, idx }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl group cursor-pointer shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] bg-gray-50 border border-gray-100"
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-[5]">
          <Image src="/images/loader.gif" alt="Loading..." width={48} height={48} className="object-contain" />
        </div>
      )}
      <Image
        src={item.image}
        alt={`Instagram Feed ${item.id}`}
        fill
        onLoad={() => setIsLoaded(true)}
        className={`object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
          <p className="text-white text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2">
              {item.caption}
          </p>
      </div>

      {/* Play Button if video */}
      {item.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white/40">
            <Play size={24} fill="white" className="text-white ml-1 opacity-90" />
          </div>
        </div>
      )}

      {/* Insta Icon */}
      <div className="absolute top-4 right-4 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Instagram size={18} />
      </div>
    </div>
  );
}

export default function InstagramFeed() {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });

  useEffect(() => {
    async function fetchFeed() {
      try {
        const response = await fetch("/api/instagram");
        const data = await response.json();
        setFeedData(data);
      } catch (error) {
        console.error("Error fetching Instagram feed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <section className="w-full mt-15 py-20 bg-white">
        <div className="container-main grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mt-15 bg-white overflow-hidden pb-10">
      <div className="container-main mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white">
                <Instagram size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya text-gray-900 tracking-tight">
                Follow Our Journey
            </h2>
        </div>
        <p className="text-gray-500 text-sm md:text-base tracking-widest font-black uppercase">
          Tag us{" "}
          <Link
            href="https://www.instagram.com/lucirajewelry"
            target="_blank"
            className="text-black font-black underline hover:no-underline underline-offset-8 decoration-2"
          >
            @lucirajewelry
          </Link>{" "}
          to be part of our story
        </p>
      </div>

      <div className="w-full pl-4 md:pl-[4.5%]">
        <Swiper
          slidesPerView={1.3}
          spaceBetween={16}
          loop={true}
          grabCursor={true}
          breakpoints={{
            640: {
              slidesPerView: 2.5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4.2,
              spaceBetween: 24,
            },
            1440: {
              slidesPerView: 5.2,
              spaceBetween: 24,
            }
          }}
          className="insta-swiper !overflow-visible"
        >
          {feedData.map((item, idx) => (
            <SwiperSlide key={item.id}>
              <InstaSlide 
                item={item} 
                idx={idx} 
                onClick={() => setPopupState({ isOpen: true, index: idx })} 
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <InstaPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        data={feedData}
        activeIndex={popupState.index}
        onIndexChange={(index) => setPopupState({ ...popupState, index })}
      />
    </section>
  );
}
