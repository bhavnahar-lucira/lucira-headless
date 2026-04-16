import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Rings", image: "/images/range/1.jpg", href: "/collections/rings" },
  { name: "Earrings", image: "/images/range/2.jpg", href: "/collections/earrings" },
  { name: "Bracelets", image: "/images/range/3.jpg", href: "/collections/bracelets" },
  { name: "Necklaces", image: "/images/range/4.jpg", href: "/collections/all-necklaces" },
  { name: "Nosepins", image: "/images/range/5.jpg", href: "/collections/all-nosepins" },
  { name: "Mangalsutra", image: "/images/range/6.jpg", href: "/collections/mangalsutra" },
  { name: "Men's Ring", image: "/images/range/7.jpg", href: "/collections/mens-ring" },
  { name: "Men's Stud", image: "/images/range/8.jpg", href: "/collections/mens-stud" },
];

export default function ExploreRange() {
  return (
    <section className="w-full mt-16 bg-white">
      <div className="container-main">
        <div className="text-center mb-6">
          <h2 className="main-title font-extrabold font-abhaya mb-2">Explore Our Range</h2>
          <p className="text-black text-base">Find diamond jewelry pieces that match your style.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, index) => (
            <Link 
              key={index} 
              href={cat.href}
              className="group relative aspect-313/362 overflow-hidden rounded-sm bg-gray-100"
            >
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-white/5  to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-4 right-4 flex justify-between items-center text-white">
                <span className="text-xl md:text-2xl font-semibold">{cat.name}</span>
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
