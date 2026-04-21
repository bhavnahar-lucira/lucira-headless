"use client";

import Marquee from "react-fast-marquee";
import LazyImage from "../common/LazyImage";

export default function FeaturedIn() {

  const logos = [
    "/images/feature/mediabrief.png",
    "/images/feature/inc42.png",
    "/images/feature/indiaretailing.png",
    "/images/feature/bof.png",
    "/images/feature/entrepreneur.png",
    "/images/feature/jewelbuzz.png",
    "/images/feature/madeinindia.png",
    "/images/feature/bwdisrupt.png",
    "/images/feature/retail.png",
    "/images/feature/startuptalky.png",
    "/images/feature/zbusinesshindi.png",
  ];

  return (
    <section className="w-full mt-16 bg-white">

      <div className="w-full text-center">

        <div className="container-main mx-auto text-center mb-6">
          <h2 className="main-title font-extrabold font-abhaya mb-6.5"> Featured In</h2>
          <p className="text-black text-[22px] font-medium">Lucira Jewelry focuses on modern fine jewellery, featuring
            lab-grown diamonds and expert craftsmanship</p>
        </div>

        {/* Marquee */}

        <div className="relative overflow-hidden">

          {/* edge fade */}

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
                  width={120}
                  height={40}
                  className="object-contain opacity-70 hover:opacity-100 transition"
                />
              ))}

              {/* duplicate for seamless loop */}

              {logos.map((logo, index) => (
                <LazyImage
                  key={`dup-${index}`}
                  src={logo}
                  alt="media logo duplicate"
                  width={120}
                  height={40}
                  className="object-contain opacity-70 hover:opacity-100 transition"
                />
              ))}

            </div>

          </Marquee>

        </div>

      </div>

    </section>
  );
}
