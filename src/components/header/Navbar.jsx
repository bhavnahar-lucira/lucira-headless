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
    <nav className="relative bg-white">
      <div className="container-main relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: hideTop ? 1 : 0,
            scale: hideTop ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
          className={`absolute left-4 lg:left-6 xl:left-2 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 flex items-center justify-center ${hideTop ? "pointer-events-auto" : "pointer-events-none"
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
        <ul className="flex flex-start gap-6 xl:gap-8 2xl:gap-8 lg:text-xs xl:text-sm uppercase">
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
                    "block py-4 tracking-normal transition-all duration-200 uppercase text-[14px] leading-none font-medium font-figtree",
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
                const featuredCol = menu.featured ? 1 : 0;
                const cardCols = menu.cards?.length || 0;
                const totalCols =
                  baseCols + featuredCol + cardCols || 1;

                const isImageOnly =
                  menu.type === "image-grid" ||
                  (baseCols === 0 && cardCols > 0);

                let gridTemplate;

                if (isImageOnly) {
                  gridTemplate = `repeat(${totalCols}, minmax(0, 1fr))`;
                } else {
                  const normalCols = totalCols - cardCols;

                  gridTemplate = `
                    ${Array(normalCols)
                      .fill("minmax(0, 1fr)")
                      .join(" ")}
                    ${Array(cardCols)
                      .fill("minmax(0, 1.5fr)")
                      .join(" ")}
                  `;
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
                return (
                  <div
                    className="grid gap-x-4"
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {/* FEATURED */}
                    {menu.featured && (
                      <div className="pr-4 border-r border-zinc-100">
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.1em] text-black">
                          {menu.featured.title}
                        </h4>
                        <ul className="space-y-4 text-[13px] font-medium text-zinc-500">
                          {menu.featured.items?.map((item, i) => (
                            <li key={i} className="hover:text-black transition-colors">
                              <Link href={item.href || "#"} onClick={closeMenu} className="flex items-center gap-3 group">
                                {item.menuIcon && (
                                   <div className="relative h-7 w-7 shrink-0 flex items-center justify-center bg-gray-50 rounded-full overflow-hidden transition-all group-hover:bg-gray-100">
                                      <Image
                                        src={item.menuIcon}
                                        alt={item.label}
                                        fill
                                        className="object-contain p-1"
                                      />
                                   </div>
                                )}
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* TEXT COLUMNS (RESTORED ICON LOGIC) */}
                    {menu.columns?.map((col, i) => (
                      <div key={i}>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.1em] text-black whitespace-nowrap">
                          {col.title}
                        </h4>

                        <ul className="space-y-4 text-[13px] font-medium text-zinc-500">
                          {col.items.map((item, j) => (
                            <li key={j} className="hover:text-black transition-colors">
                              <Link
                                href={item.href || "#"}
                                onClick={closeMenu}
                                className="flex items-center gap-3 group"
                              >
                                {/* ✅ METAL SWATCH */}
                                {col.type === "metal" ? (
                                  <span
                                    className="w-4 h-4 rounded-full border border-zinc-200"
                                    style={{
                                      background: item.label.toLowerCase().includes("yellow")
                                        ? "linear-gradient(135deg, #E2C07E 0%, #D4AF37 100%)"
                                        : item.label.toLowerCase().includes("rose")
                                        ? "linear-gradient(135deg, #E9B4AB 0%, #C48D82 100%)"
                                        : item.label.toLowerCase().includes("white")
                                        ? "#E5E4E2"
                                        : item.label.toLowerCase().includes("silver")
                                        ? "#C0C0C0"
                                        : item.label.toLowerCase().includes("platinum")
                                        ? "#E5E4E2"
                                        : "#ddd",
                                    }}
                                  />
                                ) : item.menuIcon || item.megaMenuImage || (col.type === "icon" && item.icon) ? (
                                  <div className="relative h-7 w-7 shrink-0 flex items-center justify-center bg-gray-50 rounded-full overflow-hidden transition-all group-hover:bg-gray-100">
                                    <Image
                                      src={item.menuIcon || item.megaMenuImage || item.icon}
                                      alt={item.label}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                ) : null}

                                <span>{item.label}</span>
                              </Link>
                            </li>
                          ))}

                          
                        </ul>
                      </div>
                    ))}

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
                );
              })()}
            </div>
          </motion.div>
        )}
    </nav>
  );
}