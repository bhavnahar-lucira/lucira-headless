"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Heart, ShoppingBag, Home, X, ChevronRight, ChevronLeft, User as UserIcon, LogOut, MessageCircle, Package, Video, Store, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/features/user/userSlice";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { restoreGuestWishlist } from "@/redux/features/wishlist/wishlistSlice";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useMenu } from "@/hooks/useMenu";
import { MEGA_MENU as STATIC_MENU } from "@/data/megaMenu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pushLogout, pushViewCart } from "@/lib/gtm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LuciraLogo from "./LuciraLogo";
import SearchPopup from "./SearchPopup";
import { AnimatePresence } from "framer-motion";

const CATEGORY_IMAGES = {
  "BEST SELLERS": "/images/menu/engagement-ring.jpg",
  "ENGAGEMENT RINGS": "/images/menu/engagement-ring.jpg",
  "RINGS": "/images/menu/wedding-ring.jpg",
  "EARRINGS": "/images/menu/earring.jpg",
  "MORE JEWELRY": "/images/menu/more-jewellery.jpg",
  "solitaire": "/images/menu/earring.jpg",
  "COLLECTIONS": "/images/menu/hexa.jpg",
  "GIFTING": "/images/menu/gifting.jpg",
  "9KT COLLECTION": "/images/menu/candy.jpg",
};

const METAL_COLORS = {
  "Yellow Gold": "#E5C161",
  "White Gold": "#E5E5E5",
  "Rose Gold": "#EAB0A2",
  "Platinum": "#D9D9D9",
  "Silver": "#C0C0C0",
};

const STYLE_ICON_FALLBACK = (label) => `/images/styles/${label.toLowerCase().replace(/ /g, "")}.png`;
const SHAPE_ICON_FALLBACK = (label) => `/images/shapes/${label.toLowerCase()}.png`;

