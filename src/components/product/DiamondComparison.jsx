"use client";
import React from "react";
import { Check, X, RefreshCw, Sparkle } from "lucide-react";

export default function DiamondComparison() {
  const rows = [
    {
      label: "Chemically and physically a real diamond",
      lab: true,
      mined: true,
    },
    {
      label: "Graded by global certification standards (cut, color, clarity, carat)",
      lab: true,
      mined: true,
    },
    {
      label: "Better value for the same quality (40–70% more affordable)",
      lab: true,
      mined: false,
    },
    {
      label: "Environmentally responsible and conflict-free",
      lab: true,
      mined: false,
    },
    {
      label: "Durable and suitable for everyday, lifetime wear",
      lab: true,
      mined: true,
    },
    {
      label: "Wider flexibility in shapes, sizes, and design options",
      lab: true,
      mined: false,
    },
    {
      label: "Ethically produced without human rights concerns",
      lab: true,
      mined: false,
    },
  ];

  const CheckIcon = () => (
    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
      <Check size={14} className="text-white" strokeWidth={4} />
    </div>
  );

  const XIcon = () => (
    <div className="w-6 h-6 bg-[#D1D5DB] rounded-full flex items-center justify-center">
      <X size={14} className="text-white" strokeWidth={4} />
    </div>
  );

  return (
    <section className="w-full py-16 bg-[#F9F9F9] mt-15">
      <div className="max-w-480 mx-auto px-46 min-[1440px]:px-46">
        <h2 className="text-28px font-bold text-black text-center mb-15">
          Lab Grown Vs. Mined Diamonds
        </h2>

        <div className="relative">
          {/* Highlight Container for the middle column */}
          <div className="absolute -top-7.5 -bottom-7.5 left-[35.5%] w-[33%] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-0"></div>

          <div className="grid grid-cols-[1.5fr_1.3fr_1.3fr] relative z-10">
            {/* Table Header */}
            <div className="pb-10 px-4 text-xl font-semibold text-black flex items-end">
              Comparison Basis
            </div>
            <div className="pb-10 text-center text-xl font-semibold text-black flex items-end justify-center">
              Lab-Grown Diamond
            </div>
            <div className="pb-10 text-center text-xl font-semibold text-black flex items-end justify-center">
              Mined Diamond
            </div>

            {/* Table Rows */}
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div className="py-7 px-4 border-t border-[#E5E5E5] text-lg font-semibold text-black leading-snug flex items-center">
                  {row.label}
                </div>
                <div className="py-7 border-t border-[#E5E5E5] flex items-center justify-center">
                  {row.lab ? <CheckIcon /> : <XIcon />}
                </div>
                <div className="py-7 border-t border-[#E5E5E5] flex items-center justify-center">
                  {row.mined ? <CheckIcon /> : <XIcon />}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-20 space-y-4">
          <div className="flex gap-5 items-center bg-[#EDEDED] rounded-xl px-6 py-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <RefreshCw size={22} className="text-black" />
            </div>
            <p className="text-lg text-black font-medium">
              Every lab-grown diamond jewelry by Lucira comes with lifetime
              buyback assurance.
            </p>
          </div>

          <div className="flex gap-5 items-center bg-[#EDEDED] rounded-xl px-6 py-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Sparkle size={22} className="text-black fill-black" />
            </div>
            <p className="text-lg text-black font-medium leading-relaxed">
              The only real difference is how they&apos;re formed; lab-grown and
              natural diamonds are optically identical, with no visible
              difference to the naked eye, with distinctions detectable only
              by experts using advanced equipment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
