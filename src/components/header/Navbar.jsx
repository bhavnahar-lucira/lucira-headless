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
  const { menuData } = useMenu("main-menu-official");
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

  const hasDropdown = (menu) =>
    menu.type === "mega" || menu.type === "image-grid";

  const activeMenuPath = [...MEGA_MENU]
    .filter(
      (menu) =>
        pathname === menu.href ||
        (menu.href !== "/" && pathname.startsWith(menu.href + "/"))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const currentActiveHref =
    pathname === "/"
      ? "/"
      : pathname === activeMenuPath
      ? activeMenuPath
      : MEGA_MENU.find((m) => m.href === pathname)?.href ||
        activeMenuPath;

  return (
    <nav className="relative bg-white border-b border-gray-100 z-[90]">
      <div className="container-main relative flex items-center min-h-[40px]">
        {/* Left: Sticky Logo */}
        <motion.div
          initial={false}
          animate={{
            opacity: hideTop ? 1 : 0,
            x: hideTop ? 0 : -20,
            width: hideTop ? "auto" : 0,
            marginRight: hideTop ? 32 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden flex-shrink-0"
        >
          <Link href="/" className="block">
            <Image
              src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/dark_brown_Logo_icon_2.svg?v=1777366090"
              alt="Lucira Jewelry"
              width={40}
              height={40}
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain"
            />
          </Link>
        </motion.div>

        {/* Navigation Menu */}
        <ul className="flex items-center gap-6 xl:gap-8 2xl:gap-8 lg:text-xs xl:text-sm uppercase transition-all duration-300 mx-0">
          {MEGA_MENU.map((menu, index) => {
            const isActive =
              pathname === menu.href ||
              currentActiveHref === menu.href;

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
                    "block py-4 tracking-normal transition-all duration-200 uppercase text-sm leading-none font-medium font-figtree",
                    isActive || isHovered
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {menu.label}
                </Link>

                {(isHovered || (isActive && activeMenu === null)) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {activeMenu !== null &&
        hasDropdown(MEGA_MENU[activeMenu]) && (
          <motion.div
            onMouseEnter={() => handleEnter(activeMenu)}
            onMouseLeave={handleLeave}
            className="absolute left-0 top-full w-full bg-white shadow-xl z-50 border-t border-gray-200"
          >
            <div className="container-main mx-auto py-8">
              {(() => {
                const menu = MEGA_MENU[activeMenu];

                const baseCols = menu.columns?.length || 0;
                const hasFeaturedItems = menu.featured?.items?.length > 0 || (Array.isArray(menu.featured) && menu.featured.length > 0);
                const featuredCol = hasFeaturedItems ? 1 : 0;
                const cardCols = menu.cards?.length || 0;

                const isImageOnly =
                  menu.type === "image-grid" ||
                  (baseCols === 0 && cardCols > 0);

                let gridTemplate;

                if (isImageOnly) {
                  const totalCols = baseCols + (menu.featured ? 1 : 0) + cardCols || 1;
                  gridTemplate = `repeat(${totalCols}, minmax(0, 1fr))`;
                } else {
                  // Dynamically calculate weights for each column
                  const weights = [];
                  
                  if (hasFeaturedItems) weights.push(1.2); 

                  menu.columns?.forEach(col => {
                    const title = col.title?.toLowerCase();
                    const isByStyle = title.includes("style");
                    weights.push(isByStyle ? 2.2 : 1); 
                  });

                  for (let i = 0; i < cardCols; i++) {
                    weights.push(1.5); 
                  }

                  gridTemplate = weights.map(w => `minmax(0, ${w}fr)`).join(" ");
                }

                /* IMAGE GRID */
                if (isImageOnly) {
                  const items = menu.items || menu.cards;
                  return (
                    <div
                      className="grid gap-x-6"
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href || "#"}
                          onClick={closeMenu}
                          className="group relative block overflow-hidden rounded-md"
                        >
                          <div className="relative aspect-4/5 w-full overflow-hidden rounded-md">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                          </div>

                          <div className="absolute bottom-4 left-4 right-12 text-white">
                            <p className="text-lg font-semibold">
                              {item.title}
                            </p>
                            <p className="text-xs mt-1 opacity-90">
                              {item.subtitle || item.description}
                            </p>
                          </div>

                          <div className="absolute bottom-4 right-4">
                            <div className="flex lg:w-8 lg:h-8 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white text-white group-hover:bg-white group-hover:text-black">
                              <ArrowRight size={18} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                }

                /* MEGA MENU */
                const featuredIn = menu.featured?.featuredIn || menu.featuredIn;

                return (
                  <div className="flex flex-col">
                    <div
                      className="grid gap-x-4"
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {/* FEATURED */}
                      {hasFeaturedItems && (
                        <div className="pr-6 border-r border-zinc-100 min-h-[250px]">
                          <h4 className="mb-6 font-figtree font-semibold text-base leading-none text-black uppercase">
                            {menu.featured.title || "Featured"}
                          </h4>
                          <ul className="space-y-4">
                            {(menu.featured.items || (Array.isArray(menu.featured) ? menu.featured : [])).map((item, i) => (
                              <li key={i}>
                                <Link href={item.href || "#"} onClick={closeMenu} className="group block">
                                  <span className="text-base font-medium text-zinc-900 group-hover:text-primary transition-colors">{item.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* TEXT COLUMNS (RESTORED ICON LOGIC) */}
                      {menu.columns?.map((col, i) => {
                        const title = col.title?.toLowerCase();
                        const isByStyle = title.includes("style");
                        const isByShape = title.includes("shape");
                        const isGridCol = isByStyle; // Only Style is a grid column

                        return (
                          <div key={i} className={cn(isGridCol && "col-span-1")}>
                            <h4 className="mb-6 font-figtree font-semibold text-base leading-none text-black uppercase">
                              {col.title}
                            </h4>

                            <ul className={cn(
                              "text-[13px] font-medium text-zinc-500",
                              isGridCol ? "grid grid-cols-2 gap-x-8 gap-y-0" : "space-y-4"
                            )}>
                              {col.items.map((item, j) => (
                                <li key={j} className={cn(
                                  "hover:text-black transition-colors",
                                  (col.type === "metal" || item.menuIcon || item.megaMenuImage || (col.type === "icon" && item.icon)) && 
                                  !col.title?.toLowerCase().includes("material") && 
                                  !col.title?.toLowerCase().includes("metal")
                                    ? "lg:mb-0"
                                    : ""
                                )}>
                                  <Link
                                    href={item.href || "#"}
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 group"
                                  >
                                    {/* ✅ METAL SWATCH */}
                                    {col.type === "metal" ? (
                                      <span
                                        className={`w-6 h-6 rounded-full border border-zinc-200 ${
                                          item.label.toLowerCase().includes("yellow")
                                            ? "bg-[linear-gradient(147.45deg,_#C59922_17.98%,_#EAD59E_48.14%,_#C59922_83.84%)]"
                                            : item.label.toLowerCase().includes("rose")
                                            ? "bg-[linear-gradient(154.36deg,_#F2B5B5_10.36%,_#F8DBDB_68.09%)]"
                                            : item.label.toLowerCase().includes("platinum")
                                            ? "bg-[linear-gradient(154.03deg,_#DFDFDF_27.25%,_#F3F3F3_85.19%)]"
                                            : item.label.toLowerCase().includes("white")
                                            ? "bg-[linear-gradient(143.06deg,_#DFDFDF_29.61%,_#F3F3F3_48.83%,_#DFDFDF_66.43%)]"
                                            : "bg-[#ddd]"
                                        }`}
                                      />
                                    ) : item.menuIcon || item.megaMenuImage || (col.type === "icon" && item.icon) ? (
                                      <div className={cn(
                                        "relative shrink-0 flex items-center justify-center rounded-full overflow-hidden transition-all",
                                        isByShape ? "h-12 w-12" : "h-16 w-16"
                                      )}>
                                        <Image
                                          src={item.menuIcon || item.megaMenuImage || item.icon}
                                          alt={item.label}
                                          fill
                                          className="object-contain p-1"
                                        />
                                      </div>
                                    ) : null}

                                    <span className="text-base font-medium text-zinc-900 group-hover:text-primary transition-colors">{item.label}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      {/* CARDS (UNCHANGED UI) */}
                      {menu.cards?.map((card, i) => (
                        <div key={i} className="col-span-1">
                          <Link
                            href={card.href || "#"}
                            onClick={closeMenu}
                            className="group relative block"
                          >
                            <div className="relative aspect-4/4 overflow-hidden rounded-md">
                              <Image
                                src={card.image}
                                alt={card.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                            </div>

                            <div className="absolute bottom-4 left-4 text-white">
                              <p className="text-lg font-semibold">{card.title}</p>
                              <p className="text-sm opacity-90">{card.subtitle}</p>
                            </div>

                            <div className="absolute bottom-4 right-4">
                              <div className="flex lg:h-8 lg:w-8 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white text-white group-hover:bg-white group-hover:text-black">
                                <ArrowRight size={18} />
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* FEATURED IN BOTTOM STRIP */}
                    {featuredIn && (
                      <div className="mt-10 pt-8 border-t border-zinc-100">
                        <div className="flex items-center gap-8">
                          <h4 className="font-figtree font-semibold text-sm leading-none text-zinc-400 uppercase tracking-widest shrink-0">
                            {featuredIn.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                            {featuredIn.items.map((item, i) => (
                              <Link key={i} href={item.href || "#"} onClick={closeMenu} className="flex items-center gap-3 group">
                                {item.icon && (
                                  <div className="relative h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-primary transition-all">
                                    <Image src={item.icon} alt={item.label} fill className="object-contain p-2" />
                                  </div>
                                )}
                                <span className="text-sm text-zinc-600 font-semibold group-hover:text-primary uppercase transition-colors whitespace-nowrap tracking-wide">
                                  {item.label}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
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