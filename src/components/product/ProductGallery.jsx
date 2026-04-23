"use client";

import React, { useMemo, useState, useEffect } from "react";
import LazyImage from "../common/LazyImage";
import { Play, Copy, X, ChevronLeft, ChevronRight, Maximize2, Share2, ZoomIn, ZoomOut, Eye, BookCopy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductGallerySkeleton from "./ProductGallerySkeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductGallery({ media = [], title = "", activeColor = "", onViewSimilar, hasSimilar = false }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const sortedMedia = useMemo(() => {
    if (!media || media.length === 0) return [];

    // 1. Define color matching logic
    const colorTerms = ["yellow", "white", "rose"];
    const currentBaseColor = activeColor.toLowerCase().split(" ")[0];

    const isMatch = (item) => {
      const alt = (item.alt || "").toLowerCase();
      const mentionsOtherColor = colorTerms.some(color => 
        color !== currentBaseColor && alt.includes(color)
      );
      return alt.includes(currentBaseColor) || !mentionsOtherColor;
    };

    // 2. Categorization
    const groups = {
      mq: [],
      ci: [],
      mh: [],
      mv: [],
      v360: [],
      cert: [],
      others: []
    };

    media.forEach((item) => {
      const alt = (item.alt || "").toLowerCase();
      if (alt.includes("cert")) groups.cert.push(item);
      else if (alt.includes("mq")) groups.mq.push(item);
      else if (alt.includes("ci")) groups.ci.push(item);
      else if (alt.includes("mh")) groups.mh.push(item);
      else if (alt.includes("mv")) groups.mv.push(item);
      else if (alt.includes("v360") || alt.includes("360v")) groups.v360.push(item);
      else groups.others.push(item);
    });

    const pool = [...groups.mq, ...groups.ci, ...groups.mh];
    const videos = [...groups.mv, ...groups.v360];
    const others = groups.others;
    const certificates = groups.cert;

    // Filter categories for the current active color
    const colorOthers = others.filter(isMatch);
    const colorPool = pool.filter(isMatch);
    const colorVideos = videos.filter(isMatch);
    // Certificates are universal, don't filter them by color
    const colorCerts = groups.cert;

    const result = [];
    
    // Position 1: First "other" image or "pool" image (in color)
    const firstItem = colorOthers[0] || colorPool[0] || colorVideos[0];
    if (firstItem) result.push(firstItem);

    // Position 2: Primary Video
    const mainVideo = colorVideos.find(v => !result.includes(v));
    if (mainVideo) {
      result.push(mainVideo);
    } else {
      const next = colorPool.find(i => !result.includes(i));
      if (next) result.push(next);
    }

    // Position 3: Next from pool
    const third = colorPool.find(i => !result.includes(i));
    if (third) result.push(third);

    // Position 4-5: sequential others
    const remainingOthers = colorOthers.filter(i => !result.includes(i));
    while (result.length < 5 && remainingOthers.length > 0) {
      result.push(remainingOthers.shift());
    }

    // Position 6: next from pool
    const remainingPool = colorPool.filter(i => !result.includes(i));
    if (result.length < 6 && remainingPool.length > 0) {
      result.push(remainingPool.shift());
    }

    // Position 7: Remaining Videos
    const extraVideos = colorVideos.filter(v => !result.includes(v));
    extraVideos.forEach(v => {
      if (!result.includes(v)) result.push(v);
    });

    // Add remaining from pool and others
    const finalImages = [
      ...remainingPool.filter(i => !result.includes(i)),
      ...remainingOthers.filter(i => !result.includes(i)),
    ];
    finalImages.forEach(img => {
      if (!result.includes(img)) result.push(img);
    });

    // Finally, certificates always at the very end
    colorCerts.forEach(c => {
      if (!result.includes(c)) result.push(c);
    });

    return result;
  }, [media, activeColor]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedMedia.length);
    setZoomLevel(1);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length);
    setZoomLevel(1);
  };

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 2 : 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out this ${title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        // We could add a toast here if needed
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, currentIndex]);

  if (!sortedMedia.length) {
    return <ProductGallerySkeleton />;
  }

  return (
    <>
      {/* Desktop Gallery */}
      <div className="hidden lg:grid grid-cols-2 gap-4 sticky top-20">
        {sortedMedia.map((item, index) => {
          const isVideo = item.type === "VIDEO" || item.type === "EXTERNAL_VIDEO";
          const isFirst = index === 0;

          return (
            <div 
              key={`${item.url}-${index}`}
              onClick={() => openLightbox(index)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-[#F7F7F7] cursor-zoom-in group ${isFirst ? "col-span-1" : ""}`}
            >
              {isVideo ? (
                <video 
                  poster={item.preview || null}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  disablePictureInPicture
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                  {item.sources && item.sources.length > 0 ? (
                    <>
                      {item.sources.filter(s => s.format === 'mp4').map((source, sIdx) => (
                        <source key={sIdx} src={source.url} type={source.mimeType} />
                      ))}
                      {item.sources.filter(s => s.format !== 'mp4').map((source, sIdx) => (
                        <source key={sIdx} src={source.url} type={source.mimeType} />
                      ))}
                    </>
                  ) : (
                    <source src={item.url || null} type={item.mimeType || "video/mp4"} />
                  )}
                </video>
              ) : (
                <LazyImage 
                  src={item.url || "/images/product/1.jpg"} 
                  alt={item.alt || title} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              
              {isFirst && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/95 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.05em] shadow-sm">Best Seller</span>
                  <span className="bg-white/95 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.05em] shadow-sm">Fast Shipping</span>
                </div>
              )}

              {isVideo && (
                <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-full">
                  <Play size={14} fill="black" />
                </div>
              )}

              {index === 1 && hasSimilar && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSimilar();
                  }}
                  className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors hover:cursor-pointer z-10 group/sim"
                >
                  <BookCopy size={20} className="text-zinc-700 group-hover/sim:scale-110 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Gallery */}
      <div className="lg:hidden flex flex-col gap-3">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7]">
          <Swiper
            spaceBetween={0}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Thumbs]}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            className="w-full h-full"
          >
            {sortedMedia.map((item, index) => {
              const isVideo = item.type === "VIDEO" || item.type === "EXTERNAL_VIDEO";
              return (
                <SwiperSlide key={index} onClick={() => openLightbox(index)}>
                  <div className="w-full h-full relative">
                    {isVideo ? (
                      <video 
                        poster={item.preview || null}
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        className="w-full h-full object-cover"
                      >
                         {item.sources && item.sources.length > 0 ? (
                            <>
                              {item.sources.filter(s => s.format === 'mp4').map((source, sIdx) => (
                                <source key={sIdx} src={source.url} type={source.mimeType} />
                              ))}
                            </>
                          ) : (
                            <source src={item.url || null} type={item.mimeType || "video/mp4"} />
                          )}
                      </video>
                    ) : (
                      <LazyImage 
                        src={item.url || "/images/product/1.jpg"} 
                        alt={item.alt || title} 
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Badges Overlay */}
          <div className="absolute top-4 left-2 flex flex-col gap-2 z-10 pointer-events-none">
            <span className="bg-white/95 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.05em] shadow-sm w-fit">Best Seller</span>
            <span className="bg-white/95 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.05em] shadow-sm w-fit">Fast Shipping</span>
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute bottom-4 left-2 right-2 flex justify-between items-center z-10">
             <button className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full text-[12px] font-bold flex items-center gap-2 shadow-sm border border-gray-100 uppercase tracking-wider">
               <Eye size={16} /> Virtual try on
             </button>
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onViewSimilar();
               }}
               className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full text-[12px] font-bold flex items-center gap-2 shadow-sm border border-gray-100 uppercase tracking-wider"
             >
               <Copy size={16} /> Similar items
             </button>
          </div>
        </div>

        {/* Thumbnail Slider */}
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView="auto"
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Thumbs]}
          className="w-full thumbnails-swiper"
        >
          {sortedMedia.map((item, index) => {
             const isVideo = item.type === "VIDEO" || item.type === "EXTERNAL_VIDEO";
             return (
               <SwiperSlide key={index} className="!w-[70px]">
                 <div className={`aspect-square relative rounded-lg overflow-hidden bg-[#F7F7F7] border-2 transition-colors ${currentIndex === index ? 'border-black' : 'border-transparent'}`}>
                    {isVideo ? (
                      <div className="w-full h-full relative">
                        <LazyImage src={item.preview || item.url} alt={item.alt} fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={12} fill="black" className="opacity-70" />
                        </div>
                      </div>
                    ) : (
                      <LazyImage src={item.url} alt={item.alt} fill className="object-cover" />
                    )}
                 </div>
               </SwiperSlide>
             );
          })}
        </Swiper>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 text-white z-[2001]">
              <div className="text-xl font-medium tracking-wider">
                {currentIndex + 1} / {sortedMedia.length}
              </div>
              <div className="flex items-center gap-8">
                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-gray-300 transition-colors p-1"
                >
                  <Maximize2 size={24} />
                </button>
                <button 
                  onClick={handleShare}
                  className="hover:text-gray-300 transition-colors p-1"
                >
                  <Share2 size={24} />
                </button>
                <button 
                  onClick={toggleZoom}
                  className="hover:text-gray-300 transition-colors p-1"
                >
                  {zoomLevel === 1 ? <ZoomIn size={24} /> : <ZoomOut size={24} />}
                </button>
                <button 
                  onClick={() => setIsLightboxOpen(false)}
                  className="hover:text-gray-300 transition-colors p-1"
                >
                  <X size={36} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 md:px-24">
              <button 
                onClick={prevSlide}
                className="absolute left-4 md:left-8 z-[2001] bg-black/20 hover:bg-black/40 border border-white/10 p-4 rounded-full text-white transition-all backdrop-blur-sm"
              >
                <ChevronLeft size={36} strokeWidth={1.5} />
              </button>
              
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: zoomLevel,
                    cursor: zoomLevel > 1 ? "grab" : "zoom-in",
                  }}
                  whileDrag={{ cursor: "grabbing" }}
                  drag={zoomLevel > 1}
                  dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  dragElastic={0.1}
                  onClick={(e) => {
                    if (zoomLevel === 1) setZoomLevel(2);
                    else {
                      setZoomLevel(1);
                      // Reset position on zoom out
                    }
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="relative w-full h-full flex items-center justify-center max-w-[85vh] mx-auto"
                >
                  {sortedMedia[currentIndex].type === "VIDEO" || sortedMedia[currentIndex].type === "EXTERNAL_VIDEO" ? (
                    <video 
                      src={sortedMedia[currentIndex].url || null}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                  ) : (
                    <LazyImage 
                      src={sortedMedia[currentIndex].url || "/images/product/1.jpg"}
                      alt={sortedMedia[currentIndex].alt || title}
                      fill
                      className="object-contain shadow-2xl pointer-events-none"
                    />
                  )}
                </motion.div>
              </div>

              <button 
                onClick={nextSlide}
                className="absolute right-4 md:right-8 z-[2001] bg-black/20 hover:bg-black/40 border border-white/10 p-4 rounded-full text-white transition-all backdrop-blur-sm"
              >
                <ChevronRight size={36} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}