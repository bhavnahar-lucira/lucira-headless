"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function WebEngageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    window.webengage?.screen(pathname);
  }, [pathname]);

  return null;
}
