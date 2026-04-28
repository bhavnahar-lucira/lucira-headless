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
  "Yellow Gold": "linear-gradient(147.45deg, #C59922 17.98%, #EAD59E 48.14%, #C59922 83.84%)",
  "White Gold": "linear-gradient(143.06deg, #DFDFDF 29.61%, #F3F3F3 48.83%, #DFDFDF 66.43%)",
  "Rose Gold": "linear-gradient(154.36deg, #F2B5B5 10.36%, #F8DBDB 68.09%)",
  "Platinum": "linear-gradient(154.03deg, #DDDDDD 27.25%, #FFFFFF 47.58%, #DDDDDD 74.61%)",
  "Silver": "linear-gradient(143.06deg, #DFDFDF 29.61%, #F3F3F3 48.83%, #DFDFDF 66.43%)",
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

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="black" strokeWidth="1.17914" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M17.499 17.5L13.874 13.875" stroke="black" strokeWidth="1.17914" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>
);

const HeartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.6019 2.8079C15.477 2.8079 17.0019 4.37215 17.0019 6.29564C17.0019 10.3667 12.2903 14.0916 9.77686 15.907C7.26341 14.0916 2.55186 10.3667 2.55186 6.29564C2.55186 4.37215 4.07676 2.8079 5.95186 2.8079C6.49782 2.80916 7.03549 2.94494 7.51964 3.2038C8.00378 3.46267 8.42022 3.83704 8.73391 4.29542L9.77686 5.81869L10.8198 4.29629C11.1334 3.83775 11.5498 3.46321 12.0339 3.20419C12.5181 2.94517 13.0558 2.80926 13.6019 2.8079ZM13.6019 1.5C12.851 1.49989 12.1113 1.68562 11.4454 2.04143C10.7795 2.39724 10.2071 2.91262 9.77686 3.54381C9.3466 2.91262 8.77423 2.39724 8.10834 2.04143C7.44244 1.68562 6.70268 1.49989 5.95186 1.5C4.71197 1.5 3.52286 2.00525 2.64613 2.90461C1.7694 3.80397 1.27686 5.02376 1.27686 6.29564C1.27686 11.2822 6.80186 15.3969 9.77686 17.5C12.7519 15.3969 18.2769 11.2822 18.2769 6.29564C18.2769 5.66587 18.1559 5.04226 17.921 4.46043C17.6861 3.87859 17.3417 3.34993 16.9076 2.90461C16.4735 2.45929 15.9581 2.10605 15.3909 1.86505C14.8237 1.62404 14.2158 1.5 13.6019 1.5Z" fill="black"></path>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.22112 5.35692C4.22112 5.35692 3.81759 0.589355 7.85288 0.589355C11.8882 0.589355 11.4846 5.35692 11.4846 5.35692M0.589355 17.2758L1.33747 4.90168C1.37058 4.35392 1.82446 3.92665 2.37322 3.92665H13.3371C13.884 3.92665 14.3369 4.34892 14.3722 4.89468C14.654 9.25047 15.1164 16.5686 15.1164 17.2758C15.1164 18.0386 14.5784 18.2294 14.3094 18.2294C10.2741 18.2294 2.04206 18.2294 1.39641 18.2294C0.750767 18.2294 0.589355 17.5937 0.589355 17.2758Z" stroke="black" strokeWidth="1.17914" strokeLinecap="round"></path>
  </svg>
);

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
                              style={{ background: METAL_COLORS[item.label] || "#eee" }}
                            />
                            <span className="text-[13px] font-figtree text-center font-normal leading-tight">{item.label}</span>
                          </Link>
                        );
                      }

                      const iconPath = item.menuIcon || (isShape ? SHAPE_ICON_FALLBACK(item.label) : STYLE_ICON_FALLBACK(item.label));
                      return (
                        <Link 
                          key={i} 
                          href={item.href || "#"} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-22 h-22 relative flex items-center justify-center overflow-hidden">
                            <SafeImage 
                              src={iconPath} 
                              alt={item.label} 
                              className="w-18 h-18 object-contain"
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
                    <Link key={i} href={f.href || "#"} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-700 flex items-center gap-3">
                      {f.menuIcon && (
                        <div className="w-8 h-8 relative flex items-center justify-center bg-gray-50 rounded-full overflow-hidden shrink-0">
                          <SafeImage 
                            src={f.menuIcon} 
                            alt={f.label} 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      )}
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

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleAuthTrigger = () => {
    if (isAuthPage) return;
    setIsAuthOpen(true);
  };

  const renderMainMenu = () => {
    return (
      <div className="flex flex-col pb-8">
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {MEGA_MENU.map((item, index) => {
            const label = item.label || item.title;
            const image = item.mobileBanner || CATEGORY_IMAGES[label] || "/images/menu/engagement-ring.jpg";
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item, index)}
                className="relative aspect-[4/4] overflow-hidden rounded-lg group"
              >
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-cover transition-transform group-active:scale-105"
                />
                <div className="drawer-menu-image absolute inset-0 bg-black/10 group-active:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="absolute bottom-0 left-0 text-white text-[14px] leading-none tracking-normal font-medium capitalize font-figtree sm:static sm:text-base sm:leading-normal sm:tracking-wide">
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
            <Link href="/account/orders" onClick={() => setIsMenuOpen(false)} className="block text-[16px] tracking-wider border-b border-gray-200 pb-3 font-figtree font-medium text-base leading-none align-middle capitalize text-black">
              Track Your Order
            </Link>
            <Link href="/pages/contact-us" onClick={() => setIsMenuOpen(false)} className="block text-[16px] tracking-wider border-b border-gray-200 pb-3 font-figtree font-medium text-base leading-none align-middle capitalize text-black">
              Contact Us
            </Link>
            <Link href="/pages/faqs" onClick={() => setIsMenuOpen(false)} className="block text-[16px] tracking-wider font-figtree font-medium text-base leading-none align-middle capitalize text-black">
              FAQs
            </Link>
          </div>

          <div className="px-4 space-y-1">
            <a href="https://wa.me/yournumber" className="flex items-center justify-between p-4 border border-gray-100 rounded-lg group active:bg-gray-50 bg-[#FBF7F2]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1043_46659)">
                      <path d="M0.427148 9.88041C0.42668 11.5608 0.86918 13.2016 1.71059 14.6478L0.34668 19.589L5.44293 18.2631C6.85249 19.0245 8.43179 19.4235 10.0367 19.4236H10.0409C15.3389 19.4236 19.6517 15.1458 19.6539 9.88793C19.655 7.3401 18.6559 4.94428 16.8407 3.1418C15.0259 1.33948 12.6122 0.346378 10.0405 0.345215C4.74184 0.345215 0.429414 4.62273 0.427227 9.88041" fill="url(#paint0_linear_1043_46659)"></path>
                      <path d="M0.0835938 9.87721C0.0830469 11.6181 0.541406 13.3175 1.41281 14.8155L0 19.9339L5.27898 18.5605C6.73352 19.3474 8.37117 19.7622 10.0376 19.7629H10.0419C15.53 19.7629 19.9977 15.3312 20 9.88512C20.0009 7.24574 18.9659 4.7638 17.0859 2.89674C15.2057 1.02992 12.7057 0.00108527 10.0419 0C4.55281 0 0.0857813 4.43101 0.0835938 9.87721ZM3.22742 14.5575L3.03031 14.2471C2.20172 12.9398 1.76437 11.4291 1.765 9.87783C1.76672 5.35109 5.47953 1.66822 10.045 1.66822C12.2559 1.66915 14.3337 2.52434 15.8966 4.07597C17.4593 5.62775 18.3192 7.69054 18.3187 9.8845C18.3166 14.4112 14.6037 18.0946 10.0419 18.0946H10.0386C8.5532 18.0938 7.09641 17.698 5.82594 16.95L5.52359 16.7721L2.39094 17.5871L3.22742 14.5575Z" fill="url(#paint1_linear_1043_46659)"></path>
                      <path d="M7.55254 5.74776C7.36613 5.33668 7.16996 5.32838 6.9927 5.32117C6.84754 5.31497 6.6816 5.31544 6.51582 5.31544C6.34988 5.31544 6.08027 5.37738 5.85238 5.62427C5.62426 5.87141 4.98145 6.46862 4.98145 7.68327C4.98145 8.89792 5.87309 10.0719 5.99738 10.2368C6.12184 10.4013 7.71871 12.9737 10.2478 13.9633C12.3496 14.7857 12.7774 14.6222 13.2336 14.5809C13.6898 14.5399 14.7057 13.9839 14.913 13.4074C15.1204 12.8309 15.1204 12.3368 15.0582 12.2336C14.9961 12.1307 14.8301 12.0689 14.5813 11.9455C14.3325 11.8221 13.1091 11.2247 12.8811 11.1423C12.6529 11.06 12.4871 11.0189 12.3211 11.2661C12.1552 11.513 11.6787 12.0689 11.5335 12.2336C11.3884 12.3986 11.2432 12.4192 10.9944 12.2957C10.7454 12.1718 9.9441 11.9114 8.9934 11.0704C8.25371 10.416 7.75434 9.60784 7.60918 9.36063C7.46402 9.11381 7.59363 8.98001 7.7184 8.85699C7.8302 8.74637 7.9673 8.56869 8.09184 8.42459C8.2159 8.2804 8.2573 8.17753 8.34027 8.01288C8.42332 7.84807 8.38176 7.70389 8.31965 7.5804C8.2573 7.45691 7.77379 6.2359 7.55254 5.74776Z" fill="white"></path>
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_1043_46659" x1="965.71" y1="1924.73" x2="965.71" y2="0.345215" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1FAF38"></stop>
                        <stop offset="1" stopColor="#60D669"></stop>
                      </linearGradient>
                      <linearGradient id="paint1_linear_1043_46659" x1="1000" y1="1993.39" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F9F9F9"></stop>
                        <stop offset="1" stopColor="white"></stop>
                      </linearGradient>
                      <clipPath id="clip0_1043_46659">
                        <rect width="20" height="20" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h4 className="block mb-2 font-figtree font-semibold text-sm leading-none align-middle text-black">WhatsApp Us</h4>
                  <p className="mt-3 font-figtree font-normal text-[12px] leading-[1.4] align-middle text-black">Chat with us instantly for product details, styling tips, or quick assistance.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-black" />
            </a>

            <Link href="/pages/vault-of-dreams" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg group active:bg-gray-50 bg-[#FBF7F2]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M7.5 8C7.77614 8 8 7.77614 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 7.77614 7.22386 8 7.5 8Z" fill="black" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M7.90039 7.8999L10.6004 10.5999" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M16.5 8C16.7761 8 17 7.77614 17 7.5C17 7.22386 16.7761 7 16.5 7C16.2239 7 16 7.22386 16 7.5C16 7.77614 16.2239 8 16.5 8Z" fill="black" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M13.4004 10.5999L16.1004 7.8999" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M7.5 17C7.77614 17 8 16.7761 8 16.5C8 16.2239 7.77614 16 7.5 16C7.22386 16 7 16.2239 7 16.5C7 16.7761 7.22386 17 7.5 17Z" fill="black" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M7.90039 16.0999L10.6004 13.3999" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M16.5 17C16.7761 17 17 16.7761 17 16.5C17 16.2239 16.7761 16 16.5 16C16.2239 16 16 16.2239 16 16.5C16 16.7761 16.2239 17 16.5 17Z" fill="black" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M13.4004 13.3999L16.1004 16.0999" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="block mb-2 font-figtree font-semibold text-sm leading-none align-middle text-black">Vault Of Dreams</h4>
                  <p className="mt-3 font-figtree font-normal text-[12px] leading-[1.4] align-middle text-black">Pay for 9 months, and get the 10th month free, your smart jewellery savings plan.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-black" />
            </Link>

            <Link href="/pages/video-call" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-[#FBF7F2] border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.334 10.8334L17.6865 13.7351C17.7492 13.7768 17.8221 13.8008 17.8974 13.8044C17.9727 13.808 18.0475 13.7911 18.114 13.7555C18.1804 13.7199 18.236 13.667 18.2747 13.6024C18.3135 13.5377 18.3339 13.4638 18.334 13.3884V6.55839C18.334 6.48508 18.3147 6.41306 18.278 6.3496C18.2413 6.28614 18.1884 6.23349 18.1249 6.19697C18.0613 6.16045 17.9892 6.14136 17.9159 6.1416C17.8426 6.14185 17.7706 6.16144 17.7073 6.19839L13.334 8.75006" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M11.667 5H3.33366C2.41318 5 1.66699 5.74619 1.66699 6.66667V13.3333C1.66699 14.2538 2.41318 15 3.33366 15H11.667C12.5875 15 13.3337 14.2538 13.3337 13.3333V6.66667C13.3337 5.74619 12.5875 5 11.667 5Z" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="block mb-2 font-figtree font-semibold text-sm leading-none align-middle text-black">Video Call</h4>
                  <p className="mt-3 font-figtree font-normal text-[12px] leading-[1.4] align-middle text-black">Explore and shop jewellery live with our experts over a video call.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>

            <Link href="/pages/visit-store" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-[#FBF7F2] border border-gray-100 rounded-lg group active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6636 8.85083V15.8333C16.6636 16.2754 16.488 16.6993 16.1755 17.0118C15.8629 17.3244 15.439 17.5 14.9969 17.5H5.00361C4.56173 17.4998 4.13802 17.3241 3.82564 17.0115C3.51326 16.699 3.33778 16.2752 3.33778 15.8333V8.85083M6.25194 7.29167L6.66861 2.5M6.25194 7.29167C6.25194 9.71 10.0003 9.71 10.0003 7.29167M6.25194 7.29167C6.25194 9.93833 1.95611 9.39167 2.55778 7.085L3.42861 3.74583C3.52168 3.38919 3.73034 3.07346 4.02196 2.84804C4.31358 2.62262 4.67169 2.50022 5.04028 2.5H14.9603C15.3289 2.50022 15.687 2.62262 15.9786 2.84804C16.2702 3.07346 16.4789 3.38919 16.5719 3.74583L17.4428 7.085C18.0444 9.3925 13.7486 9.93833 13.7486 7.29167M10.0003 7.29167V2.5M10.0003 7.29167C10.0003 9.71 13.7486 9.71 13.7486 7.29167M13.7486 7.29167L13.3319 2.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="block mb-2 font-figtree font-semibold text-sm leading-none align-middle text-black">Visit Store</h4>
                  <p className="mt-3 font-figtree font-normal text-[12px] leading-[1.4] align-middle text-black">Visit our stores to explore and try your favorite designs in person.</p>
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
              <button onClick={() => { setIsMenuOpen(false); handleAuthTrigger(); }} className="w-full bg-[#4E3E3E] text-white py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
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
        <div className="flex items-center gap-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-1">
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-0 border-none" showCloseButton={false}>
              <div className="flex flex-col h-screen bg-[#fff] overflow-hidden">
                <SheetHeader className="px-4 py-4 border-b border-gray-200 flex flex-row items-center justify-between sticky top-0 bg-white z-10 shrink-0">
                  <div className="flex items-center gap-2">
                    {activeMenuPath.length > 0 && (
                      <button onClick={handleBack} className="p-1 mr-1">
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <SheetTitle className="text-sm font-semibold capitalize font-figtree tracking-widest font-figtree font-semibold text-base leading-none tracking-normal align-middle">
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
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {isProductPage && (
            <button onClick={() => setShowSearch(!showSearch)} className="p-1">
              <SearchIcon />
            </button>
          )}

          <Link href="/">
            <Home size={22} strokeWidth={1.5} />
          </Link>
          <Link href={user ? "/admin/wishlist" : "#"} onClick={!user ? handleAuthTrigger : undefined} className="relative">
            <HeartIcon />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link href="/checkout/cart" className="relative">
            <CartIcon />
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none">
              <SearchIcon />
            </div>
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
