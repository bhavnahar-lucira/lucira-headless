"use client";

import React, { useEffect, useState } from "react";

export default function OurExpertise() {
  const expertiseContent = {
    heading1: "OUR CRAFTSMANSHIP",
    content1:
      "Every jewelry piece is shaped by skilled artisans who understand precision at the microscopic level. From intricate detailing to flawless finishing, we are dedicated to delivering exceptional beauty and craftsmanship.",

    heading2: "BESPOKE CREATIONS",
    content2:
      "From stone selection to final design, our bespoke process brings timeless visions to life. Each custom piece is thoughtfully designed, engineered, and handcrafted to reflect individual taste and vision.",

    heading3: "EXPERT CONSULTATION",
    content3:
      "Our world-class experts guide you through every detail. We build trust through transparency, education, and genuine craftsmanship expertise.",
  };

  const packagingContent = {
    heading: "PACKAGING",
    description:
      "Every Lucira piece arrives beautifully packaged to create an unforgettable unboxing experience. Thoughtfully designed with elegance and care, our packaging reflects the craftsmanship and luxury within.",
  };

  const images = {
    image1:
      "https://www.lucirajewelry.com/cdn/shop/files/5cdff6d692ad54662a363c2e545658e7ac8d874c_400x533.jpg?v=1768974412",

    image2:
      "https://www.lucirajewelry.com/cdn/shop/files/300x300_300x300.jpg?v=1769082113",

    image3:
      "https://www.lucirajewelry.com/cdn/shop/files/1008x560_1_300x300.jpg?v=1769082128",

    image4:
      "https://www.lucirajewelry.com/cdn/shop/files/424x624-Bespoke_300x300.jpg?v=1769082137",

    image5:
      "https://www.lucirajewelry.com/cdn/shop/files/0d5ffb500eacb00d93873b945056b79ce4079f32.png?v=1768974532&width=1000",

    packaging:
      "https://www.lucirajewelry.com/cdn/shop/files/6dc21ac6ed4a2d9ff6f2cd1af2183256fa608a87.png?v=1768994606&width=1200",
  };

  const sustainableFeatures = [
    {
      title: "WATER RESPONSIBLE",
      description:
        "Lab grown diamonds significantly reduce water usage compared to traditional mining. Our process prioritizes conservation, ensuring beauty without depleting one of Earth’s most vital resources.",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Water.jpg?v=1769076547&width=1400",
      progress: 75,
      icon: "💧",
    },
    {
      title: "Protecting Forests",
      description:
        "By eliminating mining, lab grown diamonds help preserve forests and ecosystems. For every offer, Lucira plants one tree, supporting biodiversity while creating diamonds with minimal environmental disruption.",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Tree.jpg?v=1769076564&width=1400",
      progress: 90,
      icon: "🌱",
    },
    {
      title: "Cleaner Footprint",
      description:
        "Our controlled lab environments produce fewer emissions than conventional mining. This results in diamonds with a reduced carbon impact, without compromising on quality or brilliance.",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Air_1.jpg?v=1769076582&width=1400",
      progress: 80,
      icon: "⚡",
    },
    {
      title: "Mindful Materials",
      description:
        "Lab grown diamonds avoid large-scale mineral extraction, reducing soil degradation and waste. We focus on responsible material use that respects the planet beneath the sparkle.",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Mineral.jpg?v=1769076602&width=1400",
      progress: 100,
      icon: "💎",
    },
  ];

  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % sustainableFeatures.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* HERO BANNER SECTION */}
      <section className="relative w-full h-[535px] md:h-[605px] flex items-end justify-center mb-10 md:mb-20 bg-cover bg-center bg-no-repeat bg-[url('https://www.lucirajewelry.com/cdn/shop/files/2def89f49cb4fec969c6961ec052f9e0dd50b7bf_768x.png?v=1768973473')] md:bg-[url('https://www.lucirajewelry.com/cdn/shop/files/f2678a2166c64f499d7b9e22730a1ad9f9635019_1920x.png?v=1768973475')]">
        <div className="absolute inset-0 bg-black/20 z-10"></div>

        <div className="relative z-20 text-center text-white max-w-[800px] px-5 pb-2 md:pb-5 mb-2 md:mb-5">
          <h2 className="font-abhaya text-lg md:text-[28px] font-medium leading-tight mb-3">
            Our Expertise
          </h2>

          <p className="font-figtree text-xs md:text-[18px] leading-relaxed">
            Crafted with science, perfected with master craftsmanship.
          </p>
        </div>
      </section>

      {/* CRAFTSMANSHIP SECTION */}
      <section className="w-full bg-white pt-[25px] md:pt-10">
        <div className="container-main mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[calc(30%-10px)_calc(70%-10px)] gap-8 md:gap-5 items-start">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-5 w-full md:items-end items-start">
              <div className="overflow-hidden rounded">
                <img
                  src={images.image1}
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-[260px] aspect-square overflow-hidden rounded">
                <img
                  src={images.image2}
                  alt="Craftsmanship Detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-5">
              <div className="w-full md:w-1/2">
                <h3 className="font-figtree text-[18px] md:text-[24px] font-medium tracking-[1.5px] uppercase text-[#1A1A1A] mb-3">
                  {expertiseContent.heading1}
                </h3>

                <p className="font-figtree text-[14px] leading-[1.6] text-[#666]">
                  {expertiseContent.content1}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="w-full h-[190px] md:h-[425px] overflow-hidden rounded">
                  <img
                    src={images.image3}
                    alt="Bespoke Creations"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col-reverse md:flex-row-reverse gap-8 md:gap-5">
                  <div className="w-full h-[500px] md:h-[550px] overflow-hidden rounded">
                    <img
                      src={images.image4}
                      alt="Bespoke Creations Detail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="w-full">
                    <h3 className="font-figtree text-[18px] md:text-[24px] font-medium tracking-[1.5px] uppercase text-[#1A1A1A] mb-3">
                      {expertiseContent.heading2}
                    </h3>

                    <p className="font-figtree text-[14px] leading-[1.6] text-[#666]">
                      {expertiseContent.content2}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FULL WIDTH SECTION */}
        <div className="mt-8 md:mt-12 relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-[#F2F2F2]">
          <div className="w-full flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2">
              <img
                src={images.image5}
                alt="Expert Consultation"
                className="w-full h-[300px] md:h-[420px] object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 px-6 md:px-20 py-10 md:py-0">
              <h3 className="font-figtree text-[22px] md:text-[38px] font-normal tracking-[1px] uppercase text-black mb-5 leading-[100%]">
                {expertiseContent.heading3}
              </h3>

              <p className="font-figtree text-[14px] md:text-[20px] leading-[1.8] text-[#1A1A1A] max-w-[620px]">
                {expertiseContent.content3}
              </p>
            </div>
          </div>
        </div>

        {/* SUSTAINABLE FEATURES SECTION */}
        <div className="container-main mx-auto px-5 md:px-10 py-10 md:py-16">
          <div className="relative overflow-hidden rounded-[12px] min-h-[600px]">
            {/* Background Image */}
            <img
              src={sustainableFeatures[activeFeature].image}
              alt={sustainableFeatures[activeFeature].title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between h-[600px] p-5 md:p-[30px]">
              {/* Text */}
              <div className="mt-auto max-w-[500px] text-white">
                <h2 className="font-figtree text-[18px] md:text-[24px] font-medium uppercase tracking-[2px] mb-3">
                  {sustainableFeatures[activeFeature].title}
                </h2>

                <p className="font-figtree text-[14px] leading-[1.6] opacity-90">
                  {sustainableFeatures[activeFeature].description}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 md:gap-4 mt-10">
                {sustainableFeatures.map((feature, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`relative w-[58px] h-[58px] md:w-[78px] md:h-[78px] rounded-full border-[4px] md:border-[7px] flex items-center justify-center transition-all duration-300 ${
                      activeFeature === index
                        ? "border-white/70"
                        : "border-white/30"
                    }`}
                  >
                    {/* Progress Ring */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        stroke="white"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={`${feature.progress * 2.76} 999`}
                        className={`transition-all duration-500 ${
                          activeFeature === index ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </svg>

                    {/* Icon */}
                    <span className="text-xl md:text-2xl">
                      {feature.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PACKAGING SHOWCASE SECTION */}
        <section className="w-full bg-white py-[40px] md:py-[120px] overflow-hidden">
          <div className="container-main mx-auto px-5 md:px-10 relative flex flex-col-reverse md:block">
            {/* Grey Content Strip */}
            <div className="bg-[#E6E6E6] md:min-h-[180px] px-0 md:pl-[60px] md:pr-[700px] py-0 md:py-10">
              <h2 className="font-figtree text-[18px] md:text-[24px] font-medium uppercase tracking-[0.04em] text-[#1A1A1A] mb-3">
                {packagingContent.heading}
              </h2>

              <p className="font-figtree text-[14px] leading-[1.6] text-[#333333] max-w-[420px]">
                {packagingContent.description}
              </p>
            </div>

            {/* Image */}
            <div className="md:absolute md:right-0 md:-top-[295px] w-full md:w-[900px] z-[2] mb-5 md:mb-0">
              <img
                src={images.packaging}
                alt={packagingContent.heading}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}