function SafeImage({ src, alt, fallback = "/images/icons/diamond.svg", ...props }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallback);
        }
      }}
    />
  );
}

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();  
  const isProductPage = pathname.startsWith('/products/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(!isProductPage);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isSearchSuggestionsVisible = (isFocused || searchQuery.length > 0) && showSearch;

  // Lock body scroll when search suggestions are active
  useEffect(() => {
    if (isSearchSuggestionsVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // Extra prevention for mobile touch scroll
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isSearchSuggestionsVisible]);

  const { menuData } = useMenu("main-menu-official");
  const MEGA_MENU = menuData || STATIC_MENU;

  // Sync showSearch when pathname changes
  useEffect(() => {
    setShowSearch(!pathname.startsWith('/products/'));
  }, [pathname]);

  const { user } = useSelector((state) => state.user);
  const { totalQuantity, totalAmount, items } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [activeMenuPath, setActiveMenuPath] = useState([]);

  useEffect(() => {
    if (!isMenuOpen) {
      setActiveMenuPath([]);
    }
  }, [isMenuOpen]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = async () => {
    try {
      pushLogout({
        id: user?.id || "",
        mobile: user?.mobile || "",
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || ""
      });
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      dispatch(restoreGuestWishlist());
      router.push("/");
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsFocused(false);
    }
  };

  const getCurrentMenu = () => {
    let current = MEGA_MENU;
    for (const index of activeMenuPath) {
      const item = current[index];
      if (item.columns) {
        current = item.columns;
      } else if (item.items) {
        current = item.items;
      } else if (item.featured) {
        current = item.featured;
      }
    }
    return current;
  };

  const getActiveItem = () => {
    if (activeMenuPath.length === 0) return null;
    let current = MEGA_MENU;
    let item = null;
    for (let i = 0; i < activeMenuPath.length; i++) {
      item = current[activeMenuPath[i]];
      if (i < activeMenuPath.length - 1) {
        if (item.columns) current = item.columns;
        else if (item.items) current = item.items;
        else if (item.featured) current = item.featured;
      }
    }
    return item;
  };

  const getMenuTitle = () => {
    const activeItem = getActiveItem();
    return activeItem ? (activeItem.label || activeItem.title) : <LuciraLogo className="w-6" />;
  };

  const handleBack = () => {
    setActiveMenuPath(prev => prev.slice(0, -1));
  };

  const handleItemClick = (item, index) => {
    if (item.columns || item.items || (item.featured && Array.isArray(item.featured))) {
      setActiveMenuPath(prev => [...prev, index]);
    } else if (item.href) {
      setIsMenuOpen(false);
      router.push(item.href);
    }
  };

  const renderSubMenu = (activeItem) => {
    return (
      <div className="flex flex-col px-4 py-2">
        <Accordion type="multiple" className="w-full" defaultValue={activeItem.columns?.map((_, i) => `item-${i}`)}>
          {activeItem.columns?.map((col, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-none">
              <AccordionTrigger className="text-sm font-semibold capitalize font-figtree tracking-widest hover:no-underline py-4">
                {col.title}
              </AccordionTrigger>
              <AccordionContent>
                {(col.type === "icon" || col.type === "metal") && (
                  <div className="grid grid-cols-3 gap-y-6 gap-x-2 pt-2">
                    {col.items.map((item, i) => {
                      const titleLower = col.title.toLowerCase();
                      const isShape = titleLower.includes("shape");
                      const isMetal = titleLower.includes("metal") || titleLower.includes("material") || col.type === "metal";
                      
                      if (isMetal) {
                        return (
                          <Link 
                            key={i} 
                            href={item.href || "#"} 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex flex-col items-center gap-2"
                          >
                            <div 
                              className="w-12 h-12 rounded-full border border-gray-100 shadow-sm"
                              style={{ backgroundColor: METAL_COLORS[item.label] || "#eee" }}
                            />
                            <span className="text-[13px] font-figtree text-center font-normal leading-tight">{item.label}</span>
                          </Link>
                        );
                      }

                      const iconPath = isShape ? SHAPE_ICON_FALLBACK(item.label) : STYLE_ICON_FALLBACK(item.label);
                      return (
                        <Link 
                          key={i} 
                          href={item.href || "#"} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 relative flex items-center justify-center bg-gray-50 rounded-full overflow-hidden">
                            <SafeImage 
                              src={iconPath} 
                              alt={item.label} 
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <span className="text-[13px] font-figtree text-center font-normal leading-tight">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
                {col.type === "text" && (
                   <div className="grid grid-cols-2 gap-2 pt-2">
                    {col.items.map((item, i) => (
                      <Link 
                        key={i} 
                        href={item.href || "#"} 
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-gray-50 px-3 py-2 text-[11px] font-medium text-center rounded-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}

          {activeItem.featured && activeItem.featured.length > 0 && (
            <AccordionItem value="featured" className="border-none">
               <AccordionTrigger className="text-sm font-bold uppercase tracking-widest hover:no-underline py-4">
                Featured
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-3 pt-2">
                  {activeItem.featured.map((f, i) => (
                    <Link key={i} href={f.href || "#"} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-700">
                      {f.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    );
  };

  const renderMainMenu = () => {
    return (
      <div className="flex flex-col pb-8">
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {MEGA_MENU.map((item, index) => {
            const label = item.label || item.title;
            const image = CATEGORY_IMAGES[label] || "/images/menu/engagement-ring.jpg";
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item, index)}
                className="relative aspect-[4/5] overflow-hidden rounded-lg group"
              >
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-cover transition-transform group-active:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-active:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-black text-sm font-medium capitalize tracking-wider font-figtree">
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-4 space-y-6">
          <div className="bg-[#FAF6F3] mx-4 p-4 space-y-4 rounded-lg">
            <Link href="/account/orders" onClick={() => setIsMenuOpen(false)} className="block text-[16px] font-bold capitalize font-figtree tracking-wider text-gray-800 border-b border-gray-200 pb-3">
              Track Your Order
            </Link>
            <Link href="/pages/contact-us" onClick={() => setIsMenuOpen(false)} className="block text-[16px] font-bold capitalize font-figtree tracking-wider text-gray-800 border-b border-gray-200 pb-3">
              Contact Us
            </Link>
            <Link href="/pages/faqs" onClick={() => setIsMenuOpen(false)} className="block text-[16px] font-bold capitalize font-figtree tracking-wider text-gray-800">
              FAQs
            </Link>
          </div>

          <div className="px-4 space-y-1">
            <a href="https://wa.me/yournumber" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">WhatsApp Us</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Chat with us instantly for product details, styling tips, or quick assistance.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </a>

            <Link href="/pages/vault-of-dreams" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Vault Of Dreams</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Pay for 9 months, and get the 10th month free, your smart jewellery savings plan.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>

            <Link href="/pages/video-call" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                  <Video size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Video Call</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Explore and shop jewellery live with our experts over a video call.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>

            <Link href="/pages/visit-store" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                  <Store size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Visit Store</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Visit our stores to explore and try your favorite designs in person.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          </div>

          <div className="px-4 pb-8">
            {user ? (
               <button onClick={handleLogout} className="w-full bg-[#4E3E3E] text-white py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <LogOut size={20} /> Logout
              </button>
            ) : (
              <button onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true); }} className="w-full bg-[#4E3E3E] text-white py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <UserIcon size={20} /> Log In / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeItem = getActiveItem();

  return (
    <div className="bg-white border-b border-gray-100 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Hamburger */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-1">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full p-0 border-none" showCloseButton={false}>
            <div className="flex flex-col h-screen bg-[#F1F1F1] overflow-hidden">
              <SheetHeader className="px-4 py-4 border-b border-gray-200 flex flex-row items-center justify-between sticky top-0 bg-white z-10 shrink-0">
                <div className="flex items-center gap-2">
                  {activeMenuPath.length > 0 && (
                    <button onClick={handleBack} className="p-1 mr-1">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <SheetTitle className="text-sm font-semibold capitalize font-figtree tracking-widest">
                    {getMenuTitle()}
                  </SheetTitle>
                </div>
                <SheetClose asChild>
                  <button className="p-1">
                    <X size={24} />
                  </button>
                </SheetClose>
              </SheetHeader>

              <ScrollArea className="flex-grow h-full overflow-y-auto">
                {activeMenuPath.length === 0 ? renderMainMenu() : renderSubMenu(activeItem)}
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Lucira Jewelry"
            width={100}
            height={40}
            priority
          />
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {isProductPage && (
            <button onClick={() => setShowSearch(!showSearch)} className="p-1">
              <Search size={22} strokeWidth={1.5} className={showSearch ? "text-primary" : ""} />
            </button>
          )}

          <Link href="/">
            <Home size={22} strokeWidth={1.5} />
          </Link>
          <Link href={user ? "/admin/wishlist" : "#"} onClick={!user ? () => setIsAuthOpen(true) : undefined} className="relative">
            <Heart size={22} strokeWidth={1.5} className={wishlistItems.length > 0 ? "text-rose-500 fill-rose-500" : ""} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link href="/checkout/cart" className="relative">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Bar Row */}
      {showSearch && (
        <div className="px-4 py-2 bg-white animate-in slide-in-from-top-2 duration-200 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Shop for Solitaire Rings"
              className="w-full bg-gray-50 h-10 pl-10 pr-4 rounded-sm text-sm outline-none focus:ring-1 focus:ring-gray-200"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 200);
              }}
              autoFocus={isProductPage}
            />
          </div>

          <AnimatePresence>
            {(isFocused || searchQuery.length > 0) && (
              <SearchPopup 
                onClose={() => setIsFocused(false)} 
                searchQuery={searchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
}
