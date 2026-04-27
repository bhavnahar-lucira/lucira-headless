"use client";

import Marquee from "react-fast-marquee";
import LazyImage from "../common/LazyImage";
import Link from "next/link";

export default function FeaturedIn() {

  const logos = [
    {
      url: "https://mediabrief.com/candere-founder-rupesh-jain-launches-lab-grown-diamond-brand-lucira/",
      image: "/images/feature/MediaBrief.svg",
    },
    {
      url: "https://jewelbuzz.in/candere-founder-rupesh-jain-launches-lab-grown-diamond-jewelry-brand-lucira-taps-into-booming-industry-potential/",
      image: "/images/feature/JewelBuzz.svg",
    },
    {
      url: "https://www.imagesbof.in/candere-founder-rupesh-jain-launches-lab-grown-diamond-jewellery-brand-lucira/",
      image: "/images/feature/BQF.svg",
    },
    {
      url: "https://retail.economictimes.indiatimes.com/news/apparel-fashion/jewellery/candere-founder-rupesh-jain-launches-lab-grown-diamond-jewelry-brand-lucira/120573620",
      image: "/images/feature/ET.svg",
    },
    {
      url: "https://madeinmedia.in/candere-founder-rupesh-jain-launches-lab-grown-diamond-jewellery-brand-lucira-taps-into-booming-industry-potential/",
      image: "/images/feature/MadeInMedia.svg",
    },
    {
      url: "https://madeinmedia.in/candere-founder-rupesh-jain-launches-lab-grown-diamond-jewellery-brand-lucira-taps-into-booming-industry-potential/",
      image: "/images/feature/StartupTalky.svg",
    },
    {
      url: "https://india.entrepreneur.com/news-and-trends/from-candere-to-lucira-jains-new-chapter-in-purposeful/490616",
      image: "/images/feature/Entrepreneur.svg",
    },
    {
      url: "https://inc42.com/startups/how-rupesh-jains-lucira-wants-to-redefine-luxury-with-lab-grown-diamonds/",
      image: "/images/feature/Inc42.svg",
    },
    {
      url: "https://www.bwdisrupt.com/article/lucira-founder-rupesh-jain-believes-indias-jewellery-sector-will-be-defined-by-co-existence-not-competition-556873",
      image: "/images/feature/Disrupt.svg",
    },
    {
      url: "https://www.indiaretailing.com/2025/05/26/rupesh-jains-new-venture-lucira-bets-on-solitaires-targets-offline-launch-global-entry/",
      image: "/images/feature/IndiaRetailing.svg",
    },
    {
      url: "https://www.indulgexpress.com/fashion/new-launches/2025/May/29/lucira-redefines-fine-jewellery-with-lab-grown-diamonds-and-sustainable-luxury",
      image: "/images/feature/Indulge.svg",
    },
    {
      url: "https://www.indianjeweller.in/Indian-Jewellery-News/15493/lucira-launches-with-debut-collection-celebrating-modern-womanhood-and-motion",
      image: "/images/feature/IndianJeweller.svg",
    },
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
              <Link href={logo.url} key={index} target="_blank">
                <LazyImage
                  src={logo.image}
                  alt="media logo"
                  width={180}
                  height={60}
                  className="object-contain opacity-70 hover:opacity-100 transition"
                />
              </Link>
            ))}

            {logos.map((logo, index) => (
              <Link href={logo.url} key={index} target="_blank">
                <LazyImage
                  src={logo.image}
                  alt="media logo"
                  width={180}
                  height={60}
                  className="object-contain opacity-70 hover:opacity-100 transition"
                />
              </Link>
            ))}

            {logos.map((logo, index) => (
              <Link href={logo.url} key={index} target="_blank">
                <LazyImage
                  src={logo.image}
                  alt="media logo"
                  width={180}
                  height={60}
                  className="object-contain opacity-70 hover:opacity-100 transition"
                />
              </Link>
            ))}
          </div>
        </Marquee>
      </div>

    </section>
  );
}
