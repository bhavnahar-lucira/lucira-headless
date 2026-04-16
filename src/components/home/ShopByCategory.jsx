"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FilterSkeleton from "./FilterSkeleton";
import LazyImage from "../common/LazyImage";

const CATEGORIES = [
  { label: "All", slug: "all" },
  { label: "Rings", slug: "rings" },
  { label: "Earrings", slug: "earrings" },
  { label: "Bracelet", slug: "bracelet" },
  { label: "Necklaces", slug: "necklaces" },
  { label: "Mangalsutra", slug: "mangalsutra" }
];

const CATEGORY_FILTERS = {
  rings: {
    shapes: [
      { id: "cushion", label: "CUSHION", img: "/images/shapes/cushion.png", href:"/collections/cushion-rings" },
      { id: "emerald", label: "EMERALD", img: "/images/shapes/emerald.png", href:"/collections/emerald-rings" },
      { id: "pear", label: "PEAR", img: "/images/shapes/pear.png", href:"/collections/pear-rings" },
      { id: "marquise", label: "MARQUISE", img: "/images/shapes/marquise.png", href:"/collections/marquise-rings" },
      { id: "heart", label: "HEART", img: "/images/shapes/heart.png", href:"/collections/heart-rings" },
      { id: "round", label: "ROUND", img: "/images/shapes/round.png", href:"/collections/round-rings" },
      { id: "oval", label: "OVAL", img: "/images/shapes/oval.png", href:"/collections/oval-rings" },
      { id: "princess", label: "PRINCESS", img: "/images/shapes/princess.png", href:"/collections/princess-rings" },
    ],
    styles: [
      { id: "Engagement", label: "Engagement", img: "/images/styles/hoops.png", href:"/collections/engagement-rings" },
      { id: "Solitaire", label: "Solitaire", img: "/images/styles/solitaire.png", href:"/collections/solitaire-rings" },
      { id: "Eternity", label: "Eternity", img: "/images/styles/studs.png", href:"/collections/eternity-rings" },
      { id: "Stackable", label: "Stackable", img: "/images/styles/stackable.png", href:"/collections/stackable-rings" },
      { id: "Casual", label: "Casual", img: "/images/styles/Casual.png", href:"/collections/casual-rings" },
      { id: "Gemstone", label: "Gemstone", img: "/images/styles/gemstone.png", href:"/collections/gemstone-rings" },
      { id: "mens", label: "men's", img: "/images/styles/mens.png", href:"/collections/mens-ring" },
    ],
  },

  earrings: {
    shapes: [
      { id: "Round", label: "Round", img: "/images/shapes/Round.png", href:"/collections/earrings-round" },
      { id: "emerald", label: "EMERALD", img: "/images/shapes/emerald.png", href:"/collections/earrings-emerald" },
      { id: "marquise", label: "MARQUISE", img: "/images/shapes/marquise.png", href:"/collections/earrings-marquise" },
      { id: "cushion", label: "CUSHION", img: "/images/shapes/cushion.png", href:"/collections/earrings-cushion" },
      { id: "oval", label: "OVAL", img: "/images/shapes/oval.png", href:"/collections/earrings-oval" },
      { id: "pear", label: "PEAR", img: "/images/shapes/pear.png", href:"/collections/earrings-pear" },
      { id: "princess", label: "PRINCESS", img: "/images/shapes/princess.png", href:"/collections/earrings-princess" },
      { id: "SpecialCuts", label: "Special Cuts", img: "/images/shapes/special-cuts.png", href:"/collections/earrings-special-cuts" },
    ],
    styles: [
      { id: "Hoops", label: "Hoops", img: "/images/styles/hoops.png", href:"/collections/diamond-hoop-earrings" },
      { id: "Studs", label: "Studs", img: "/images/styles/studs.png", href:"/collections/stud-earrings" },
      { id: "Suidhagas", label: "Sui Dhagas", img: "/images/styles/suidhagas.png", href:"/collections/sui-dhagas" },
      { id: "Dangles", label: "Dangles", img: "/images/styles/dangles.png", href:"/collections/dangles" },
      { id: "Solitaire", label: "Solitaire", img: "/images/styles/solitaire.png", href:"/collections/solitaire-earrings" },
      { id: "Halo", label: "Halo", img: "/images/styles/halo.png", href:"/collections/earrings-halo" },
      { id: "Gemstone", label: "Gemstone", img: "/images/styles/gemstone.png", href:"/collections/earrings-gemstone" },
      { id: "mens", label: "men's", img: "/images/styles/mens.png", href:"/collections/mens-stud" },
    ],
  }, 
};

