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
import { pushLogout, pushViewCart } from "@/lib/gtm";

const INSURANCE_VARIANT_ID = "gid://shopify/ProductVariant/47709366026458";
const GOLDCOIN_VARIANT_ID = "gid://shopify/ProductVariant/47661824082138";


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
  const { totalQuantity, totalAmount, items } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const guestWishlistItems = useSelector((state) => state.wishlist.guestItems);

  //GTM begain
    const handleCartClick = () => {
    if (items && items.length > 0) {
      const getNumericId = (gid) => {
        if (!gid) return 0;
        if (typeof gid === 'number') return gid;
        const match = String(gid).match(/\d+$/);
        return match ? Number(match[0]) : 0;
      };

      const filteredItems = items.filter(
        (item) =>
          item.variantId !== INSURANCE_VARIANT_ID &&
          item.variantId !== GOLDCOIN_VARIANT_ID
      );

      pushViewCart({
        currency: "INR",
        cart_total: Number(totalAmount),
        grand_total: Number(totalAmount),
        discount_amount: 0,
        total_quantity: totalQuantity,
        total_product: items.length,
        coupon_code: "",
        items: items.map((item, idx) => {
          const getNumericId = (gid) => {
            if (!gid) return 0;
            if (typeof gid === 'number') return gid;
            const match = String(gid).match(/\d+$/);
            return match ? Number(match[0]) : 0;
          };

          const prodId = String(getNumericId(item.productId || item.shopifyId || item.id));
          const lowerTitle = (item.title || "").toLowerCase();
          
          let category = item.type || item.productType || "";
          if (!category) {
            if (lowerTitle.includes("ring")) category = "Rings";
            else if (lowerTitle.includes("earring") || lowerTitle.includes("bali")) category = "Earrings";
            else if (lowerTitle.includes("pendant")) category = "Pendants";
            else if (lowerTitle.includes("bracelet")) category = "Bracelets";
            else if (item.variantId === GOLDCOIN_VARIANT_ID) category = "Gold Coin";
            else if (item.variantId === INSURANCE_VARIANT_ID) category = "Insurance";
          }
          
          return {
            id: prodId,
            sku: item.sku || "",
            variant_id: String(getNumericId(item.variantId)),
            product_name: item.title,
            product_type: category,
            category: "Lucira Jewelry",
            sub_category: item.sub_category || category,
            price: Number(item.comparePrice || item.price || 0),
            offer_price: Number(item.price || 0),
            quantity: item.quantity,
            thumbnail_image: item.image,
            index_position: idx + 1
          };
        })
      });
    }
    };
  //GTM end


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
      //gtm
        pushLogout({
          id: user?.id || "",
          mobile: user?.mobile || "",
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          email: user?.email || ""
        });
      //gtm
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
    <div className="bg-white relative">
      <div className="container-main grid grid-cols-[1fr_2fr_1fr] items-center py-4">

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
        <div className="flex items-center justify-end lg:gap-3 xl:gap-6 text-sm">

           <Link href="/pages/store-locator" className="hidden lg:flex items-center justify-center gap-[6px] cursor-pointer transition-colors hover:text-primary text-[14px] leading-[130%] tracking-normal font-normal text-black">
            <Store size={18} />
            <span>Find a Store</span>
          </Link>

          {user ? (
            <div className="relative group flex items-center">
              <Link href="/admin">
                <Avatar className="h-9 w-9 cursor-pointer border border-gray-100 shadow-sm">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="bg-gray-50 text-gray-600 font-bold text-xs">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Link>

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
            <UserIcon 
              size={19} 
              className="cursor-pointer" 
              onClick={() => {
                const path = window.location.pathname;
                if (path !== "/login" && path !== "/register") {
                  setOpen(true);
                }
              }} 
            />
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
            <button 
              type="button" 
              onClick={() => {
                const path = window.location.pathname;
                if (path !== "/login" && path !== "/register") {
                  setOpen(true);
                }
              }} 
              className="relative group p-1"
            >
              <Heart size={19} className={`cursor-pointer ${wishlistItems.length > 0 ? "text-rose-500" : "text-zinc-900"}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </button>
          )}
            <Link 
              href="/checkout/cart" 
              className="relative group p-1"
              onClick={handleCartClick}
            >
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
