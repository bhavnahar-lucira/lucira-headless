"use client";

import { Phone, Calendar, Navigation, Clock, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function FindLuciraStore() {
  return (
    <section className="w-full py-8 bg-gray-50 mt-15">
      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17">
        <div className="w-full text-center mb-12">
          <h2 className="text-28px font-bold mb-4">
            Find in Lucira Store Near You
          </h2>

          {/* Pincode */}
          <div className="flex justify-center items-center gap-0 mb-3 max-w-xl mx-auto">
            <Input
              placeholder="Enter pin code to check delivery time"
              className="h-12 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-[#D1D1D1] placeholder:text-gray-400 placeholder:text-sm"
            />
            <Button className="h-12 px-10 rounded-l-none bg-black hover:bg-black/90 text-white text-sm font-bold tracking-widest">
              CHECK
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
            <Clock size={16} />
            <span>Estimated free dispatch by <b>January 21, 2026</b></span>
          </div>
        </div>

        {/* Store Card */}
        <div className="w-full bg-white border border-[#E5E5E5] rounded-sm overflow-hidden grid md:grid-cols-[45%_55%] min-h-112.5">
          {/* Map / Image */}
          <div className="relative h-full min-h-95">
            <Image
              src="/images/store.jpg"
              alt="Pune Lucira Store"
              fill
              className="object-cover"
            />
            <div className="absolute top-6 right-6 bg-[#D1EBE3] text-[#006D4E] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-[#A3D9C9]">
              <span className="w-2 h-2 bg-[#006D4E] rounded-full"></span>
              Open Now
            </div>
          </div>

          {/* Store Info */}
          <div className="px-10 py-5 md:px-12 md:py-5 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold italic mb-4">
                    Pune Lucira Store
                  </h3>
                  <p className="leading-relaxed max-w-md">
                    Shop no. 3,4, Balgandharv Chowk, Sai Square, 5 & 6,
                    Jangali Maharaj Rd, Pune, Maharashtra 411005
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="#FFC107" color="#FFC107" />
                    ))}
                  </div>
                  <span className="text-sm">4.8</span>
                </div>
              </div>

              <div className="bg-[#F3F4F6] px-5 py-3 rounded-full flex items-center gap-3 w-fit">
                <Clock size={18} className="text-black" />
                <span className="text-base font-semibold">
                  Timings: <span className="font-normal ml-1">Monday - Sunday | 10:30 am - 10:00 pm</span>
                </span>
              </div>

              {/* Product preview */}
              <div className="bg-[#F9FAFB] p-4 rounded-sm border border-gray-100">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#E5E5E5] rounded-sm shrink-0"></div>
                  <div className="space-y-2">
                    <p className="font-bold text-sm leading-tight">
                      2 CT Round Cut with Side Diamonds Accent Engagement Ring
                    </p>
                    <div className="bg-gray-100 border border-gray-100 rounded-sm p-2 flex flex-col gap-1 w-fit">
                      <div className="flex items-center gap-2">
                         <Clock size={12} className="text-black" />
                         <span className="text-xs">Size 12 | Yellow Gold</span>
                      </div>
                      <p className="text-xs font-semibold">
                        Available by 27 January, 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-5">
              <Button variant="outline" className="h-12 px-6! hover:cursor-pointer rounded-sm border-primary text-base font-medius tracking-wider hover:bg-primary hover:text-white transition-colors">
                <Navigation size={18} />
                DIRECT ME
              </Button>

              <Button variant="outline" className="h-12 px-6! hover:cursor-pointer rounded-sm border-primary text-base font-medius tracking-wider hover:bg-primary hover:text-white transition-colors">
                <Phone size={18} />
                CALL US
              </Button>

              <Button className="h-12 px-6! hover:cursor-pointer rounded-sm text-white text-base font-medius tracking-wider">
                <Calendar size={18} />
                BOOK APPOINTMENT
              </Button>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex justify-between items-center mt-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1.5 bg-black rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button className="w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
