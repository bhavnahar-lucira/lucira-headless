"use client";

import { Phone, Calendar, Navigation, Clock, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function FindLuciraStore() {
  return (
    <section className="w-full py-8 bg-gray-50 mt-15">
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-17">
    <div className="w-full text-center mb-8 md:mb-12">
      <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold mb-4">
        Find in Lucira Store Near You
      </h2>

      {/* Pincode */}
      <div className="flex flex-row justify-center items-center gap-0 mb-3 max-w-lg mx-auto">
        <Input
          placeholder="Enter pin code"
          className="h-10 sm:h-12 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-[#D1D1D1] placeholder:text-gray-400 text-sm"
        />
        <Button className="h-10 sm:h-12 px-4 sm:px-10 rounded-l-none bg-black hover:bg-black/90 text-white text-xs sm:text-sm font-bold tracking-widest shrink-0">
          CHECK
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-700">
        <Clock size={16} />
        <span>Estimated free dispatch by <b>January 21, 2026</b></span>
      </div>
    </div>

    {/* Store Card */}
    <div className="w-full bg-white border border-[#E5E5E5] rounded-sm overflow-hidden flex flex-col md:grid md:grid-cols-[45%_55%] min-h-fit md:min-h-[450px]">
      {/* Map / Image */}
      <div className="relative h-48 sm:h-64 md:h-full min-h-[200px]">
        <Image
          src="/images/store.jpg"
          alt="Pune Lucira Store"
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-[#D1EBE3] text-[#006D4E] px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-medium border border-[#A3D9C9] z-10">
          <span className="w-2 h-2 bg-[#006D4E] rounded-full animate-pulse"></span>
          Open Now
        </div>
      </div>

      {/* Store Info */}
      <div className="p-6 sm:p-8 md:px-12 md:py-8 flex flex-col justify-center">
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl md:text-2xl font-semibold italic mb-2 md:mb-4">
                Pune Lucira Store
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-gray-600">
                Shop no. 3,4, Balgandharv Chowk, Sai Square, 5 & 6,
                Jangali Maharaj Rd, Pune, Maharashtra 411005
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="#FFC107" color="#FFC107" />
                ))}
              </div>
              <span className="text-xs md:text-sm font-bold">4.8</span>
            </div>
          </div>

          <div className="bg-[#F3F4F6] px-4 py-2.5 md:px-5 md:py-3 rounded-full flex items-center gap-3 w-fit">
            <Clock size={16} className="text-black shrink-0" />
            <span className="text-xs md:text-sm font-semibold">
              Timings: <span className="font-normal block sm:inline">Mon - Sun | 10:30 am - 10:00 pm</span>
            </span>
          </div>

          {/* Product preview */}
          <div className="bg-[#F9FAFB] p-3 md:p-4 rounded-sm border border-gray-100">
            <div className="flex gap-3 md:gap-4 items-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E5E5E5] rounded-sm shrink-0"></div>
              <div className="space-y-1.5 md:space-y-2 min-w-0">
                <p className="font-bold text-xs md:text-sm leading-tight truncate">
                  2 CT Round Cut with Side Diamonds Accent Engagement Ring
                </p>
                <div className="bg-white border border-gray-100 rounded-sm p-1.5 md:p-2 flex flex-col gap-0.5 w-fit">
                  <div className="flex items-center gap-2">
                     <Clock size={10} className="text-gray-400" />
                     <span className="text-[10px] md:text-xs text-gray-500">Size 12 | Yellow Gold</span>
                  </div>
                  <p className="text-[10px] md:text-xs font-semibold text-gray-900">
                    Available by 27 January, 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 pt-6 md:pt-8">
          <Button variant="outline" className="h-10 md:h-12 px-4 md:px-6 w-full sm:w-auto hover:cursor-pointer rounded-sm border-primary text-xs md:text-sm font-medium tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
            <Navigation size={16} />
            DIRECT ME
          </Button>

          <Button variant="outline" className="h-10 md:h-12 px-4 md:px-6 w-full sm:w-auto hover:cursor-pointer rounded-sm border-primary text-xs md:text-sm font-medium tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
            <Phone size={16} />
            CALL US
          </Button>

          <Button className="h-10 md:h-12 px-4 md:px-6 w-full sm:w-auto hover:cursor-pointer rounded-sm text-white text-xs md:text-sm font-medium tracking-wider flex items-center justify-center gap-2">
            <Calendar size={16} />
            BOOK APPOINTMENT
          </Button>
        </div>
      </div>
    </div>

    {/* Carousel Controls */}
    <div className="flex justify-between items-center mt-6 px-1 md:px-2">
      <div className="flex items-center gap-2">
        <div className="w-6 md:w-8 h-1.5 bg-black rounded-full"></div>
        <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-300 rounded-full"></div>
        <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-300 rounded-full"></div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <button className="w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0">
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <button className="w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0">
          <ChevronRight size={20} className="md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  </div>
</section>
  );
}
