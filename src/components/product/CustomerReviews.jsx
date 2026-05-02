"use client";

import { Star, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useMemo } from "react";
import ReviewDetailedPopup from "@/components/review/ReviewDetailedPopup";
import WriteReviewForm from "@/components/review/WriteReviewForm";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadNectorReviews } from "@/lib/nector";

// Helper to ensure image src is a valid string URL
const getValidSrc = (src, fallback = "/images/product/1.jpg") => {
  if (typeof src === "string" && src.trim() !== "") return src;
  if (src && typeof src === "object" && src.url) return src.url;
  return fallback;
};

export default function CustomerReviews({
  reviews,
  productId,
  productTitle,
  productImage,
  productHandle,
}) {
  const [popupState, setPopupState] = useState({ isOpen: false, index: 0 });
  const [data, setData] = useState({
    count: 0,
    average: 0,
    stats: { breakdown: {} },
    list: [],
  });
  const [gallery, setGallery] = useState([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [usedFallback, setUsedFallback] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function initReviews() {
      setLoading(true);
      try {
        console.log("[CustomerReviews] Loading reviews for:", productId);
        // Use the imported function
        if (typeof loadNectorReviews === "undefined") {
          console.error("[CustomerReviews] loadNectorReviews is UNDEFINED!");
          return;
        }

        const result = await loadNectorReviews(productId);

        // Transform stats array to breakdown object if needed
        const breakdown = {};
        if (Array.isArray(result.stats)) {
          result.stats.forEach((s) => {
            breakdown[s.rating] = s.count;
          });
        } else if (result.stats?.breakdown) {
          Object.assign(breakdown, result.stats.breakdown);
        }

        // Calculate average if not provided
        let average = result.average || 0;
        if (!average && result.items?.length > 0) {
          const sum = result.items.reduce(
            (s, r) => s + (parseFloat(r.rating) || 0),
            0,
          );
          average = (sum / result.items.length).toFixed(1);
        }

        setData({
          count: result.count,
          average: average,
          stats: { breakdown },
          list: result.items,
        });

        // Extract gallery
        const galleryItems = [];
        result.items.forEach((r, idx) => {
          const uploads = Array.isArray(r.uploads)
            ? r.uploads
            : r.uploads?.uploads || [];
          uploads.forEach((u) => {
            if (u?.link && u.type === "image") {
              galleryItems.push({ url: u.link, reviewIndex: idx });
            }
          });
        });
        setGallery(galleryItems);
        setIsGlobal(!result.isProductView);
        setUsedFallback(result.usedFallback);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    initReviews();
  }, [productId, refreshTrigger]);

  const filteredAndSortedReviews = useMemo(() => {
    if (isGlobal) return data.list;

    let result = [...(data.list || [])];

    // Filter by rating
    if (filterRating !== "all") {
      result = result.filter(
        (r) => Math.round(r.rating) === parseInt(filterRating),
      );
    }

    // Sort by
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      if (sortBy === "images") {
        const aImgs = a.images?.length || 0;
        const bImgs = b.images?.length || 0;
        return bImgs - aImgs;
      }
      return 0; // Default (featured/none)
    });

    return result;
  }, [data.list, filterRating, sortBy, isGlobal]);

  if (loading && data.list.length === 0)
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[#FEF5F1]">
        <div className="w-8 h-8 border-4 border-[#5A413F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (data.count === 0)
    return (
      <section
        className="w-full md:py-20 py-15 bg-[#FEF5F1] mt-15"
        id="reviews"
      >
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-abhaya">
            Customer Reviews
          </h2>
          <div className="py-20 bg-white/30 rounded-3xl border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-400 font-black uppercase tracking-widest mb-6">
              No reviews yet for this product.
            </p>
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-10 py-4 bg-[#5A413F] text-white font-black text-xs uppercase tracking-[0.2em] rounded shadow-lg hover:bg-[#4a3533] transition-all active:scale-95"
            >
              Be the first to review
            </button>
          </div>
        </div>
        <WriteReviewForm
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          productId={productId}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
          productTitle={productTitle}
          productImage={productImage}
          productHandle={productHandle}
        />
      </section>
    );

  const handleFilterChange = (val) => {
    setFilterRating(val);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
  };

  const getPercentage = (count) => {
    const total = isGlobal ? data.stats.total : data.count;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  const openPopup = (reviewIdOrIndex) => {
    let index = -1;
    if (typeof reviewIdOrIndex === "string") {
      index = filteredAndSortedReviews.findIndex(
        (r) => r.id === reviewIdOrIndex,
      );
    } else {
      index = reviewIdOrIndex;
    }

    if (index !== -1) {
      setPopupState({ isOpen: true, index });
    }
  };

  // Prepare mapped reviews for the popup
  const mappedReviews =
    filteredAndSortedReviews?.map((r) => {
      const name = (r.name || "Customer").trim();
      const uploads = Array.isArray(r.uploads)
        ? r.uploads
        : r.uploads?.uploads || [];
      const images = uploads
        .filter((u) => u?.link && (u.type === "image" || !u.type))
        .map((u) => u.link);

      return {
        ...r,
        productTitle: r.reference_product_name || productTitle,
        productImage: getValidSrc(r.reference_product_image || productImage),
        productHandle: r.reference_product_handle || productHandle,
        personName: name,
        review: r.description || r.body || "",
        images: images,
        verified: r.is_verified === true,
      };
    }) || [];

  const recommendCount =
    Number(data.stats.breakdown[4] || 0) + Number(data.stats.breakdown[5] || 0);
  const totalForRecommend = Object.values(data.stats.breakdown).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  );
  const recommendPercent =
    totalForRecommend > 0
      ? Math.round((recommendCount / totalForRecommend) * 100)
      : 97;

  return (
    <section className="w-full md:py-20 py-15 bg-[#FEF5F1] mt-15" id="reviews">
      <div className="container-main">
        {/* Heading */}
        <div className="md:mb-16 mb:10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 font-abhaya">
              {isGlobal ? "Customer Stories" : "Customer Reviews"}
            </h2>
            {isGlobal && (
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
                Showing top experiences from across our collections
              </p>
            )}
          </div>
          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="px-8 py-4 bg-[#5A413F] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded shadow-lg hover:bg-[#4a3533] transition-all active:scale-95 shrink-0"
          >
            Write a Review
          </button>
        </div>

        {/* Stats Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/30 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm mb-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-gray-700 mb-2">
              {data.average}
            </span>
            <div className="flex gap-1 mb-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={`summary-star-${i}`}
                  size={24}
                  fill={i <= Math.round(data.average) ? "currentColor" : "none"}
                  className={
                    i <= Math.round(data.average) ? "" : "text-zinc-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase">
              {data.count} reviews
            </span>
          </div>

          <div className="flex-grow max-w-md w-full space-y-3">
            {[5, 4, 3, 2, 1].map((num) => {
              const count = isGlobal
                ? data.stats.breakdown[num] || 0
                : data.list?.filter((r) => Math.round(r.rating) === num)
                    .length || 0;
              const percent = getPercentage(count);
              return (
                <div
                  key={`progress-${num}`}
                  className="flex items-center gap-4 group"
                >
                  <span className="text-[10px] font-black text-gray-600 w-14 whitespace-nowrap uppercase tracking-tighter">
                    {num} Stars
                  </span>
                  <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 w-10 text-right">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900 mb-2">
              {recommendPercent}%
            </span>
            <p className="text-xs font-black text-gray-600 max-w-[120px] uppercase tracking-widest leading-relaxed text-center">
              Would recommend Lucira
            </p>
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
                    onClick={() =>
                      openPopup(isGlobal ? item.reviewId : item.reviewIndex)
                    }
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
        <div className="flex flex-row flex-wrap md:flex-nowrap justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
          
          <div className="flex items-center gap-2 md:gap-3 order-1 md:order-0">
            <span className="text-sm font-semibold text-gray-600">Rating:</span>
            <Select value={filterRating} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-auto min-w-20 md:min-w-30 border-none bg-transparent font-bold text-sm uppercase focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer gap-2">
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
              {data.count} Verified Reviews
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 order-2">
            <span className="text-sm font-semibold text-gray-600">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto min-w-30 md;min-w-35 border-none bg-transparent font-bold text-sm uppercase focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {filteredAndSortedReviews?.map((review, idx) => (
            <ReviewCard
              key={review.id || `review-${idx}`}
              review={review}
              onClick={() => openPopup(idx)}
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredAndSortedReviews.length === 0 && (
          <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">
              No reviews found for this criteria.
            </p>
            <button
              onClick={() => {
                setFilterRating("all");
                setSortBy("featured");
              }}
              className="text-[#5A413F] font-black text-xs uppercase tracking-widest border-b-2 border-[#5A413F] pb-1 hover:text-black hover:border-black transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-20 text-center">
          <Link
            href="/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-7 py-4 h-auto text-sm md:text-base font-bold uppercase rounded-sm bg-primary hover:bg-[#4A3934] text-white transition-colors"
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

      <WriteReviewForm
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        productId={productId}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        productTitle={productTitle}
        productImage={productImage}
        productHandle={productHandle}
      />

      <style jsx global>{`
        .product-review-scrollbar .swiper-scrollbar-drag {
          background: #5a413f !important;
          height: 100% !important;
        }
      `}</style>
    </section>
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
      className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl flex flex-col gap-4 md:gap-6 border border-gray-50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold border-4 border-white uppercase text-base sm:text-xl shadow-sm relative overflow-hidden shrink-0">
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
    </div>
  );
}
