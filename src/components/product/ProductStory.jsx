"use client";

import Image from "next/image";

export default function ProductStory() {
  return (
    <section className="w-full py-15">

      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}

        <div className="space-y-9">

          <h2 className="text-28px font-bold">
            Story Behind The Product
          </h2>

          <div className="space-y-5">
            <h3 className="text-2xl italic font-semibold">
              A Lifetime Ahead - Engagement Ring
            </h3>

            <p className="text-lg font-medium leading-relaxed">
              Designed for timeless elegance, this Round Cut engagement ring
              balances brilliance and refinement. The classic round center
              diamond delivers unmatched sparkle, while side diamonds add
              subtle depth.
            </p>

            <p className="text-lg font-medium leading-relaxed">
              Every detail is crafted to feel effortless, refined enough for
              a proposal, yet versatile enough to be worn for a lifetime.
            </p>
          </div>

        </div>


        {/* RIGHT IMAGE */}

        <div className="relative w-full h-70 lg:h-80 rounded-xl overflow-hidden bg-gray-100">

          <Image
            src="/images/story-ring.jpg"
            alt="Story Behind Product"
            fill
            className="object-cover"
          />

        </div>

      </div>

    </section>
  );
}