"use client";

import { X, ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InstaPopup({ isOpen, onClose, data, activeIndex, onIndexChange }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !data || data.length === 0) return null;

  const item = data[activeIndex];
  if (!item) return null;

  const handlePrev = () => {
    const nextIndex = (activeIndex - 1 + data.length) % data.length;
    onIndexChange(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % data.length;
    onIndexChange(nextIndex);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 transition-all duration-300">
      
      {/* Navigation */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-white transition-all cursor-pointer outline-none bg-white/5 hover:bg-white/10 rounded-full p-3 backdrop-blur-sm"
      >
        <ChevronLeft size={40} strokeWidth={1.5} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-white transition-all cursor-pointer outline-none bg-white/5 hover:bg-white/10 rounded-full p-3 backdrop-blur-sm"
      >
        <ChevronRight size={40} strokeWidth={1.5} />
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Close Button */}
        <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[120] text-white hover:scale-110 transition-all cursor-pointer bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-md"
        >
            <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row h-full min-h-[500px] md:h-[750px]">
          
          {/* Left Side: Media */}
          <div className="w-full md:w-[65%] relative bg-black flex items-center justify-center overflow-hidden">
            {item.isVideo ? (
                <video 
                    src={item.videoUrl || item.image} 
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                />
            ) : (
                <div className="relative w-full h-full">
                    <Image
                        src={item.image}
                        alt="Instagram Media"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            )}
          </div>

          {/* Right Side: Info */}
          <div className="w-full md:w-[35%] p-8 md:p-12 flex flex-col bg-white border-l border-gray-100">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                        <Image src="/public/images/icons/small-logo.svg" alt="Lucira" fill className="object-cover bg-black p-2" />
                    </div>
                </div>
                <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">lucirajewelry</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lucira Jewelry</p>
                </div>
              </div>
              <Link 
                href="https://www.instagram.com/lucirajewelry" 
                target="_blank"
                className="text-pink-600 hover:scale-110 transition-transform"
              >
                <Instagram size={24} />
              </Link>
            </div>

            {/* Caption */}
            <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar mb-10">
              <p className="text-gray-600 leading-relaxed text-base font-medium italic">
                {item.caption || "Sparkle every day with Lucira's handcrafted elegance. ✨ From timeless classics to modern statements, find the piece that speaks to you. \n\n#LuciraJewelry #HandcraftedLuxury #FineJewelry #DiamondRings"}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-2">
                {["FineJewelry", "Luxury", "Elegance", "Lucira"].map(tag => (
                    <span key={tag} className="text-blue-600 font-bold text-sm hover:underline cursor-pointer">#{tag}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link 
                href="https://www.instagram.com/lucirajewelry" 
                target="_blank"
                className="mt-auto w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-center hover:bg-gray-900 transition-all shadow-xl active:scale-[0.98]"
            >
                View on Instagram
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9f9f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
