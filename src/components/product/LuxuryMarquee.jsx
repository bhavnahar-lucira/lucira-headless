"use client";

import Marquee from "react-fast-marquee";

export default function LuxuryMarquee({ prop = [] }) {
  const items = [
    "💎 Personalized Jewelry, Made for You",
    "🚚 Fast & Secure Shipping",
    "✔ Quality Control & Assurance",
    "✨ Bespoke Experience",
  ];

  // 👉 find bg class dynamically
  const bgClass = prop.find(cls => cls.startsWith("bg-")) || "bg-primary";

  // 👉 convert bg-secondary → from-secondary
  const gradientFrom = bgClass.replace("bg-", "from-");

  return (
    <div className={`relative py-4 overflow-hidden ${prop.join(" ")}`}>
      
      <div className={`pointer-events-none absolute left-0 top-0 h-full w-24 bg-linear-to-r ${gradientFrom} to-transparent z-10`}></div>
      <div className={`pointer-events-none absolute right-0 top-0 h-full w-24 bg-linear-to-l ${gradientFrom} to-transparent z-10`}></div>

      <Marquee
        speed={80}
        pauseOnHover={true}
        gradient={false}
      >
        <div className="flex gap-10 whitespace-nowrap ml-10">
          {items.map((item, i) => (
            <span
              key={`item-${i}`}
              className="text-base font-medium tracking-wide"
            >
              {item}
            </span>
          ))}
          {items.map((item, i) => (
            <span
              key={`dup-${i}`}
              className="text-base font-medium tracking-wide"
            >
              {item}
            </span>
          ))}
        </div>
      </Marquee>

    </div>
  );
}