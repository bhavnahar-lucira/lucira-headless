"use client";

import { Star, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import Image from "next/image";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react";
import ReviewDetailedPopup from "@/components/review/ReviewDetailedPopup";
import Link from "next/link";

// Helper to ensure image src is a valid string URL
const getValidSrc = (src, fallback = "/images/product/1.jpg") => {
  if (typeof src === 'string' && src.trim() !== '') return src;
  if (src && typeof src === 'object' && src.url) return src.url;
  return fallback;
};

export default function CustomerReviews({ reviews, productId, productTitle, productImage, productHandle }) {
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });
  const [data, setData] = useState({ count: 0, average: 0, stats: { breakdown: {} }, list: [] });
  const [gallery, setGallery] = useState([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initReviews() {
      setLoading(true);
      // If product has reviews, use them
      if (reviews && reviews.count > 0) {
        setData({
            count: reviews.count,
            average: reviews.average,
            stats: { breakdown: reviews.stats?.reduce((acc, s) => ({ ...acc, [s.rating]: s.count }), {}) || {} },
            list: reviews.list
        });
        
        // Extract gallery from product reviews
        const galleryItems = [];
        reviews.list.forEach((r, idx) => {
            if (r.images?.length > 0) {
                r.images.forEach(img => {
                    if (img) galleryItems.push({ url: img, reviewIndex: idx });
                });
            }
        });
        setGallery(galleryItems);
        setIsGlobal(false);
        setLoading(false);
      } else {
        // Otherwise fetch global fallback
        try {
          const response = await fetch("/api/all-reviews?page=1&limit=10");
          const result = await response.json();
          if (result.reviews && result.reviews.length > 0) {
            setData({
              count: result.total,
              average: result.stats.average,
              stats: result.stats,
              list: result.reviews
            });
            setGallery(result.gallery?.map(g => ({ url: typeof g === 'string' ? g : g.url, reviewId: g.reviewId })) || []);
            setIsGlobal(true);
          }
        } catch (error) {
          console.error("Error fetching global reviews fallback:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    initReviews();
  }, [reviews]);

  if (loading) return null;
  if (data.count === 0) return null;

  const getPercentage = (count) => {
    const total = isGlobal ? data.stats.total : data.count;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  const openPopup = (reviewIdOrIndex) => {
    let index = -1;
    if (typeof reviewIdOrIndex === 'string') {
        index = data.list.findIndex(r => r.id === reviewIdOrIndex);
    } else {
        index = reviewIdOrIndex;
    }
    
    if (index !== -1) {
      setPopupState({ isOpen: true, index });
    }
  };

  // Prepare mapped reviews for the popup
  const mappedReviews = data.list?.map(r => ({
    ...r,
    productTitle: r.productTitle || productTitle,
    productImage: getValidSrc(r.productImage || productImage),
    productHandle: r.productHandle || productHandle,
    personName: r.name || r.personName || "Verified Buyer",
    review: r.text || r.review || "",
    verified: true
  })) || [];

  const recommendPercent = isGlobal ? Math.round(((Number(data.stats.breakdown[4] || 0) + Number(data.stats.breakdown[5] || 0)) / (data.stats.total || 1)) * 100) : 97;

  return (
    <section className="w-full py-20 bg-[#FEF5F1] mt-15" id="reviews">
      <div className="container-main max-w-6xl">
        
        {/* Heading */}
        <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 uppercase tracking-widest font-abhaya">
            {isGlobal ? "Customer Stories" : "Customer Reviews"}
            </h2>
            {isGlobal && (
                <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    Showing top experiences from across our collections
                </p>
            )}
        </div>

        {/* Stats Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/30 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm mb-16">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black text-gray-900 mb-2">{data.average}</span>
              <div className="flex gap-1 mb-2 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={`summary-star-${i}`} 
                    size={24} 
                    fill={i <= Math.round(data.average) ? "currentColor" : "none"} 
                    className={i <= Math.round(data.average) ? "" : "text-zinc-200"} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{data.count} reviews</span>
            </div>

            <div className="flex-grow max-w-md w-full space-y-3">
              {[5, 4, 3, 2, 1].map(num => {
                const count = isGlobal ? (data.stats.breakdown[num] || 0) : (data.list?.filter(r => Math.round(r.rating) === num).length || 0);
                const percent = getPercentage(count);
                return (
                  <div key={`progress-${num}`} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-black text-gray-600 w-14 whitespace-nowrap uppercase tracking-tighter">{num} Stars</span>
                    <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 w-10 text-right">{percent}%</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-gray-900 mb-2">{recommendPercent}%</span>
              <p className="text-[10px] font-black text-gray-500 max-w-[120px] uppercase tracking-widest leading-relaxed">Would recommend Lucira</p>
            </div>
        </div>

        {/* Gallery Slider */}
        {gallery.length > 0 && (
          <div className="mb-16 relative">
            <Swiper
              modules={[Scrollbar, FreeMode]}
              spaceBetween={16}
              slidesPerView="auto"
              freeMode={true}
              grabCursor={true}
              scrollbar={{
                draggable: true,
                hide: false,
                el: ".product-review-scrollbar",
              }}
              className="w-full !pb-10"
            >
              {gallery.map((item, i) => (
                <SwiperSlide key={`gallery-slide-${i}`} className="!w-auto">
                  <div 
                      onClick={() => openPopup(isGlobal ? item.reviewId : item.reviewIndex)}
                      className="relative w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer group bg-gray-50"
                  >
                    <Image 
                      src={getValidSrc(item.url)} 
                      alt="Review gallery" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                          <ChevronRight className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="product-review-scrollbar !static !h-1 !bg-gray-200 !mt-2 !rounded-full overflow-hidden"></div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between py-4 md:py-10 px-2 border-b border-gray-200 mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            Rating: <span className="text-gray-900 ml-1">All</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
          
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{data.count} verified reviews</span>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            Sort by: <span className="text-gray-900 ml-1">Featured</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {data.list?.map((review, idx) => (
            <ReviewCard 
              key={review.id || `review-${idx}`}
              review={review}
              onClick={() => openPopup(idx)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-20 text-center">
            <Link 
                href="/reviews"
                className="px-14 py-5 bg-[#5A413F] text-white font-black text-xs uppercase tracking-[0.3em] rounded shadow-xl hover:bg-[#4a3533] transition-all active:scale-95 inline-block"
            >
                View All Reviews
            </Link>
        </div>
      </div>

      <ReviewDetailedPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        reviews={mappedReviews}
        activeIndex={popupState.index}
        onIndexChange={(index) => setPopupState({ ...popupState, index })}
      />

      <style jsx global>{`
        .product-review-scrollbar .swiper-scrollbar-drag {
          background: #5A413F !important;
          height: 100% !important;
        }
      `}</style>
    </section>
  );
}

function ReviewCard({ review, onClick }) {
  const name = review.name || review.personName || "Verified Buyer";
  const rating = review.rating || 5;
  const text = review.text || review.review;
  const images = review.images || [];
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateStr; }
  };

  return (
    <div onClick={onClick} className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl flex flex-col gap-4 md:gap-6 border border-gray-50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group cursor-pointer">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8D7774] flex items-center justify-center text-white font-bold border-4 border-white uppercase text-base sm:text-xl shadow-sm relative overflow-hidden shrink-0">
            {review.personImage ? (
              <Image src={getValidSrc(review.personImage)} alt={name} fill className="object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <span className="font-black text-gray-900 text-xs sm:text-sm uppercase tracking-wide truncate max-w-full">
                {name}
              </span>
              <div className="flex items-center gap-1 text-[#A68966] font-black uppercase tracking-wide text-[8px] sm:text-[9px] shrink-0">
                <CheckCircle size={12} className="fill-[#A68966] text-white" />
                <span>Verified</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-1.5 text-amber-400 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={`card-star-${i}`} 
                  size={14}
                  fill={i < Math.round(rating) ? "currentColor" : "none"}
                  className={`${i < Math.round(rating) ? "" : "text-zinc-200"}`}
                />
              ))}

              <span className="text-[10px] sm:text-[11px] font-black text-gray-900 ml-1 uppercase tracking-tighter">
                ({rating}.0)
              </span>
            </div>
            
            <span className="block lg:hidden mt-2 text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-wide">
              {formatDate(review.date)}
            </span>
          </div>
        </div>
        
        <span className="hidden lg:block shrink-0 text-[10px] font-black text-gray-300 uppercase tracking-wide">
          {formatDate(review.date)}
        </span>
      </div>
      
      <div className="space-y-2 md:space-y-3 flex-grow">
        <h4 className="text-base sm:text-lg font-black text-gray-900 leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">
          {review.title || "Brilliant Purchase"}
        </h4>
        <p className="text-gray-500 leading-relaxed text-xs sm:text-sm italic line-clamp-4">
          "{text}"
        </p>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-1 sm:mt-2">
          {images.slice(0, 3).map((img, idx) => (
            <div key={`card-img-${idx}`} className="aspect-square w-full bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden relative border border-gray-100 shadow-sm">
              <Image src={getValidSrc(img)} alt={`Review image ${idx}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
