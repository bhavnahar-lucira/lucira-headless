"use client";

import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Clock, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/userSlice";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const user = useSelector(selectUser);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    points: "0",
    tier: "Member",
    nextTierPoints: "0",
    progress: 0,
    wishlistCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          fetch("/api/customer/orders"),
          fetch("/api/customer/dashboard-stats")
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const fName = user?.first_name || user?.firstName || "";
  const lName = user?.last_name || user?.lastName || "";
  const displayName = (user ? `${fName} ${lName}`.trim() : "") || user?.name || "";

  const customerStats = [
    {
      title: "Orders Placed",
      value: loading ? "..." : orders.length.toString(),
      subtitle: "Total history",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      link: "/admin/orders"
    },
    {
      title: "Wishlist Items",
      value: loading ? "..." : stats.wishlistCount.toString(),
      subtitle: "Saved for later",
      icon: Heart,
      color: "from-rose-500 to-rose-600",
      shadow: "shadow-rose-500/20",
      link: "/admin/wishlist"
    },
    {
      title: "Loyalty Points",
      value: loading ? "..." : stats.points,
      subtitle: stats.tier,
      icon: Star,
      color: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/20",
      link: "/pages/rewards"
    },
    {
      title: "Active Returns",
      value: "00",
      subtitle: "In progress",
      icon: Clock,
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      link: "/admin/orders"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">
            {displayName ? `Hello, ${displayName}` : "Account Overview"}
          </h2>
          <p className="text-zinc-500 font-medium">Manage your orders, track deliveries, and view your rewards.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {customerStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.link} className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className={`size-12 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-2xl font-black text-zinc-900">{stat.value}</h3>
                </div>
              </div>
              <p className="text-xs font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline">
                {stat.subtitle} <ChevronRight size={14} />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-zinc-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
              View all orders <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-zinc-500 font-medium">Loading orders...</div>
            ) : orders.length > 0 ? (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                  <div className="size-20 bg-zinc-50 rounded-2xl overflow-hidden shrink-0 border border-zinc-100">
                    <Image src={order.image} alt={order.product} width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">#{order.orderNumber}</span>
                      <span className={`w-fit mx-auto md:mx-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900">{order.product}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{order.date}</p>
                  </div>
                  <div className="text-right flex flex-col items-center md:items-end gap-3">
                    <p className="text-lg font-black text-zinc-900">{order.amount}</p>
                    <Link href={`/admin/orders/${order.id.split('/').pop()}`} className="px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-primary/10">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-100 p-10 text-center shadow-sm">
                <ShoppingBag size={40} className="mx-auto mb-4 text-zinc-200" />
                <p className="text-zinc-500 font-bold">No orders found yet</p>
                <Link href="/collections/all" className="text-primary text-xs font-black uppercase tracking-widest mt-2 block hover:underline">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Exclusive Benefits - Glassmorphism */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900">Your Privileges</h3>
          <div className="relative group">
            {/* Animated Background Orbs */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -left-4 -bottom-4 size-24 bg-accent/10 rounded-full blur-2xl" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <Sparkles size={10} />
                    {loading ? "..." : stats.tier}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-zinc-900 leading-tight">Lifetime Warranty<br/>Activated</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">As a {stats.tier}, all your jewelry pieces are covered by our premium protection plan.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Zap size={14} className="text-primary" />
                    {loading ? "Calculating..." : Number(stats.nextTierPoints) > 0 ? `${stats.nextTierPoints} coins to next tier` : "You've reached top tier!"}
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full shadow-sm transition-all duration-1000" style={{ width: `${stats.progress}%` }} />
                  </div>
                </div>

                <Link href="/pages/rewards" className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 block text-center">
                  View Rewards
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Free Express Shipping</p>
                <p className="text-[10px] text-zinc-500 font-medium">Valid on all future orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