export default function ShopByCategory() {

  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState(null);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    setLoading(true);

    const timer = setTimeout(() => {

      if (activeCategory === "all") {

        const allShapes = Object.values(CATEGORY_FILTERS).flatMap(
          (cat) => cat.shapes
        );

        const allStyles = Object.values(CATEGORY_FILTERS).flatMap(
          (cat) => cat.styles
        );

        const merged = [...allShapes, ...allStyles];

        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        setFilters(unique);
        setActiveTab(null);

      } else {

        const categoryData = CATEGORY_FILTERS[activeCategory];
        setFilters(categoryData?.[activeTab] || []);

      }

      setLoading(false);

    }, 500);

    return () => clearTimeout(timer);

  }, [activeCategory, activeTab]);

  const handleFilterClick = (filterId) => {

    if (activeCategory === "all") {

      router.push(`/collections?filter=${filterId}`);

    } else {

      router.push(
        `/collections/${activeCategory}?${activeTab === "shapes" ? "shape" : "style"}=${filterId}`
      );

    }

  };

  return (
    <section className="w-full bg-[#FEF5F1] py-14 mt-15">

      <div className="container-main">

        <h2 className="main-title text-center font-extrabold font-abhaya mb-5">
          Shop By
        </h2>

        {/* Categories */}
        <div className="flex justify-center gap-8 text-sm mb-7 flex-wrap">

          {CATEGORIES.map((cat) => (

            <button
              key={cat.slug}
              onClick={() => {
                setActiveCategory(cat.slug);
                setActiveTab(cat.slug === "all" ? null : "shapes");
              }}
              className={`relative pb-2 hover:cursor-pointer font-base ${
                activeCategory === cat.slug
                  ? "font-semibold border-b-2 border-black"
                  : "text-black hover:text-black"
              }`}
            >
              {cat.label}
            </button>

          ))}

        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-10">

          <div className="flex border rounded-md overflow-hidden">

            <button
              disabled={activeCategory === "all"}
              onClick={() => setActiveTab("shapes")}
              className={`px-6 py-2 text-base ${
                activeTab === "shapes"
                  ? "bg-[#6c514d] text-white font-semibold"
                  : "bg-white text-black"
              } ${activeCategory === "all" ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              By Shape
            </button>

            <button
              disabled={activeCategory === "all"}
              onClick={() => setActiveTab("styles")}
              className={`px-6 py-2 text-base ${
                activeTab === "styles"
                  ? "bg-[#6c514d] text-white font-semibold"
                  : "bg-white text-black"
              } ${activeCategory === "all" ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              By Style
            </button>

          </div>

        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-17 gap-y-5 text-center px-14">

          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <FilterSkeleton key={i} />
              ))

            : filters.map((item) => {
                const href = item.href || (
                  activeCategory === "all"
                    ? `/collections?filter=${item.id}`
                    : `/collections/${activeCategory}?${activeTab === "shapes" ? "shape" : "style"}=${item.id}`
                );

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="flex flex-col border border-transparent items-center gap-2 p-4 rounded-md hover:bg-secondary transition hover:border-primary hover:cursor-pointer"
                  >
                    <div className="relative w-14 h-14">
                      <LazyImage
                        src={item.img}
                        alt={item.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                );
              })}

        </div>

      </div>

    </section>
  );
}