"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white rounded-[3rem] border border-zinc-100">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">My Orders</h2>
          <p className="text-zinc-500 font-medium">View your order history and track active deliveries.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white border border-zinc-100 rounded-xl text-xs font-black text-zinc-400">
            {orders.length} TOTAL ORDERS
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isDelivered = order.status === "Delivered";
          const isInTransit = order.status === "In Transit";
          
          return (
            <div key={order.id} className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="size-32 bg-zinc-50 rounded-3xl overflow-hidden shrink-0 border border-zinc-100 relative group">
                  <Image src={order.image} alt={order.product} width={128} height={128} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 space-y-4 w-full text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                    <span className="text-xs font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full">#{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isDelivered ? "text-emerald-600 bg-emerald-50" : 
                      isInTransit ? "text-blue-600 bg-blue-50" : "text-orange-600 bg-orange-50"
                    }`}>
                      {isDelivered ? <CheckCircle2 size={12} /> : isInTransit ? <Truck size={12} /> : <Clock size={12} />}
                      {order.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-zinc-900 leading-tight">{order.product}</h4>
                    <p className="text-sm text-zinc-500 font-medium mt-1">Ordered on {order.date}</p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Price Paid</p>
                      <p className="text-lg font-black text-zinc-900">{order.amount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                  <button className="w-full md:px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-colors shadow-xl shadow-primary/20">
                    Track Order
                  </button>
                  <button className="w-full md:px-8 py-3.5 bg-white border-2 border-zinc-100 text-zinc-900 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-50 hover:border-zinc-200 transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="py-20 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-zinc-100">
            <div className="size-20 bg-zinc-50 text-zinc-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900">No orders yet</h3>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto">Once you make your first purchase, it will appear here for you to track and manage.</p>
            </div>
            <Link href="/collections/all" className="inline-block px-10 py-4 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 relative overflow-hidden shadow-sm">
        <div className="absolute -right-20 -bottom-20 size-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
              <ShoppingBag size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900">Looking for something else?</h3>
              <p className="text-zinc-500 font-medium max-w-md mt-2">Explore our latest collections and find the perfect piece to add to your exquisite collection.</p>
            </div>
          </div>
          <Link href="/collections/all" className="px-10 py-5 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:scale-105 transition-transform shadow-2xl shadow-primary/20 whitespace-nowrap">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
