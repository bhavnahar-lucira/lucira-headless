"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LazyImage from "../common/LazyImage";

const OCCASIONS = [
  { name: "Engagement", image: "/images/occasion/1.jpg", href: "/collections/engagement-rings" },
  { name: "Wedding", image: "/images/occasion/2.jpg", href: "/collections/wedding-rings" },
  { name: "Anniversary", image: "/images/occasion/3.jpg", href: "/collections/anniversary-gifts" },
  { name: "Couple Bands", image: "/images/occasion/4.jpg", href: "/collections/couple-bands" },
];

export default function ShopByOccasion() {
  return (
    <section className="w-full mt-16 bg-white">
      <div className="container-main">

        <div className="text-center mb-6">
          <h2 className="main-title font-extrabold font-abhaya mb-2">Shop By Occasion</h2>
          <p className="text-black text-base">Jewelry for life's most cherished moments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {OCCASIONS.map((occ, index) => (
            <Link 
              key={index} 
              href={occ.href}
              className="relative aspect-3/4 overflow-hidden group bg-gray-100 rounded-sm"
            >
              <LazyImage 
                src={occ.image} 
                alt={occ.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/5 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white">
                <span className="text-xl md:text-2xl font-semibold">{occ.name}</span>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
