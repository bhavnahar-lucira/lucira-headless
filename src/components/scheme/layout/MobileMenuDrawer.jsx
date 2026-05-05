"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const menuItems = [
  "Favorites",
  "Engagement Rings",
  "Wedding Rings",
  "Earrings",
  "Jewelry",
  "Solitaire",
  "Collection",
  "Gifting",
  "9KT Collection",
];

export default function MobileMenuDrawer({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85%] sm:w-95 p-6">
        
        {/* ✅ ACCESSIBLE TITLE (HIDDEN VISUALLY) */}
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Main Navigation</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <nav className="mt-6 space-y-6">
          {menuItems.map((item) => (
            <Link
              key={item}
              href="#"
              onClick={() => onOpenChange(false)}
              className="block text-sm tracking-wider uppercase hover:text-primary transition"
            >
              {item}
            </Link>
          ))}
        </nav>

      </SheetContent>
    </Sheet>
  );
}
