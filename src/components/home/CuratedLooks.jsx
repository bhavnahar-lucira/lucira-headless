"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const OCCASIONS = [
  {
    name: "Engagement",
    image: "/images/curated/1.jpg",
    href: "/collections/engagement",
    hotspots: [
      {
        id: 1,
        x: "32%",
        y: "38%",
        product: {
          name: "Diamond Stud Earrings",
          image: "/images/curated/product-1.jpg",
          price: "₹24,999",
          oldPrice: "₹29,999",
          href: "/products/diamond-stud-earrings",
        },
      },
      {
        id: 2,
        x: "46%",
        y: "73%",
        product: {
          name: "Gold Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹31,499",
          oldPrice: "₹35,999",
          href: "/products/gold-ring",
        },
      },
      {
        id: 3,
        x: "75%",
        y: "58%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-3.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/diamond-ring",
        },
      },
    ],
  },
  {
    name: "Wedding",
    image: "/images/curated/2.jpg",
    href: "/collections/wedding",
    hotspots: [
      {
        id: 1,
        x: "74%",
        y: "50%",
        product: {
          name: "Hexora-Enamel Onyx Diamond Chain Pendant",
          image: "/images/curated/product-1.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/hexora-enamel-onyx-diamond-chain-pendant",
        },
      },
      {
        id: 2,
        x: "78%",
        y: "32%",
        product: {
          name: "Minimal Diamond Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹18,499",
          oldPrice: "₹21,999",
          href: "/products/minimal-diamond-ring",
        },
      },
      {
        id: 3,
        x: "54%",
        y: "82%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-3.jpg",
          price: "₹46,839",
          oldPrice: "₹50,363",
          href: "/products/diamond-ring",
        },
      },
    ],
  },
  {
    name: "Anniversary",
    image: "/images/curated/3.jpg",
    href: "/collections/anniversary",
    hotspots: [
      {
        id: 1,
        x: "76%",
        y: "22%",
        product: {
          name: "Diamond Ring",
          image: "/images/curated/product-1.jpg",
          price: "₹38,999",
          oldPrice: "₹42,500",
          href: "/products/diamond-ring-anniversary",
        },
      },
      {
        id: 2,
        x: "52%",
        y: "64%",
        product: {
          name: "Tennis Bracelet",
          image: "/images/curated/product-2.jpg",
          price: "₹29,999",
          oldPrice: "₹34,999",
          href: "/products/tennis-bracelet",
        },
      },
      {
        id: 3,
        x: "86%",
        y: "77%",
        product: {
          name: "Diamond Necklace",
          image: "/images/curated/product-3.jpg",
          price: "₹56,499",
          oldPrice: "₹61,999",
          href: "/products/diamond-necklace",
        },
      },
    ],
  },
  {
    name: "Valentine's",
    image: "/images/curated/4.jpg",
    href: "/collections/valentines",
    hotspots: [
      {
        id: 1,
        x: "86%",
        y: "34%",
        product: {
          name: "Hoop Earrings",
          image: "/images/curated/product-1.jpg",
          price: "₹16,999",
          oldPrice: "₹19,999",
          href: "/products/hoop-earrings",
        },
      },
      {
        id: 2,
        x: "47%",
        y: "73%",
        product: {
          name: "Solitaire Ring",
          image: "/images/curated/product-2.jpg",
          price: "₹72,499",
          oldPrice: "₹78,999",
          href: "/products/solitaire-ring",
        },
      },
    ],
  },
];

export default function CuratedLooks() {
  return (
    <section className="mt-16 w-full bg-[#FEF5F1] py-10">
      <div className="container-main">
        <div className="mb-6 text-center">
          <h2 className="main-title mb-2 font-abhaya font-extrabold">
            Curated Looks For You
          </h2>
          <p className="text-base text-black">
            Explore the jewelry pieces that defines the look
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {OCCASIONS.map((occ, index) => (
            <div
              key={index}
              className="relative aspect-3/4 overflow-visible rounded-sm bg-gray-100"
            >
              <Link href={occ.href} className="block h-full w-full">
                <Image
                  src={occ.image}
                  alt={occ.name}
                  fill
                  className="rounded-sm object-cover"
                />
              </Link>

              {occ.hotspots.map((spot) => {
                const xNum = parseFloat(spot.x);
                const alignRight = xNum > 70;
                const alignLeft = xNum < 30;

                return (
                  <div
                    key={spot.id}
                    className="absolute z-10"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={spot.product.name}
                        className="relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/20 backdrop-blur-sm"
                      >
                        <span className="absolute h-7 w-7 animate-ping rounded-full bg-white/30" />
                        <span className="absolute h-4 w-0.5 bg-white" />
                        <span className="absolute h-0.5 w-4 bg-white" />
                        <span className="relative z-10 h-3 w-3 rounded-full bg-white" />
                      </button>

                      <div
                        className={[
                          "invisible pointer-events-none absolute top-full z-30 w-60 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100",
                          alignRight
                            ? "right-0"
                            : alignLeft
                              ? "left-0"
                              : "left-1/2 -translate-x-1/2",
                        ].join(" ")}
                      >
                        <div className="relative rounded-lg bg-[#4E3A35]/95 p-2 shadow-xl">
                          <Link
                            href={spot.product.href}
                            className="flex items-center gap-3"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                              <Image
                                src={spot.product.image}
                                alt={spot.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-bold leading-4 text-white">
                                {spot.product.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {spot.product.price}
                                </span>
                                {spot.product.oldPrice && (
                                  <span className="text-xs text-white/70 line-through mt-1">
                                    {spot.product.oldPrice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black">
                              <ArrowRight size={14} />
                            </div>
                          </Link>

                          <span
                            className={[
                              "absolute top-0 h-3 w-3 -translate-y-1/2 rotate-45 bg-[#4E3A35]/95",
                              alignRight
                                ? "right-4"
                                : alignLeft
                                  ? "left-4"
                                  : "left-1/2 -translate-x-1/2",
                            ].join(" ")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-8 text-base font-bold uppercase tracking-wide text-white transition hover:opacity-90"
          >
            View All Inspiration
          </Link>
        </div>
      </div>
    </section>
  );
}