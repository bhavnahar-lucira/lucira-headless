"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, FreeMode } from "swiper/modules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadNectorReviews } from "@/lib/nector";
import ReviewDetailedPopup from "@/components/review/ReviewDetailedPopup";
import WriteReviewForm from "@/components/review/WriteReviewForm";

// Import Swiper styles
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

// Helper to ensure image src is a valid string URL
const getValidSrc = (src, fallback = "/images/product/1.jpg") => {
  if (typeof src === "string" && src.trim() !== "") return src;
  if (src && typeof src === "object" && src.url) return src.url;
  return fallback;
};

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [gallery, setGallery] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [allData, setAllData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // Popup State
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const result = await loadNectorReviews();
        
        // Transform stats array to breakdown object if needed
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (Array.isArray(result.stats)) {
            result.stats.forEach(s => {
                breakdown[s.rating] = parseInt(s.count);
            });
        }

        // Calculate average if not provided
        let average = result.average || 0;
        if (!average && result.items?.length > 0) {
            const sum = result.items.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0);
            average = (sum / result.items.length).toFixed(1);
        }

        setStats({
          total: result.count,
          average: average,
          breakdown: breakdown
        });

        // Extract gallery
        const galleryItems = [];
        result.items.forEach((r, idx) => {
            const uploads = Array.isArray(r.uploads) ? r.uploads : (r.uploads?.uploads || []);
            uploads.forEach(u => {
                if (u?.link && u.type === 'image') {
                    galleryItems.push({ url: u.link, reviewId: r._id || r.id });
                }
            });
        });
        setGallery(galleryItems);
        setAllData(result.items);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...(allData || [])];

    // Filter by rating
    if (filterRating !== "all") {
      result = result.filter(r => Math.round(parseFloat(r.rating)) === parseInt(filterRating));
    }

    // Sort by
    result.sort((a, b) => {
      const dA = new Date(a.posted_at || a.created_at || 0);
      const dB = new Date(b.posted_at || b.created_at || 0);
      
      if (sortBy === "newest") return dB - dA;
      if (sortBy === "oldest") return dA - dB;
      if (sortBy === "highest") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (sortBy === "lowest") return (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
      
      if (sortBy === "images") {
        const aImgs = (Array.isArray(a.uploads) ? a.uploads : (a.uploads?.uploads || [])).length;
        const bImgs = (Array.isArray(b.uploads) ? b.uploads : (b.uploads?.uploads || [])).length;
        return bImgs - aImgs;
      }
      
      // Featured/Default
      return ((b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)) || (dB - dA);
    });

    return result;
  }, [allData, filterRating, sortBy]);

  // Paginated reviews
  const displayedReviews = useMemo(() => {
    return filteredAndSortedReviews.slice(0, visibleCount);
  }, [filteredAndSortedReviews, visibleCount]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedReviews.length / 12));
  }, [filteredAndSortedReviews]);

  const handleFilterChange = (val) => {
    setFilterRating(val);
    setVisibleCount(12);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setVisibleCount(12);
  };

  const openPopup = (idxOrId) => {
    if (typeof idxOrId === 'string') {
        const index = filteredAndSortedReviews.findIndex(r => (r._id || r.id) === idxOrId);
        if (index !== -1) {
            setPopupState({ isOpen: true, index });
        }
    } else {
        setPopupState({ isOpen: true, index: idxOrId });
    }
  };

  // Prepare mapped reviews for the popup
  const mappedReviews = filteredAndSortedReviews?.map(r => {
    const name = (r.name || 'Customer').trim();
    const uploads = Array.isArray(r.uploads) ? r.uploads : (r.uploads?.uploads || []);
    const images = uploads.filter(u => u?.link && (u.type === 'image' || !u.type)).map(u => u.link);
    
    return {
        ...r,
        productTitle: r.reference_product_name || "Product",
        productImage: getValidSrc(r.reference_product_image || "/images/product/1.jpg"),
        productHandle: r.reference_product_handle || "",
        personName: name,
        review: r.description || r.body || "",
        images: images,
        verified: r.is_verified === true
    };
  }) || [];

  const getPercentage = (count) => {
    const total = stats.total;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  // Calculate recommendation percentage
  const recommendCount = (stats.breakdown[4] || 0) + (stats.breakdown[5] || 0);
  const totalForRecommend = Object.values(stats.breakdown).reduce((a, b) => Number(a) + Number(b), 0);
  const recommendPercent = totalForRecommend > 0 ? Math.round((recommendCount / totalForRecommend) * 100) : 97;

  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-20 pt-16">
      <div className="container-main max-w-7xl">
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 font-abhaya capitalize text-black">
          Customer Reviews
        </h1>
        
        {/* Stats Summary */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 mb-12">
          {/* Average Score */}
          <div className="flex flex-col items-center">
            <span className="text-6xl font-medium text-[#1A1A1A] mb-4">
              {stats.average}
            </span>
            <div className="flex gap-1 mb-4 text-[#D4A373]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={`summary-star-${i}`}
                  size={18}
                  fill={i <= Math.round(stats.average) ? "currentColor" : "none"}
                  className={
                    i <= Math.round(stats.average) ? "" : "text-zinc-200"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              {stats.total} reviews
            </span>
          </div>

          {/* Progress Bars */}
          <div className="flex-grow max-w-lg w-full space-y-2">
            {[5, 4, 3, 2, 1].map((num) => {
              const count = stats.breakdown[num] || 0;
              const percent = getPercentage(count);
              return (
                <div
                  key={`progress-${num}`}
                  className="flex items-center gap-6 group"
                >
                  <span className="text-[11px] font-normal text-gray-600 w-12 whitespace-nowrap">
                    {num} Stars
                  </span>
                  <div className="flex-grow h-[3px] bg-[#EBE0D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#A36B6F] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-normal text-gray-400 w-8 text-right">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="flex flex-col items-center">
            <span className="text-5xl font-medium text-[#1A1A1A] mb-2">
              {recommendPercent}%
            </span>
            <p className="text-[10px] text-gray-500 max-w-[120px] uppercase tracking-widest leading-relaxed text-center">
              Would recommend Lucira
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-10">
          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
          >
            Write a Review
          </button>
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
                el: ".reviews-page-scrollbar",
              }}
              className="w-full !pb-10"
            >
              {gallery.map((item, i) => (
                <SwiperSlide key={i} className="!w-auto">
                  <div 
                      onClick={() => openPopup(item.reviewId)}
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
            <div className="reviews-page-scrollbar !static !h-1 !bg-gray-200 !mt-2 !rounded-full overflow-hidden"></div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-row flex-wrap md:flex-nowrap justify-between gap-2 md:gap-6 mb-8 border-b border-gray-200 pb-6">
          
          <div className="flex items-center gap-2 md:gap-3 order-1 md:order-0">
            <span className="text-[12px] md:text-sm font-semibold text-gray-600">Rating:</span>
            <Select value={filterRating} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-auto min-w-20 md:min-w-30 border-none bg-transparent font-bold text-[12px] md:text-sm uppercase focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer gap-2">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem
                  value="all"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  All Ratings
                </SelectItem>
                <SelectItem
                  value="5"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  5 Stars
                </SelectItem>
                <SelectItem
                  value="4"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  4 Stars
                </SelectItem>
                <SelectItem
                  value="3"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  3 Stars
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-center order-0 md:order-1 basis-full lg:basis-auto">
            <span className="text-lg font-bold text-black uppercase tracking-[0.2em]">
              {stats.total} Verified Reviews
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 order-2">
            <span className="text-[12px] md:text-sm font-semibold text-gray-600">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto min-w-30 md;min-w-35 border-none bg-transparent font-bold text-[12px] md:text-sm uppercase focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer gap-2">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem
                  value="featured"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Featured
                </SelectItem>
                <SelectItem
                  value="newest"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Newest First
                </SelectItem>
                <SelectItem
                  value="oldest"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Oldest First
                </SelectItem>
                <SelectItem
                  value="highest"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Highest Rated
                </SelectItem>
                <SelectItem
                  value="lowest"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Lowest Rated
                </SelectItem>
                <SelectItem
                  value="images"
                  className="font-bold text-xs uppercase tracking-widest"
                >
                  Images First
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2 lg:gap-4">
          {displayedReviews.map((review, idx) => (
            <ReviewCard
              key={review.id || `review-${idx}`}
              review={review}
              onClick={() => openPopup(idx)}
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && displayedReviews.length === 0 && (
          <div className="text-center py-32 bg-white/30 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">No reviews found for this criteria.</p>
            <button onClick={() => { setFilterRating("all"); setSortBy("featured"); }} className="text-[#5A413F] font-black text-xs uppercase tracking-widest border-b-2 border-[#5A413F] pb-1 hover:text-black hover:border-black transition-colors">Reset filters</button>
          </div>
        )}

        {/* Load More */}
        {visibleCount < filteredAndSortedReviews.length && (
          <div className="mt-20 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              disabled={loading}
              className="w-full md:w-auto px-14 py-5 bg-[#5A413F] text-white font-bold text-sm uppercase tracking-[0.3em] rounded shadow-2xl hover:bg-[#4a3533] transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "Loading Stories..." : "Load More Stories"}
            </button>
          </div>
        )}

        {loading && page === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-96 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
                ))}
            </div>
        )}
      </div>

      <ReviewDetailedPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        reviews={mappedReviews}
        activeIndex={popupState.index}
        onIndexChange={(index) => setPopupState({ ...popupState, index })}
      />

      <WriteReviewForm 
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
      />

      <style jsx global>{`
        .reviews-page-scrollbar .swiper-scrollbar-drag {
          background: #5a413f !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}

function ReviewCard({ review, onClick }) {
  const name = (review.name || "Customer").trim();
  const rating = parseFloat(review.rating) || 0;
  const text = review.description || review.body;
  const uploads = Array.isArray(review.uploads)
    ? review.uploads
    : review.uploads?.uploads || [];
  const images = uploads
    .filter((u) => u?.link && (u.type === "image" || !u.type))
    .map((u) => u.link);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-4 sm:p-6 md:p-8 lg:p-6 rounded-xl md:rounded-2xl flex flex-col gap-4 md:gap-6 border border-gray-50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold border-4 border-white uppercase text-base sm:text-xl shadow-sm relative overflow-hidden shrink-0">
            {review.personImage ? (
              <Image
                src={getValidSrc(review.personImage)}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              name.charAt(0)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <span className="font-bold text-gray-800 text-sm sm:text-lg capitalize tracking-wide truncate max-w-full">
                {name}
              </span>
              {review.is_verified && (
                <div className="flex items-center gap-1 text-accent font-black uppercase tracking-wide text-[8px] sm:text-[9px] shrink-0">
                  <CheckCircle size={12} className="fill-accent text-white" />
                  <span>Verified</span>
                </div>
              )}
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

            <span className="block lg:hidden mt-2 text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wide">
              {formatDate(review.posted_at || review.created_at)}
            </span>
          </div>
        </div>

        <span className="hidden lg:block shrink-0 text-xs font-bold text-gray-600 uppercase tracking-wide">
          {formatDate(review.posted_at || review.created_at)}
        </span>
      </div>

      <div className="space-y-2 md:space-y-3 flex-grow">
        <h4 className="text-base sm:text-lg font-bold text-black leading-tight tracking-tight group-hover:text-primary transition-colors">
          {review.title}
        </h4>
        <p className="text-gray-500 leading-relaxed text-xs sm:text-sm italic line-clamp-4">
          &quot;{text}&quot;
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-1 sm:mt-2">
          {images.slice(0, 3).map((img, idx) => (
            <div
              key={`card-img-${idx}`}
              className="aspect-square w-full bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden relative border border-gray-100 shadow-sm"
            >
              <Image
                src={getValidSrc(img)}
                alt={`Review image ${idx}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Related Product Link */}
      <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between group/link">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-bold text-black group-hover/link:text-gray-900 transition-colors truncate tracking-widest">
                {review.reference_product_name}
            </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover/link:bg-black group-hover/link:text-white transition-all ml-2">
            <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
