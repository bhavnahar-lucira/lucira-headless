"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const OCCASIONS = [
  { name: "Spark", label:"0.25 ct – 0.40 ct", image: "/images/solitaire/Spark.jpg", href: "/collections/spark" },
  { name: "Rise", label:"0.40 ct – 0.75 ct", image: "/images/solitaire/Rise.jpg", href: "/collections/rise" },
  { name: "Presence", label:"0.75 ct – 1.25 ct", image: "/images/solitaire/Presence.jpg", href: "/collections/presence" },
  { name: "Legacy", label:"1.25+ ct", image: "/images/solitaire/Legacy.jpg", href: "/collections/legacy" },
];

export default function EveryoneYouLove() {
  return (
    <section className="w-full mt-16 bg-[#FEF5F1] py-10">
      <div className="container-main">

        <div className="text-center mb-6">
          <h2 className="main-title font-extrabold font-abhaya mb-2">Solitaire Story</h2>
          <p className="text-black text-base">Crafted brilliance for everyday style and journey</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {OCCASIONS.map((occ, index) => (
            <Link 
              key={index} 
              href={occ.href}
              className="relative aspect-3/4 overflow-hidden group bg-gray-100 rounded-sm"
            >
              <Image 
                src={occ.image} 
                alt={occ.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/5 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-semibold leading-tight">{occ.name}</span>
                  {occ.label && (
                    <span className="text-xs md:text-sm font-medium opacity-90 mt-1 uppercase tracking-wider italic">
                      {occ.label}
                    </span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black mb-1">
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
