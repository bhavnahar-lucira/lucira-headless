"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Define routes where the button should be visible
  const allowedRoutes = [
    /^\/$/, // Homepage
    /^\/collections\/[^/]+$/, // Collection pages
    /^\/products\/[^/]+$/, // Product pages
    /^\/search$/, // Search results page
  ];

  const shouldShowOnPage = allowedRoutes.some((route) => route.test(pathname));

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!shouldShowOnPage) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-[100] p-3 rounded-full bg-black text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <ChevronUp 
        size={24} 
        className="group-hover:-translate-y-1 transition-transform duration-300" 
      />
    </button>
  );
}
