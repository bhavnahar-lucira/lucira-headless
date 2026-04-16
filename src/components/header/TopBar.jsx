"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-[#a88b84] text-white text-sm py-2 px-4 flex items-center justify-between">
      <ChevronLeft size={16} className="cursor-pointer" />
      <p className="text-center flex-1">
        Upto 100% Off Making Charges
      </p>
      <ChevronRight size={16} className="cursor-pointer" />
    </div>
  );
}