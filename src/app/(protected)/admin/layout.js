"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Gem,
  CreditCard,
  MapPin,
  TicketPercent,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";
import Header from "@/components/header/Header";
import Footer from "@/components/common/Footer";

const sidebarLinks = [
  { name: "My Overview", href: "/admin", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "My Orders", href: "/admin/orders", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Wishlist", href: "/admin/wishlist", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { name: "My Schemes", href: "/admin/schemes", icon: TicketPercent, color: "text-amber-700", bg: "bg-amber-700/10" },
  { name: "Saved Addresses", href: "/admin/addresses", icon: MapPin, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Payment Methods", href: "/admin/payments", icon: CreditCard, color: "text-violet-500", bg: "bg-violet-500/10" },
  { name: "My Profile", href: "/admin/profile", icon: User, color: "text-zinc-500", bg: "bg-zinc-500/10" },
];

export default function CustomerDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    async function fetchAvatar() {
      try {
        const res = await fetch("/api/customer/profile/avatar");
        if (res.ok) {
          const data = await res.json();
          if (data.avatar) setAvatar(data.avatar);
        }
      } catch (err) {
        console.error("Layout avatar fetch error", err);
      }
    }
    fetchAvatar();
  }, [pathname]); // Refresh on navigation just in case

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch(logout());
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const fName = user?.first_name || user?.firstName || "";
  const lName = user?.last_name || user?.lastName || "";
  const displayName = (user ? `${fName} ${lName}`.trim() : "") || user?.name || "";
  const userInitials = user ? (fName && lName ? `${fName[0]}${lName[0]}` : (user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : "LU")) : "LU";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row relative">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white border-r border-zinc-200 flex flex-col sticky top-20 lg:h-[calc(100vh-80px)] z-30">
          <nav className="flex-1 overflow-y-auto pt-10 pb-8 px-4 space-y-1.5">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-4">Account Menu</p>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                    isActive 
                      ? `bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]` 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <div className={`size-8 rounded-lg flex items-center justify-center ${isActive ? "bg-white/20 text-white" : `${link.bg} ${link.color}`}`}>
                    <Icon size={18} />
                  </div>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-zinc-100">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="p-8 flex-1 bg-[#F8FAFC]">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
