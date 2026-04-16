"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MEGA_MENU as STATIC_MENU } from "@/data/megaMenu";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenu } from "@/hooks/useMenu";

export default function Navbar({ hideTop }) {
  const { menuData, loading } = useMenu("main-menu-official");
  const [activeMenu, setActiveMenu] = useState(null);
  const pathname = usePathname();
  const timeoutRef = useRef(null);

  const MEGA_MENU = menuData || STATIC_MENU;

  const handleEnter = (index) => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(index);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  const closeMenu = () => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(null);
  };

  const hasDropdown = (menu) => menu.type === "mega" || menu.type === "image-grid";

  // Find the most specific active menu item (longest href match)
  const activeMenuPath = [...MEGA_MENU]
    .filter(menu => pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // Handle exact match separately to prioritize it
  const currentActiveHref = pathname === "/" ? "/" : (pathname === activeMenuPath ? activeMenuPath : (MEGA_MENU.find(m => m.href === pathname)?.href || activeMenuPath));

  return (
    <nav className="relative border-t bg-white">
      <div className="page-width relative">
        {/* Sticky Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: hideTop ? 1 : 0,
            scale: hideTop ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
          className={`absolute left-14 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center ${hideTop ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
          <Link href="/">
            <Image
              src="/images/icons/small-logo.svg"
              alt="Lucira Jewelry"
              width={20}
              height={40}
            />
          </Link>
        </motion.div>

        {/* MENU */}
        <ul className="flex justify-center gap-12 text-sm uppercase">
          {MEGA_MENU.map((menu, index) => {
            const isActive = pathname === menu.href || (currentActiveHref === menu.href);
            const isHovered = activeMenu === index;

            return (
              <li
                key={menu.label}
                onMouseEnter={() => handleEnter(index)}
                onMouseLeave={handleLeave}
                className="relative"
              >
                <Link
                  href={menu.href}
                  onClick={closeMenu}
                  className={cn(
                    "block py-6 tracking-wide transition-all duration-200",
                    (isActive || isHovered) ? "text-primary" : "text-gray-700 hover:text-primary",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {menu.label}
                </Link>

                {/* Underline */}
                {(isHovered || (isActive && activeMenu === null)) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-3 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* MEGA MENU */}
      {activeMenu !== null && hasDropdown(MEGA_MENU[activeMenu]) && (
        <motion.div
          onMouseEnter={() => handleEnter(activeMenu)}
          onMouseLeave={handleLeave}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 top-full w-full bg-white shadow-xl z-50 border-t"
        >
          <div className="container-main mx-auto py-8">
            {(() => {
              const menu = MEGA_MENU[activeMenu];

              /* ===== IMAGE GRID ===== */
              if (menu.type === "image-grid") {
                return (
                  <div className="grid grid-cols-4 gap-6">
                    {menu.items.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={closeMenu}
                        className="group relative block overflow-hidden rounded-md"
                      >
                        {/* IMAGE */}
                        <div className="relative aspect-4/5 w-full overflow-hidden rounded-md">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />

                          {/* GRADIENT */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        </div>

                        {/* TEXT */}
                        <div className="absolute bottom-4 left-4 right-12 text-white">
                          <p className="text-lg font-semibold leading-tight">
                            {item.title}
                          </p>
                          <p className="text-xs mt-1 opacity-90 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* ARROW BUTTON */}
                        <div className="absolute bottom-4 right-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-transparent text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />

                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              }

              const isFiveCol = menu.layout === "5-col-featured";
              const isThreeCol = menu.layout === "3-col";
              const isFourNoFeatured = menu.layout === "4-col-no-featured";

              return (
                <div className="flex items-start justify-between gap-12">

                  {/* LEFT CONTENT */}
                  <div className="flex-1">

                    {/* ===== 5 COL FEATURED ===== */}
                    {isFiveCol && (
                      <div className="grid grid-cols-[180px_repeat(4,minmax(0,1fr))] gap-10">

                        {/* FEATURED */}
                        <div className="pr-6 border-r border-gray-200">
                          <h4 className="mb-3 text-lg font-semibold">Featured</h4>
                          <ul className="space-y-3 text-base text-gray-600">
                            {menu.featured?.map((item, i) => (
                              <li key={i}>
                                <Link href={item.href || "#"} onClick={closeMenu}>
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* COLUMNS */}
                        {menu.columns?.map((col, i) => (
                          <div key={i}>
                            <h4 className="mb-3 text-lg font-semibold">{col.title}</h4>

                            <ul className="space-y-3 text-base text-gray-600">
                              {col.items.map((item, j) => (
                                <li key={j}>
                                  <Link
                                    href={item.href || "#"}
                                    onClick={closeMenu}
                                    className="flex items-center gap-2 hover:text-black transition"
                                  >
                                    {col.type === "icon" && item.icon && (
                                      <div className="relative h-4 w-4 shrink-0">
                                        <Image
                                          src={item.icon}
                                          alt={item.label}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <span>{item.label}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ===== 3 COL ===== */}
                    {isThreeCol && (
                      <div className="grid grid-cols-3 gap-10">
                        {menu.columns?.map((col, i) => (
                          <div key={i}>
                            <h4 className="mb-3 text-lg font-semibold">{col.title}</h4>

                            <ul className="space-y-3 text-base text-gray-600">
                              {col.items.map((item, j) => (
                                <li key={j}>
                                  <Link href={item.href || "#"} onClick={closeMenu}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ===== 4 COL ===== */}
                    {isFourNoFeatured && (
                      <div className="grid grid-cols-4 gap-10">
                        {menu.columns?.map((col, i) => (
                          <div key={i}>
                            <h4 className="mb-3 text-lg font-semibold">{col.title}</h4>

                            <ul className="space-y-3 text-base text-gray-600">
                              {col.items.map((item, j) => (
                                <li key={j}>
                                  <Link href={item.href || "#"} onClick={closeMenu}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* RIGHT IMAGE (FIXED RIGHT) */}
                  {menu.banner && (
                    <div className="w-86.25 shrink-0">
                      <Link href={menu.banner.href || "#"} onClick={closeMenu} className="group relative block">
                        {/* IMAGE */}
                        <div className="relative aspect-5/6 overflow-hidden rounded-md">
                          <Image
                            src={menu.banner.image}
                            alt={menu.banner.title}
                            fill
                            className="object-cover"
                          />

                          {/* GRADIENT OVERLAY */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        </div>

                        {/* TEXT */}
                        <div className="absolute bottom-4 left-4 text-white">
                          <p className="text-lg font-semibold">
                            {menu.banner.title}
                          </p>
                          <p className="text-sm opacity-90">
                            {menu.banner.subtitle}
                          </p>
                        </div>

                        {/* ARROW BUTTON */}
                        <div className="absolute bottom-4 right-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-transparent text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />

                          </div>
                        </div>

                      </Link>
                    </div>
                  )}

                </div>
              );
            })()}
          </div>
        </motion.div>
      )}
    </nav>
  );
}