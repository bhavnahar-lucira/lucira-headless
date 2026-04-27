"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Play, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sizeData = [
  { ind: 5, us: "3", diaIn: 0.56, cirIn: 1.74 },
  { ind: 6, us: "3.5", diaIn: 0.57, cirIn: 1.80 },
  { ind: 7, us: "4", diaIn: 0.59, cirIn: 1.84 },
  { ind: 8, us: "4.5", diaIn: 0.60, cirIn: 1.89 },
  { ind: 9, us: "5", diaIn: 0.62, cirIn: 1.94 },
  { ind: 10, us: "5.5", diaIn: 0.63, cirIn: 1.99 },
  { ind: 11, us: "6", diaIn: 0.65, cirIn: 2.04 },
  { ind: 12, us: "6.5", diaIn: 0.67, cirIn: 2.09 },
  { ind: 13, us: "7", diaIn: 0.68, cirIn: 2.14 },
  { ind: 14, us: "7.5", diaIn: 0.70, cirIn: 2.19 },
  { ind: 15, us: "8", diaIn: 0.71, cirIn: 2.24 },
  { ind: 16, us: "8.5", diaIn: 0.73, cirIn: 2.29 },
  { ind: 17, us: "9", diaIn: 0.74, cirIn: 2.34 },
];

export function SizeGuideSheet({ children }) {
  const [unit, setUnit] = useState("inch"); // 'inch' or 'cm'

  const convert = (val) => {
    if (unit === "cm") {
      return (val * 2.54).toFixed(2);
    }
    return val.toFixed(2);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
          <SheetTitle className="text-2xl font-bold font-figtree">Size Guide</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
          {/* Video Promo */}
          <div className="bg-[#FFF8F6] rounded-xl flex items-center gap-4 px-4 py-4 border border-[#FFEDE9]">
            <div className="relative w-20 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
               <Image src="/images/product/story-ring.jpg" alt="Video preview" fill className="object-cover" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Play size={16} fill="white" className="text-white" />
               </div>
            </div>
            <span className="text-sm text-gray-800 font-medium leading-tight">Watch this quick video to measure your ring right.</span>
          </div>

          {/* Ring Sizer Promo */}
          <div className="bg-white rounded-xl flex items-center gap-4 p-3 border border-gray-100 shadow-sm">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
               <Image src="/images/product/product-1.jpg" alt="Ring sizer" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-900">Order Our Free Ring Sizer</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Order our free ring sizer to find your perfect fit before placing your order.</p>
            </div>
          </div>

          {/* Nearest Store Promo */}
          <div className="bg-white rounded-xl flex items-center gap-4 p-3 border border-gray-100 shadow-sm">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
               <Image src="/images/store.jpg" alt="Lucira store" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-900">Visit Nearest Lucira Store</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Visit Lucira store to get professionally sized, you can also purchase directly at the store.</p>
              <button className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mt-2 border-b border-gray-900 pb-0.5">BOOK APPOINTMENT</button>
            </div>
          </div>

          {/* Size Guide Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold text-gray-900">Size Guide</h3>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-100">
              <button 
                onClick={() => setUnit("inch")}
                className={`pb-2 text-sm font-medium transition-all relative ${unit === 'inch' ? 'text-gray-900' : 'text-gray-400'}`}
              >
                inch
                {unit === 'inch' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>}
              </button>
              <div className="w-px h-4 bg-gray-200 mt-0.5"></div>
              <button 
                onClick={() => setUnit("cm")}
                className={`pb-2 text-sm font-medium transition-all relative ${unit === 'cm' ? 'text-gray-900' : 'text-gray-400'}`}
              >
                cm
                {unit === 'cm' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>}
              </button>
            </div>

            {/* Table */}
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm font-bold text-gray-900 border-b border-gray-100">
                    <th className="py-4 font-bold align-top">Diameter ({unit === 'inch' ? 'in' : 'cm'})</th>
                    <th className="py-4 font-bold align-top border-l border-gray-100 pl-4">Circumference ({unit === 'inch' ? 'in' : 'cm'})</th>
                    <th className="py-4 font-bold align-top border-l border-gray-100 pl-4">IND</th>
                    <th className="py-4 font-bold align-top border-l border-gray-100 pl-4">US</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sizeData.map((row, idx) => (
                    <tr key={idx} className="text-sm text-gray-700">
                      <td className="py-4">{convert(row.diaIn)}</td>
                      <td className="py-4 border-l border-gray-100 pl-4">{convert(row.cirIn)}</td>
                      <td className="py-4 border-l border-gray-100 pl-4">{row.ind}</td>
                      <td className="py-4 border-l border-gray-100 pl-4">{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
