// components/HeroBanner.tsx ← Server Component (no "use client")
import { getImageProps } from "next/image";
import Link from "next/link";
import HeroBannerClient from "./HeroBannerClient";

export const slideData = [
  { name: "Birthday", alt: "Birthday", url: "/collections/birthday-gifts" },
  { name: "Eterna-Band", alt: "Eterna Band Collection", url: "/collections/eterna" },
  { name: "NineKT", alt: "9KT Collection", url: "/collections/9kt-collection" },
];

const bannerHeightClasses =
  "h-auto aspect-4/5 md:aspect-auto md:h-[calc(100dvh-225px)] md:min-h-[450px]";

export default function HeroBanner() {
  const firstSlide = slideData[0];

  const { props: { srcSet: desktop } } = getImageProps({
    src: `/images/heroslider/${firstSlide.name}-Desktop.jpg`,
    alt: firstSlide.alt,
    fill: true,
    sizes: "100vw",
    priority: true,
  });

  const { props: { srcSet: mobile, ...rest } } = getImageProps({
    src: `/images/heroslider/${firstSlide.name}-Mobile.jpg`,
    alt: firstSlide.alt,
    fill: true,
    sizes: "100vw",
    priority: true,
  });

  return (
    <div className="w-full bg-white">
      <div className={`relative w-full overflow-hidden ${bannerHeightClasses}`}>

        {/* ✅ First slide — static HTML, paints immediately, zero JS */}
        <Link href={firstSlide.url} className="block w-full h-full">
          <picture>
            <source media="(min-width: 1025px)" srcSet={desktop} />
            <source media="(max-width: 1024px)" srcSet={mobile} />
            <img
              {...rest}
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
              decoding="sync"
            />
          </picture>
        </Link>

        {/* ✅ Swiper + navigation — loads after LCP */}
        <HeroBannerClient slideData={slideData} />
      </div>
    </div>
  );
}