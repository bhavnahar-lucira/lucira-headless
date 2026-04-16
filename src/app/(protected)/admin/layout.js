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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";

const sidebarLinks = [
  { name: "My Overview", href: "/admin", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "My Orders", href: "/admin/orders", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Wishlist", href: "/admin/wishlist", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
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
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-20 flex items-center px-8 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Gem size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-zinc-900 leading-none">Lucira</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Exquisite Jewelry</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
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
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl p-4 mb-6 border border-primary/5">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">Loyalty Tier</p>
            <p className="text-sm font-black text-zinc-900">Gold Member</p>
            <div className="h-1.5 w-full bg-zinc-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full w-[75%] bg-primary rounded-full" />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">250 points to Diamond tier</p>
          </div>
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
      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40 flex items-center justify-between px-8">
          <div>
            <h2 className="text-sm font-bold text-zinc-400">Welcome back,</h2>
            <p className="text-lg font-black text-zinc-900 leading-none">{displayName || "User"}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <Input 
                placeholder="Find an order..." 
                className="w-full pl-10 bg-zinc-50 border-transparent focus-visible:ring-primary/20 h-10 rounded-xl text-sm"
              />
            </div>
            <button className="relative text-zinc-500 hover:text-zinc-900 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 size-4 bg-primary text-[10px] font-bold text-white rounded-full border-2 border-white flex items-center justify-center">2</span>
            </button>
            <div className="h-8 w-px bg-zinc-200" />
            <Link href="/admin/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform overflow-hidden relative">
                {avatar ? (
                  <Image src={avatar} alt="User Avatar" fill className="object-cover" />
                ) : (
                  userInitials
                )}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-8 flex-1 bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
}
