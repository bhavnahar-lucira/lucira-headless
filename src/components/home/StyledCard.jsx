"use client";

import { forwardRef } from "react";
import { Play, ShoppingBag } from "lucide-react";

const StyledVideoCard = forwardRef(({ video, onClick }, ref) => {
  return (
    <div 
      onClick={onClick}
      className="relative rounded-lg overflow-hidden group/card cursor-pointer shadow-md bg-gray-200 w-full"
    >
      <video
        ref={ref}
        src={video}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        className="w-full h-135 object-cover"
      />

      {/* Shopping Bag Icon */}
      <div className="absolute top-4 right-4 z-10 transition-transform duration-300 group-hover/card:scale-110">
        <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
          <ShoppingBag size={18} className="text-[#333]" />
        </div>
      </div>

      {/* Play Button Overlay - Appears ONLY on specific card hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl scale-75 group-hover/card:scale-100 transition-transform duration-300">
          <Play size={30} fill="white" className="text-white ml-1 opacity-90" />
        </div>
      </div>
    </div>
  );
});

StyledVideoCard.displayName = "StyledVideoCard";

export default StyledVideoCard;