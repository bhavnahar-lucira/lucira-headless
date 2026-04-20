"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Heart, ShoppingBag, Home, X, ChevronRight, ChevronLeft, User as UserIcon, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";
const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";

export default function MobileHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { menuData } = useMenu("main-menu-official");
  const MEGA_MENU = menuData || STATIC_MENU;

  const { user } = useSelector((state) => state.user);
  const { totalQuantity, totalAmount, items } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [activeMenuPath, setActiveMenuPath] = useState([]);

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
      setSearchQuery("");
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
        // Special case for featured
        current = item.featured;
      }
    }
    return current;
  };

  const getMenuTitle = () => {
    if (activeMenuPath.length === 0) return "MENU";
    let current = MEGA_MENU;
    let title = "";
    for (let i = 0; i < activeMenuPath.length; i++) {
      const item = current[activeMenuPath[i]];
      title = item.label || item.title;
      if (i < activeMenuPath.length - 1) {
        if (item.columns) current = item.columns;
        else if (item.items) current = item.items;
        else if (item.featured) current = item.featured;
      }
    }
    return title;
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
          <SheetContent side="left" className="w-[85%] p-0 border-none" showCloseButton={false}>
            <div className="flex flex-col h-full bg-white">
              <SheetHeader className="px-4 py-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeMenuPath.length > 0 && (
                    <button onClick={handleBack} className="p-1 mr-1">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <SheetTitle className="text-sm font-bold uppercase tracking-widest">
                    {getMenuTitle()}
                  </SheetTitle>
                </div>
                <SheetClose asChild>
                  <button className="p-1">
                    <X size={20} />
                  </button>
                </SheetClose>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="flex flex-col py-2">
                  {getCurrentMenu().map((item, index) => {
                    const hasSub = item.columns || item.items || (item.featured && Array.isArray(item.featured));
                    return (
                      <button
                        key={index}
                        onClick={() => handleItemClick(item, index)}
                        className="flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-800 border-b border-gray-50 last:border-none active:bg-gray-50"
                      >
                        <span className="uppercase tracking-wide">{item.label || item.title}</span>
                        {hasSub && <ChevronRight size={18} className="text-gray-400" />}
                      </button>
                    );
                  })}

                  {activeMenuPath.length === 0 && (
                    <div className="mt-4 px-5 space-y-4">
                      {user ? (
                        <>
                          <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-3 text-sm font-medium">
                            <UserIcon size={20} /> My Account
                          </Link>
                          <button onClick={handleLogout} className="flex items-center gap-3 py-3 text-sm font-medium text-red-500">
                            <LogOut size={20} /> Logout
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true); }} className="flex items-center gap-3 py-3 text-sm font-medium">
                          <UserIcon size={20} /> Login / Sign Up
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
      <div className="px-4 py-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Shop for Solitaire Rings"
            className="w-full bg-gray-50 h-10 pl-10 pr-4 rounded-sm text-sm outline-none focus:ring-1 focus:ring-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
}
