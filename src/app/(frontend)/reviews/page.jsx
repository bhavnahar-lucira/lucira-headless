"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, BadgeCheck, ChevronRight } from "lucide-react";
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

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [gallery, setGallery] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loadedImages, setLoadedImages] = useState({});
  const [allData, setAllData] = useState([]);

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
    return filteredAndSortedReviews.slice(0, page * 20);
  }, [filteredAndSortedReviews, page]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedReviews.length / 20));
  }, [filteredAndSortedReviews]);

  const handleFilterChange = (val) => {
    setFilterRating(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setPage(1);
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

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  // Prepare mapped reviews for the popup
  const mappedReviews = filteredAndSortedReviews?.map(r => {
    const name = (r.name || 'Customer').trim();
    const uploads = Array.isArray(r.uploads) ? r.uploads : (r.uploads?.uploads || []);
    const images = uploads.filter(u => u?.link && (u.type === 'image' || !u.type)).map(u => u.link);
    
    return {
        ...r,
        productTitle: r.reference_product_name || "Product",
        productImage: r.reference_product_image || "/images/product/1.jpg",
        productHandle: r.reference_product_handle || "",
        personName: name,
        review: r.description || r.body || "",
        images: images,
        verified: r.is_verified === true
    };
  }) || [];

  // Calculate recommendation percentage
  const recommendCount = (stats.breakdown[4] || 0) + (stats.breakdown[5] || 0);
  const totalForRecommend = Object.values(stats.breakdown).reduce((a, b) => Number(a) + Number(b), 0);
  const recommendPercent = totalForRecommend > 0 ? Math.round((recommendCount / totalForRecommend) * 100) : 0;

  return (
    <div className="bg-[#FEF5F1] min-h-screen pb-20 pt-16">
      <div className="container-main max-w-6xl">
        
        {/* Main Header / Stats */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-12">Customer Reviews</h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/30 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm">
            {/* Average Rating */}
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black text-gray-900 mb-2">{stats.average}</span>
              <div className="flex gap-1 mb-2 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    size={24} 
                    fill={i <= Math.round(stats.average) ? "currentColor" : "none"} 
                    className={i <= Math.round(stats.average) ? "" : "text-zinc-200"} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-600 uppercase">{stats.total} reviews</span>
            </div>

            {/* Stars Breakdown */}
            <div className="flex-grow max-w-md w-full space-y-3">
              {[5, 4, 3, 2, 1].map(num => {
                const count = stats.breakdown[num] || 0;
                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={num} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-black text-gray-600 w-14 whitespace-nowrap uppercase tracking-tighter">{num} Stars</span>
                    <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 w-10 text-right">{Math.round(percent)}%</span>
                  </div>
                );
              })}
            </div>

            {/* Recommend Percent */}
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-gray-900 mb-2">{recommendPercent}%</span>
              <p className="text-xs font-black text-gray-600 max-w-[120px] uppercase tracking-widest leading-relaxed text-center">Would recommend Lucira</p>
            </div>
          </div>

          <button 
            onClick={() => setIsWriteReviewOpen(true)}
            className="mt-10 px-12 py-4 bg-[#5A413F] text-white font-black text-xs uppercase tracking-[0.2em] rounded shadow-lg hover:bg-[#4a3533] transition-all active:scale-95"
          >
            Write A Review
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
                el: ".gallery-scrollbar",
              }}
              className="w-full !pb-10"
            >
              {gallery.map((item, i) => (
                <SwiperSlide key={i} className="!w-auto">
                  <div 
                      onClick={() => openPopup(item.reviewId)}
                      className="relative w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer group bg-gray-50"
                  >
                    {!loadedImages[`gallery-${i}`] && (
                        <div className="absolute inset-0 flex items-center justify-center z-[5]">
                            <Image src="/images/loader.gif" alt="Loading..." width={32} height={32} className="object-contain" />
                        </div>
                    )}
                    <Image 
                      src={item.url} 
                      alt="Review gallery" 
                      fill 
                      onLoad={() => handleImageLoad(`gallery-${i}`)}
                      className={`object-cover group-hover:scale-110 transition-transform duration-700 ${loadedImages[`gallery-${i}`] ? "opacity-100" : "opacity-0"}`} 
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
            {/* Custom Scroll Indicator */}
            <div className="gallery-scrollbar !static !h-1 !bg-gray-200 !mt-2 !rounded-full overflow-hidden"></div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">Rating:</span>
              <Select value={filterRating} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[140px] border-none bg-transparent font-bold text-sm uppercase tracking-widest focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Ratings</SelectItem>
                  <SelectItem value="5" className="font-bold text-xs uppercase tracking-widest">5 Stars</SelectItem>
                  <SelectItem value="4" className="font-bold text-xs uppercase tracking-widest">4 Stars</SelectItem>
                  <SelectItem value="3" className="font-bold text-xs uppercase tracking-widest">3 Stars</SelectItem>
                  <SelectItem value="2" className="font-bold text-xs uppercase tracking-widest">2 Stars</SelectItem>
                  <SelectItem value="1" className="font-bold text-xs uppercase tracking-widest">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-lg font-bold text-black uppercase tracking-[0.2em]">{stats.total} verified reviews</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px] border-none bg-transparent font-bold text-sm uppercase tracking-widest focus:ring-0 focus:ring-offset-0 p-0 h-auto cursor-pointer">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="newest" className="font-bold text-xs uppercase tracking-widest">Newest First</SelectItem>
                  <SelectItem value="oldest" className="font-bold text-xs uppercase tracking-widest">Oldest First</SelectItem>
                  <SelectItem value="highest" className="font-bold text-xs uppercase tracking-widest">Highest Rated</SelectItem>
                  <SelectItem value="lowest" className="font-bold text-xs uppercase tracking-widest">Lowest Rated</SelectItem>
                  <SelectItem value="images" className="font-bold text-xs uppercase tracking-widest">Images First</SelectItem>
                  <SelectItem value="videos" className="font-bold text-xs uppercase tracking-widest">Videos First</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {displayedReviews.map((review, idx) => {
            const name = (review.name || 'Customer').trim();
            const rating = parseFloat(review.rating) || 0;
            const text = review.description || review.body || "";
            const uploads = Array.isArray(review.uploads) ? review.uploads : (review.uploads?.uploads || []);
            const images = uploads.filter(u => u?.link && (u.type === 'image' || !u.type)).map(u => u.link);
            
            return (
              <div 
                key={`${review._id || idx}`}
                onClick={() => openPopup(idx)}
                className="bg-white rounded-2xl p-8 border border-gray-50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col h-full cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl uppercase border-4 border-white shadow-sm relative overflow-hidden flex-shrink-0">
                      {review.personImage ? (
                          <div className="relative w-full h-full">
                              {!loadedImages[`avatar-${idx}`] && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-primary z-[5]">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                              )}
                              <Image 
                                  src={review.personImage} 
                                  alt={name} 
                                  fill 
                                  onLoad={() => handleImageLoad(`avatar-${idx}`)}
                                  className={`object-cover transition-opacity duration-300 ${loadedImages[`avatar-${idx}`] ? "opacity-100" : "opacity-0"}`} 
                              />
                          </div>
                      ) : (
                          name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                          {name}
                          {review.is_verified && (
                              <div className="flex items-center gap-1 text-[9px] text-accent font-black uppercase tracking-widest">
                                  <BadgeCheck size={14} className="fill-accent text-white" />
                                  Verified
                              </div>
                          )}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                      <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                              key={i} 
                              size={14} 
                              fill={i < Math.round(rating) ? "currentColor" : "none"} 
                              className={i < Math.round(rating) ? "" : "text-zinc-200"} 
                          />
                          ))}
                          <span className="ml-2 text-xs font-black text-gray-900 tracking-tighter">({rating}.0)</span>
                      </div>
                  </div>
                </div>
                
                <div className="mb-6 flex-grow">
                  <h4 className="font-black text-gray-900 text-lg mb-3 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{review.title}</h4>
                  <p className="text-gray-500 leading-relaxed text-sm italic line-clamp-4">
                      "{text}"
                  </p>
                  {(review.posted_at || review.created_at) && (
                      <div className="mt-4 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                          {new Date(review.posted_at || review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                  )}
                </div>

                {/* Review Images */}
                {images.length > 0 && (
                  <div className="flex gap-2.5 mt-2 mb-8">
                      {images.slice(0, 3).map((img, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                              {!loadedImages[`review-img-${idx}-${i}`] && (
                                  <div className="absolute inset-0 flex items-center justify-center z-[5]">
                                      <Image src="/images/loader.gif" alt="Loading..." width={20} height={20} className="object-contain" />
                                  </div>
                              )}
                              <Image 
                                  src={img} 
                                  alt="Review" 
                                  fill 
                                  onLoad={() => handleImageLoad(`review-img-${idx}-${i}`)}
                                  className={`object-cover group-hover:scale-105 transition-all duration-500 ${loadedImages[`review-img-${idx}-${i}`] ? "opacity-100" : "opacity-0"}`} 
                              />
                          </div>
                      ))}
                  </div>
                )}

                {/* Related Product Link */}
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between group/link">
                  <Link 
                      href={`/products/${review.reference_product_slug || ''}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-3 flex-1 min-w-0"
                  >
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative flex-shrink-0">
                          <Image src={review.reference_product_image || "/images/product/1.jpg"} alt={review.reference_product_name || "Product"} fill className="object-cover group-hover/link:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="text-sm font-bold text-black group-hover/link:text-gray-900 transition-colors truncate tracking-widest">
                          {review.reference_product_name}
                      </span>
                  </Link>
                  <Link 
                      href={`/products/${review.reference_product_slug || ''}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover/link:bg-black group-hover/link:text-white transition-all ml-2"
                  >
                      <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && mappedReviews.length === 0 && (
          <div className="text-center py-32 bg-white/30 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">No reviews found for this rating.</p>
            <button onClick={() => setFilterRating("all")} className="text-[#5A413F] font-black text-xs uppercase tracking-widest border-b-2 border-[#5A413F] pb-1 hover:text-black hover:border-black transition-colors">Show all reviews</button>
          </div>
        )}

        {/* Load More */}
        {page < totalPages && (
          <div className="mt-20 text-center">
            <button 
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="px-14 py-5 bg-[#5A413F] text-white font-black text-xs uppercase tracking-[0.3em] rounded shadow-2xl hover:bg-[#4a3533] transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "Loading Stories..." : "Load More Stories"}
            </button>
          </div>
        )}

        {loading && page === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-96 bg-white/50 rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .swiper-scrollbar-drag {
          background: #5A413F !important;
        }
        .gallery-scrollbar .swiper-scrollbar-drag {
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}
