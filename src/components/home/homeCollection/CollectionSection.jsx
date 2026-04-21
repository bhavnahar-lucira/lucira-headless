"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


export default function CollectionSection ({ title, subtitle, tabs = [], children, page, colCat, onTabChange, loading }) {
  const [activeTab, setActiveTab] = useState(tabs[0] || "");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <section className="w-full bg-white overflow-hidden mt-12 md:mt-15">
      <div className="max-w-360 w-[94%] md:w-[91%] mx-auto">
        {(title || subtitle) && (
          <div className="mb-6 md:mb-8">
            {title && <h2 className="text-3xl md:text-4xl font-black mb-2 font-abhaya text-zinc-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm md:text-base text-zinc-600">{subtitle}</p>}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-6 md:gap-8 mb-6 md:mb-8 text-sm md:text-base overflow-x-auto no-scrollbar border-b border-zinc-50 md:border-none pb-2 md:pb-0">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(tab)}
              className={`relative pb-2 whitespace-nowrap uppercase tracking-widest font-bold transition-all ${
                activeTab === tab ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900"></div>
              )}
            </button>
          ))}
        </div>
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {children}
        </div>

        {page === "home" && colCat && (
          <div className="flex justify-center mt-10 md:mt-12">
            <Button className="w-full md:w-auto px-10 py-4 h-auto text-sm md:text-base font-bold uppercase tracking-[0.2em] rounded-sm bg-[#5B4740] hover:bg-[#4A3934] text-white transition-colors">
              {colCat}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
