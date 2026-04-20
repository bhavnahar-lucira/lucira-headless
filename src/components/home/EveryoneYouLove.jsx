"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LazyImage from "../common/LazyImage";

const OCCASIONS = [
  { name: "For Her", image: "/images/love/1.jpg", href: "/collections/gifts-for-her" },
  { name: "For Him", image: "/images/love/2.jpg", href: "/collections/gifts-for-him" },
  { name: "For Mothers", image: "/images/love/3.jpg", href: "/collections/gift-for-mother" },
  { name: "For Kids", image: "/images/love/4.jpg", href: "#" },
];

export default function EveryoneYouLove() {
  return (
    <section className="w-full mt-12 md:mt-20 bg-[#FEF5F1] py-12 md:py-20">
      <div className="container-main px-4">

        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold font-abhaya mb-3 text-zinc-900 tracking-tight">For Everyone You Love</h2>
          <p className="text-zinc-600 text-sm md:text-lg">Crafted with care, for everyone you hold close.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {OCCASIONS.map((occ, index) => (
            <Link 
              key={index} 
              href={occ.href}
              className="relative aspect-[3/4.2] overflow-hidden group bg-gray-100 rounded-xl shadow-sm"
            >
              <LazyImage 
                src={occ.image} 
                alt={occ.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex justify-between items-center text-white">
                <span className="text-base md:text-2xl font-bold tracking-tight">{occ.name}</span>
                <div className="w-8 h-8 md:w-11 md:h-11 rounded-full border border-white/40 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                  <ArrowRight size={16} className="md:w-5 md:h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

