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
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00014YG_1_9e9365bf-5b4b-4dce-bd97-0c990bad1d27.webp",
        title: "Classic Oval Shape Diamond Ring with Sleek Band",
        price: "₹58,249",
        originalPrice: "₹69,702",
        discount: "21% OFF",
        url: "/products/classic-oval-shape-diamond-ring-with-sleek-band"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-PD0054YG_1.webp",
        title: "Gold Diamond Interlocking Circle Pendant",
        price: "₹34,740",
        originalPrice: "₹35,962",
        discount: "21% OFF",
        url: "/products/gold-diamond-interlocking-circle-pendant"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/3_19273c5b-388e-473d-828e-5b23d9a17730.jpg",
        title: "Double Halo Round Diamond Bracelet",
        price: "₹99,970",
        originalPrice: "₹1,26,008",
        discount: "21% OFF",
        url: "/products/double-halo-round-diamond-bracelet"
      }
    ],
    totalPrice: "₹1,92,959"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f39f797cd7e4c7c94aa2e1b4bcf457b/6f39f797cd7e4c7c94aa2e1b4bcf457b.HD-1080p-2.5Mbps-55011497.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00419YG_1.jpg",
        title: "Classic Round Diamond Ring",
        price: "₹113,865",
        originalPrice: "₹124,244",
        discount: "20% OFF",
        url: "/products/classic-mens-round-diamond-ring"
      },
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00421WG_1.webp",
        title: "Modern Gold Band",
        price: "₹120,641",
        originalPrice: "₹131,162",
        discount: "20% OFF",
        url: "/products/mens-modern-round-diamond-band"
      }
    ],
    totalPrice: "₹234,506"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/da2e9e63a0a34e44a11e112df8d0fefa/da2e9e63a0a34e44a11e112df8d0fefa.HD-720p-1.6Mbps-50616558.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-PD0322YG_1.jpg",
        title: "Princess Cut Halo Necklace",
        price: "₹74,390",
        originalPrice: "₹80,912",
        discount: "20% OFF",
        url: "/products/venetian-clover-diamond-chain-pendant"
      }
    ],
    totalPrice: "₹74,390"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/1708dd89d83f490cb2182445fceaf6cb/1708dd89d83f490cb2182445fceaf6cb.HD-1080p-4.8Mbps-66567546.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-BR0131YG_1.jpg",
        title: "Elegant Diamond Bracelet",
        price: "₹21,498",
        originalPrice: "₹22,774",
        discount: "20% OFF",
        url: "/products/elegant-geometric-round-diamond-bracelet"
      }
    ],
    totalPrice: "₹21,498"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/ef21629570184348bdce61b21e913c82/ef21629570184348bdce61b21e913c82.HD-1080p-3.3Mbps-55148000.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00093YG_1_48cf4932-4f87-4fa3-930d-ae5c4da7b615.webp",
        title: "Modern Gold Band",
        price: "₹67,842",
        originalPrice: "₹71,031",
        discount: "20% OFF",
        url: "/products/modern-flat-band-with-round-diamond"
      }
    ],
    totalPrice: "₹67,842"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f8b91e03c4740e6b497e9fd12cfb809/6f8b91e03c4740e6b497e9fd12cfb809.HD-1080p-4.8Mbps-66567656.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00740WG_1.jpg",
        title: "1 cts Emerald Solitaire and Rou...",
        price: "₹74,435",
        originalPrice: "₹88,038",
        discount: "20% OFF",
        url: "/products/1-cts-emerald-solitaire-and-round-diamond-regal-ring"
      }
    ],
    totalPrice: "₹74,435"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f39f797cd7e4c7c94aa2e1b4bcf457b/6f39f797cd7e4c7c94aa2e1b4bcf457b.HD-1080p-2.5Mbps-55011497.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00419YG_1.jpg",
        title: "Classic Round Diamond Ring",
        price: "₹113,865",
        originalPrice: "₹124,244",
        discount: "20% OFF",
        url: "/products/classic-mens-round-diamond-ring"
      }
    ],
    totalPrice: "₹113,865"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/da2e9e63a0a34e44a11e112df8d0fefa/da2e9e63a0a34e44a11e112df8d0fefa.HD-720p-1.6Mbps-50616558.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-PD0322YG_1.jpg",
        title: "Princess Cut Halo Necklace",
        price: "₹74,390",
        originalPrice: "₹80,912",
        discount: "20% OFF",
        url: "/products/venetian-clover-diamond-chain-pendant"
      }
    ],
    totalPrice: "₹74,390"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/1708dd89d83f490cb2182445fceaf6cb/1708dd89d83f490cb2182445fceaf6cb.HD-1080p-4.8Mbps-66567546.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-BR0131YG_1.jpg",
        title: "Elegant Diamond Bracelet",
        price: "₹21,498",
        originalPrice: "₹22,774",
        discount: "20% OFF",
        url: "/products/elegant-geometric-round-diamond-bracelet"
      }
    ],
    totalPrice: "₹21,498"
  },
  {
    video: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/ef21629570184348bdce61b21e913c82/ef21629570184348bdce61b21e913c82.HD-1080p-3.3Mbps-55148000.mp4",
    products: [
      {
        image: "https://www.lucirajewelry.com/cdn/shop/files/LJ-R00093YG_1_48cf4932-4f87-4fa3-930d-ae5c4da7b615.webp",
        title: "Modern Gold Band",
        price: "₹67,842",
        originalPrice: "₹71,031",
        discount: "20% OFF",
        url: "/products/modern-flat-band-with-round-diamond"
      }
    ],
    totalPrice: "₹67,842"
  }
];

export default function StyledByLucira() {
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });
  const swiperRef = useRef(null);

  return (
    <section className="w-full my-10 md:my-15 bg-white overflow-hidden">
      <div className="container-main">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-2 text-black">Styled By Lucira</h2>
        </div>

        <div className="relative w-full group/slider">
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
            spaceBetween={15}
            speed={600}
            grabCursor={true}
            breakpoints={{
              360: {
                slidesPerView: 1.2,
                centeredSlides: true,
              },
              640: {
                slidesPerView: 2.5,
                centeredSlides: false
              },
              1023: {
                slidesPerView: 4,
                centeredSlides: true
              },
              1370: {
                slidesPerView: 5,
                centeredSlides: true
              },
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