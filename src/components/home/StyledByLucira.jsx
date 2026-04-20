"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import StyledVideoCard from "./StyledCard";
import VideoPopup from "./VideoPopup";

import "swiper/css";
import "swiper/css/navigation";

const videoData = [
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f8b91e03c4740e6b497e9fd12cfb809/6f8b91e03c4740e6b497e9fd12cfb809.HD-1080p-4.8Mbps-66567656.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/1_70747447-975a-4537-8b01-f2f6027a00f2.jpg",
        title: "Classic Oval Shape Diamond Ring with Sleek Band",
        price: "₹55,735",
        originalPrice: "₹69,879",
        discount: "21% OFF"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/2_8d16719b-79e8-4685-9853-53d36b7c07f2.jpg",
        title: "Gold Diamond Interlocking Circle Pendant",
        price: "₹36,383",
        originalPrice: "₹37,605",
        discount: "21% OFF"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/3_19273c5b-388e-473d-828e-5b23d9a17730.jpg",
        title: "Double Halo Round Diamond Bracelet",
        price: "₹99,970",
        originalPrice: "₹1,26,008",
        discount: "21% OFF"
      }
    ],
    totalPrice: "₹2,99,910"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f39f797cd7e4c7c94aa2e1b4bcf457b/6f39f797cd7e4c7c94aa2e1b4bcf457b.HD-1080p-2.5Mbps-55011497.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/4_3659a8cb-1d88-4444-8888-888888888888.jpg",
        title: "Classic Round Diamond Ring",
        price: "₹55,400",
        originalPrice: "₹69,250",
        discount: "20% OFF"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/5_5b16719b-79e8-4685-9853-53d36b7c07f2.jpg",
        title: "Modern Gold Band",
        price: "₹28,150",
        originalPrice: "₹35,180",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹83,550"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/da2e9e63a0a34e44a11e112df8d0fefa/da2e9e63a0a34e44a11e112df8d0fefa.HD-720p-1.6Mbps-50616558.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/3_19273c5b-388e-473d-828e-5b23d9a17730.jpg",
        title: "Princess Cut Halo Necklace",
        price: "₹42,850",
        originalPrice: "₹53,560",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹42,850"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/1708dd89d83f490cb2182445fceaf6cb/1708dd89d83f490cb2182445fceaf6cb.HD-1080p-4.8Mbps-66567546.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/4_3659a8cb-1d88-4444-8888-888888888888.jpg",
        title: "Elegant Diamond Bracelet",
        price: "₹89,200",
        originalPrice: "₹1,11,500",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹89,200"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/ef21629570184348bdce61b21e913c82/ef21629570184348bdce61b21e913c82.HD-1080p-3.3Mbps-55148000.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/5_5b16719b-79e8-4685-9853-53d36b7c07f2.jpg",
        title: "Modern Gold Band",
        price: "₹28,150",
        originalPrice: "₹35,180",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹28,150"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f8b91e03c4740e6b497e9fd12cfb809/6f8b91e03c4740e6b497e9fd12cfb809.HD-1080p-4.8Mbps-66567656.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/1_70747447-975a-4537-8b01-f2f6027a00f2.jpg",
        title: "1 cts Emerald Solitaire and Rou...",
        price: "₹72,015",
        originalPrice: "₹90,018",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹72,015"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f39f797cd7e4c7c94aa2e1b4bcf457b/6f39f797cd7e4c7c94aa2e1b4bcf457b.HD-1080p-2.5Mbps-55011497.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/2_8d16719b-79e8-4685-9853-53d36b7c07f2.jpg",
        title: "Classic Round Diamond Ring",
        price: "₹55,400",
        originalPrice: "₹69,250",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹55,400"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/da2e9e63a0a34e44a11e112df8d0fefa/da2e9e63a0a34e44a11e112df8d0fefa.HD-720p-1.6Mbps-50616558.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/3_19273c5b-388e-473d-828e-5b23d9a17730.jpg",
        title: "Princess Cut Halo Necklace",
        price: "₹42,850",
        originalPrice: "₹53,560",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹42,850"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/1708dd89d83f490cb2182445fceaf6cb/1708dd89d83f490cb2182445fceaf6cb.HD-1080p-4.8Mbps-66567546.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/4_3659a8cb-1d88-4444-8888-888888888888.jpg",
        title: "Elegant Diamond Bracelet",
        price: "₹89,200",
        originalPrice: "₹1,11,500",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹89,200"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/ef21629570184348bdce61b21e913c82/ef21629570184348bdce61b21e913c82.HD-1080p-3.3Mbps-55148000.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/5_5b16719b-79e8-4685-9853-53d36b7c07f2.jpg",
        title: "Modern Gold Band",
        price: "₹28,150",
        originalPrice: "₹35,180",
        discount: "20% OFF"
      }
    ],
    totalPrice: "₹28,150"
  }
];

export default function StyledByLucira() {
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });
  const swiperRef = useRef(null);

  return (
    <section className="w-full mt-12 md:mt-15 bg-white overflow-hidden pb-10">
      <div className="container-main">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-black font-abhaya mb-2 text-zinc-900 tracking-tight">Styled By Lucira</h2>
        </div>

        <div className="relative w-full group/slider px-4 md:px-0">
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            navigation={{
              prevEl: ".main-prev",
              nextEl: ".main-next",
            }}
            slidesPerView={1.2}
            centeredSlides={true}
            loop={true}
            slidesPerGroup={1}
            spaceBetween={12}
            speed={600}
            grabCursor={true}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
                centeredSlides: false
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
                centeredSlides: true
              }
            }}
            className="lucira-swiper overflow-visible!"
          >
            {videoData.map((item, i) => (
              <SwiperSlide key={`styled-v-${i}`}>
                <StyledVideoCard 
                  video={item.video} 
                  onClick={() => setPopupState({ isOpen: true, index: i })}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows - Desktop Only */}
          <button className="main-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center text-black opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-gray-50 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button className="main-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center text-black opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-gray-50 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <VideoPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        videoData={videoData}
        initialIndex={popupState.index}
      />
    </section>

  );
}