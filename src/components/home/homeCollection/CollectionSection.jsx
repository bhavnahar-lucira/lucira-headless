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
    <section className="w-full bg-white overflow-hidden mt-15">
      <div className="max-w-360 w-[91%] mx-auto">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h2 className="main-title font-extrabold mb-2 font-abhaya">{title}</h2>}
            {subtitle && <p className="text-base text-gray-600">{subtitle}</p>}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-6 mb-5 text-base overflow-x-auto no-scrollbar">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(tab)}
              className={`hover:underline underline-offset-4 whitespace-nowrap ${
                activeTab === tab ? "underline font-medium" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {children}
        </div>
      </div>
      {page === "home" && colCat && (
        <div className="flex justify-center mt-1">
          <Button className="px-7 py-3 h-12 text-lg font-bold  rounded-md hover:cursor-pointer">
            {colCat}
          </Button>
        </div>
      )}
      
    </section>
  );
}
