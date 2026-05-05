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

  const isCollectionPage = pathname.startsWith('/collections');

  return (
    <button
      onClick={scrollToTop}
      className={cn(
                // POSITIONING: Bottom 10px to stay below FAB. 
        // Right logic matches your FAB exactly for a perfect line.
        "fixed bottom-23 md:bottom-25 lg:bottom-23 z-100",
        isCollectionPage ? "right-[20px] md:right-[30px]" : "right-[30px]",
        
        // YOUR ORIGINAL STYLING
        "w-[50px] h-[50px] flex items-center justify-center text-center rounded-full bg-black text-white shadow-xl transition-all duration-300 group",

        
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-12 opacity-0 pointer-events-none"
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
