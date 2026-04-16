"use client";

import Image from "next/image";

export default function NoteFromFounder() {
  return (
    <section className="w-full mt-15 bg-white overflow-hidden">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-[#FAF5F2] shadow-sm rounded-sm overflow-hidden min-h-[450px]">
          {/* Left Column: Image */}
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Image
              src="/images/founder.jpg" // Using existing founder placeholder image
              alt="Rupesh Jain - Founder & CEO"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Column: Text Content */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center relative bg-[#FAF5F2]">
            <h2 className="text-2xl md:text-3xl font-extrabold font-abhaya text-gray-900 mb-8">
              A Note from Our Founder
            </h2>
            
            <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed mb-10 italic font-light tracking-wide">"Jewelry runs in my blood—it's who I am. After building brands in India, I created Lucira to go beyond tradition and craft pieces that reflect elegance and meaning. For me, jewelry isn’t just adornment—it’s a celebration of moments, love, and legacy. Every piece we make is a promise."</p>

            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-gray-900">-Rupesh Jain</span>
              <span className="text-xs md:text-sm text-gray-500 font-medium tracking-wide uppercase mt-1">
                Founder & CEO
              </span>
            </div>

            {/* Signature Image */}
            <div className="absolute bottom-10 right-10 md:bottom-12 md:right-16 opacity-90">
               <Image 
                src="/images/signature.png" 
                alt="Rupesh Jain Signature" 
                width={84} 
                height={106} 
                className="object-contain"
               />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
