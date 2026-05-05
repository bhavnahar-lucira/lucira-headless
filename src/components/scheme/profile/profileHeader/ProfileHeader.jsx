"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import useWindowSize from "@/hooks/useWindowSize";
import useIsMounted from "@/hooks/useIsMounted";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LuciraLogo from "@/assets/scheme/logo.svg";

export default function ProfileHeader({ onMenuClick }) {
  const { width } = useWindowSize();
  const mounted = useIsMounted();

  if (!mounted || width >= 1024) return null;

  return (
    <header className="w-full bg-white flex items-center justify-center px-4 h-14 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">    
      {/* Logo */}
      <Link className="relative w-24" href="/">
        <AspectRatio ratio={80 / 32}>
          <Image
            src={LuciraLogo}
            alt="Lucira Logo"
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </AspectRatio>
      </Link>

      {/* Spacer */}
      <div className="w-6" />
    </header>
  );
}
