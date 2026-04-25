"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/redux/features/user/userSlice";
import { setReferralLink, setReferralLoading, setReferralError } from "@/redux/features/user/userSlice";
import Image from "next/image";
import { toast } from "react-toastify";
import { Copy, Share2, Facebook, Linkedin, Users, Gift, CheckCircle2, XCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ReferralPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const referralLink = useSelector((state) => state.user.referralLink);
  const loadingLink = useSelector((state) => state.user.referralLoading);
  
  const [stats, setStats] = useState({
    total_referrals: 0,
    coins_earned: 0,
    coins_balance: 0,
    history: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user?.id && !referralLink) {
      fetchReferralLink();
    }
  }, [user, referralLink, dispatch]);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  async function fetchReferralLink() {
    try {
      dispatch(setReferralLoading(true));
      const response = await fetch("/api/customer/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.id })
      });
      const data = await response.json();
      if (data.referralLink) {
        dispatch(setReferralLink(data.referralLink));
      }
    } catch (error) {
      dispatch(setReferralError("Failed loading referral link"));
    } finally {
      dispatch(setReferralLoading(false));
    }
  }

  async function fetchHistory() {
    try {
      setLoadingStats(true);
      const numericId = user.id.split('/').pop();
      const endpoint = `https://refer-earn-385594025448.asia-south1.run.app?customer_id=shopify-${numericId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.status) {
        setStats({
          total_referrals: data.total_referrals || 0,
          coins_earned: data.coins_earned || 0,
          coins_balance: data.coins_balance || 0,
          history: data.history || []
        });
      }
    } catch (err) {
      console.error("Referral history fetch failed:", err);
    } finally {
      setLoadingStats(false);
    }
  }

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const shareText = `Hey! Use my referral link and get ₹1000 off on your first order: ${referralLink}`;

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Join me on Lucira and get ₹1000 off your first order!")}&url=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=800');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=800');
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Invite Friends to Lucira',
        text: shareText,
        url: referralLink
      }).catch(err => console.log('Share cancelled', err));
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">
            Refer & Earn
          </h2>
          <p className="text-zinc-500 font-medium">Invite your friends and earn rewards for every successful referral.</p>
        </div>
        <button
          onClick={shareNative}
          className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 w-fit"
        >
          <Share2 size={16} />
          Invite Friends
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative bg-[#F3E0CF] rounded-[2.5rem] p-8 min-h-[220px] flex flex-col justify-center text-left overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          <Image
            alt="They Get"
            width={300}
            height={300}
            src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/They_Get_img_2.png?v=1751354604"
            className="absolute bottom-0 right-0 h-[90%] w-auto object-contain opacity-90 transition-transform duration-500 hover:scale-105"
          />
          <p className="text-sm font-bold uppercase tracking-widest text-[#A68380] mb-2 relative z-10">
            They Get
          </p>
          <p className="text-4xl font-black text-zinc-900 relative z-10 leading-tight">
            ₹1,000 Off <br />
            <span className="text-lg font-bold text-zinc-700">
              on their 1st Order
            </span>
          </p>
        </div>
        
        <div className="relative bg-zinc-900 rounded-[2.5rem] p-8 min-h-[220px] flex flex-col justify-center text-left overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          <Image
            alt="You Get"
            width={300}
            height={300}
            src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/7d93784d-d99f-4716-8c45-779b911938f6_2.png?v=1751352893"
            className="absolute bottom-0 right-0 h-[90%] w-auto object-contain opacity-50 transition-transform duration-500 hover:scale-105"
          />
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2 relative z-10">
            You Get
          </p>
          <p className="text-4xl font-black text-white relative z-10 leading-tight">
            2,000 <br />
            <span className="text-lg font-bold text-zinc-300">
              Lucira Coins
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 lg:p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Share2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">Share Your Link</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">Your referral link is ready to share with your friends.</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-center">
          <div className="flex-1 w-full bg-zinc-50 rounded-2xl flex items-center p-2 border border-zinc-200">
            <input
              type="text"
              readOnly
              value={referralLink || (loadingLink ? "Generating link..." : "Please log in to generate link")}
              className="bg-transparent flex-1 outline-none px-4 text-zinc-700 font-medium truncate"
            />
            <button
              onClick={handleCopyLink}
              disabled={!referralLink}
              className="bg-white text-zinc-900 border border-zinc-200 shadow-sm px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-zinc-400 font-black text-sm uppercase tracking-widest">
            <span>OR</span>
          </div>

          <div className="flex shrink-0 gap-3">
            <button onClick={shareOnWhatsApp} className="size-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
            </button>
            <button onClick={shareOnFacebook} className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer group">
              <Facebook size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={shareOnTwitter} className="size-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer group">
              <Twitter size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={shareOnLinkedIn} className="size-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer group">
              <Linkedin size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 lg:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Gift size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900">Referral History</h3>
              <p className="text-sm text-zinc-500 font-medium mt-1">Track your successful referrals and earned coins.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Invites</p>
              <p className="text-xl font-black text-zinc-900">{stats.total_referrals}</p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl px-6 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Coins Earned</p>
              <p className="text-xl font-black text-primary">{stats.coins_earned}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingStats ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Loading history...</p>
            </div>
          ) : stats.history.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-zinc-100 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <th className="pb-4 pt-2 px-4">Name</th>
                  <th className="pb-4 pt-2 px-4">Date</th>
                  <th className="pb-4 pt-2 px-4">Status</th>
                  <th className="pb-4 pt-2 px-4 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-zinc-700">
                {stats.history.map((row, idx) => (
                  <tr key={idx} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-zinc-900">{row.name}</td>
                    <td className="py-4 px-4">{row.date}</td>
                    <td className="py-4 px-4">
                      {row.status === 'Earned' ? (
                        <span className="flex items-center gap-1.5 w-fit bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} /> Earned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 w-fit bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <XCircle size={14} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-primary">+{row.reward} coins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="py-16 text-center bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
                <Users className="mx-auto size-12 text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-bold mb-2">No referrals yet</p>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">Share your referral link with friends to start earning Lucira Coins.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
