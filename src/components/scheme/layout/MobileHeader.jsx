"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useWindowSize from "@/hooks/useWindowSize";
import useIsMounted from "@/hooks/useIsMounted";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LuciraLogo from "@/assets/scheme/logo.svg";


export default function MobileHeader() {
  const { width } = useWindowSize();
  const mounted = useIsMounted();

  if (!mounted || width >= 1024) return null;

  return (
      <header className="w-full bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
        <Link className="relative w-30" href="/scheme">
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
            <h2 className="text-md uppercase text-center mb-4">Scheme</h2>
        </Link>
      </header>
  );
}
