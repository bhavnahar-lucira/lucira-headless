"use client";

import Marquee from "react-fast-marquee";
import LazyImage from "../common/LazyImage";

export default function FeaturedIn() {

  const logos = [
    "/images/feature/BQF.svg",
    "/images/feature/Disrupt.svg",
    "/images/feature/Entrepreneur.svg",
    "/images/feature/ET.svg",
    "/images/feature/Inc42.svg",
    "/images/feature/IndiaRetailing.svg",
    "/images/feature/Indulge.svg",
    "/images/feature/JewelBuzz.svg",
    "/images/feature/MadeInMedia.svg",
    "/images/feature/MediaBrief.svg",
    "/images/feature/SMBStory.svg",
    "/images/feature/StartupTalky.svg",
    "/images/feature/ThePrint.svg",
    "/images/feature/ZBusinessHindi.svg",
  ]

  return (
    <section className="w-full text-center bg-white">
      <div className="container-main mx-auto">
        <div className="text-center mb-10 px-1">
          <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-7 text-black">Featured In</h2>
          <p className="text-black text-base md:text-2xl font-normal">Lucira Jewelry focuses on modern fine jewellery, featuring
            lab-grown diamonds and expert craftsmanship</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-linear-to-r from-gray-50 to-transparent z-10"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-linear-to-l from-gray-50 to-transparent z-10"></div>

        <Marquee
          speed={60}
          pauseOnHover={true}
          gradient={false}
        >

          <div className="flex items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <LazyImage
                key={index}
                src={logo}
                alt="media logo"
                width={180}
                height={60}
                className="object-contain opacity-70 hover:opacity-100 transition"
              />
            ))}

            {logos.map((logo, index) => (
              <LazyImage
                key={`dup-${index}`}
                src={logo}
                alt="media logo duplicate"
                width={180}
                height={60}
                className="object-contain opacity-70 hover:opacity-100 transition"
              />
            ))}

            {logos.map((logo, index) => (
              <LazyImage
                key={`dup-${index}`}
                src={logo}
                alt="media logo duplicate"
                width={180}
                height={60}
                className="object-contain opacity-70 hover:opacity-100 transition"
              />
            ))}

          </div>
        </Marquee>
      </div>

    </section>
  );
}
