"use client";
import { useState, useEffect } from "react";
import { Search, Store, Heart, ShoppingBag, CirclePile, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useSelector, useDispatch } from "react-redux";
import { logout, setAvatar } from "@/redux/features/user/userSlice";
import { fetchCart, clearCart } from "@/redux/features/cart/cartSlice";
import {
  mergeGuestWishlist,
  restoreGuestWishlist,
  clearWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import SearchPopup from "./SearchPopup";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

export default function MainHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { totalQuantity } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const guestWishlistItems = useSelector((state) => state.wishlist.guestItems);

  useEffect(() => {
    dispatch(fetchCart({ userId: user?.id }));
    if (user?.id) {
      if (wishlistItems.length === 0) {
        dispatch(mergeGuestWishlist());
      }
    } else if (guestWishlistItems.length > 0) {
      dispatch(restoreGuestWishlist());
    } else {
      dispatch(clearWishlist());
    }

    // Fetch avatar if user is logged in but avatar is not in state
    if (user?.id && !user.avatar) {
      const fetchUserAvatar = async () => {
        try {
          const res = await fetch("/api/customer/profile/avatar");
          if (res.ok) {
            const data = await res.json();
            if (data.avatar) {
              dispatch(setAvatar(data.avatar));
            }
          }
        } catch (err) {
          console.error("Header avatar fetch error:", err);
        }
      };
      fetchUserAvatar();
    }
  }, [dispatch, user?.id, user?.avatar, wishlistItems.length, guestWishlistItems.length]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsFocused(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      dispatch(restoreGuestWishlist());
      router.push("/");
      router.refresh();
    }
  };

  const showSearch = isSearchOpen || isFocused;

  return (
    <div className="border-b border-gray-100 bg-white px-18 relative">
      <div className="page-width grid grid-cols-[1fr_2fr_1fr] items-center py-5">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Lucira Jewelry"
            width={120}
            height={50}
            priority
          />
        </Link>

        {/* Search Input and Dropdown Wrapper */}
        <div className={`flex justify-center relative ${showSearch ? "z-[1001]" : "z-10"}`}>
          <div className="relative w-full max-w-137.5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Shop for Engagement Rings"
              className="w-full pl-11 h-11 rounded-sm bg-gray-100 text-base outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Delay blur slightly to allow clicks inside the dropdown
                setTimeout(() => setIsFocused(false), 200);
              }}
              onClick={() => setIsFocused(true)}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />

            <AnimatePresence>
              {showSearch && (
                <SearchPopup 
                  onClose={() => setIsFocused(false)} 
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center justify-end gap-6 text-sm">

          <div className="hidden lg:flex items-center gap-2 cursor-pointer">
            <Store size={18} />
            <span>Find a Store</span>
          </div>

          {user ? (
            <div className="relative group flex items-center">

              <Avatar className="cursor-pointer">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>

              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-64 bg-white shadow-xl rounded-lg border opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold">Hi, {user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
                >
                  <UserIcon size={19} /> My Account
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50"
                >
                  <LogOut size={19} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <UserIcon size={19} className="cursor-pointer" onClick={() => setOpen(true)} />
          )}

          {user ? (
            <Link href="/admin/wishlist" className="relative group p-1">
              <Heart size={19} className={`cursor-pointer ${wishlistItems.length > 0 ? "text-rose-500" : "text-zinc-900"}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="relative group p-1">
              <Heart size={19} className={`cursor-pointer ${wishlistItems.length > 0 ? "text-rose-500" : "text-zinc-900"}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </button>
          )}
          <Link href="/checkout/cart" className="relative group p-1">
            <ShoppingBag size={19} className="cursor-pointer" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AuthDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
