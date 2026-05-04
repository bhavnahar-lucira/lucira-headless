"use client";
import React from "react";
import { Check, X, RefreshCw, Sparkle } from "lucide-react";

export default function DiamondComparison() {
  const rows = [
    { label: "Chemically and physically a real diamond", lab: true, mined: true },
    { label: "Graded by global certification standards (cut, color, clarity, carat)", lab: true, mined: true },
    { label: "Better value for the same quality (40–70% more affordable)", lab: true, mined: false },
    { label: "Environmentally responsible and conflict-free", lab: true, mined: false },
    { label: "Durable and suitable for everyday, lifetime wear", lab: true, mined: true },
    { label: "Wider flexibility in shapes, sizes, and design options", lab: true, mined: false },
    { label: "Ethically produced without human rights concerns", lab: true, mined: false },
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
    <section className="w-full py-10 md:py-14 lg:py-16 bg-[#F9F9F9] mt-10 md:mt-14">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
        <h2 className="text-2xl md:text-3xl lg:text-[28px] font-bold text-black text-center mb-8 md:mb-12 lg:mb-15">
          Lab Grown Vs. Mined Diamonds
        </h2>

        <div className="relative">
          {/* Highlight middle column only for desktop */}
          <div className="hidden lg:block absolute -top-6 -bottom-6 left-[35.5%] w-[33%] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-0"></div>
          {/* Desktop / Tablet Table */}
          <div className="hidden md:grid grid-cols-[1.5fr_1.3fr_1.3fr] relative z-10">

            {/* Header */}
            <div className="pb-6 lg:pb-10 px-4 text-base lg:text-xl font-semibold text-black flex items-end">
              Comparison Basis
            </div>

            <div className="pb-6 lg:pb-10 text-center text-base lg:text-xl font-semibold text-black flex items-end justify-center">
              Lab-Grown Diamond
            </div>

            <div className="pb-6 lg:pb-10 text-center text-base lg:text-xl font-semibold text-black flex items-end justify-center">
              Mined Diamond
            </div>

            {/* Table Rows */}
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div className="py-4 md:py-6 px-2 border-t border-zinc-200 text-[12px] md:text-base lg:text-[17px] font-semibold text-black leading-tight flex items-center">
                  {row.label}
                </div>

                <div className="py-5 lg:py-7 border-t border-[#E5E5E5] flex items-center justify-center">
                  {row.lab ? <CheckIcon /> : <XIcon />}
                </div>

                <div className="py-5 lg:py-7 border-t border-[#E5E5E5] flex items-center justify-center">
                  {row.mined ? <CheckIcon /> : <XIcon />}
                </div>
              </React.Fragment>
            ))}
          </div>          
          <div className="md:hidden space-y-4">
            {rows.map((row, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E5E5]"
              >
                <h3 className="text-base font-semibold text-black mb-4">
                  {row.label}
                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-[#F7F7F7] rounded-xl p-4 text-center">
                    <p className="text-sm font-medium mb-3">
                      Lab-Grown
                    </p>
                    <div className="flex justify-center">
                      {row.lab ? <CheckIcon /> : <XIcon />}
                    </div>
                  </div>

                  <div className="bg-[#F7F7F7] rounded-xl p-4 text-center">
                    <p className="text-sm font-medium mb-3">
                      Mined
                    </p>
                    <div className="flex justify-center">
                      {row.mined ? <CheckIcon /> : <XIcon />}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-10 md:mt-14 lg:mt-20 space-y-4">
          <div className="flex items-start md:items-center gap-4 md:gap-5 bg-[#EDEDED] rounded-xl px-4 md:px-6 py-4">
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0">
              <RefreshCw size={20} className="text-black" />
            </div>
            <p className="text-sm md:text-base lg:text-lg text-black font-medium leading-relaxed">
              Every lab-grown diamond jewelry by Lucira comes with lifetime
              buyback assurance.
            </p>
          </div>
          <div className="flex items-start md:items-center gap-4 md:gap-5 bg-[#EDEDED] rounded-xl px-4 md:px-6 py-4">
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0">
              <Sparkle size={20} className="text-black fill-black" />
            </div>
            <p className="text-sm md:text-base lg:text-lg text-black font-medium leading-relaxed">
              The only real difference is how they&apos;re formed; lab-grown and
              natural diamonds are optically identical, with no visible
              difference to the naked eye.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
