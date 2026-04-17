"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Phone, Bell, ChevronRight, Save, Camera, ShoppingBag, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { logout } from "@/redux/features/user/userSlice";

export default function MyProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState("/images/signature.png"); // Fallback
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Fetch Profile Data & Avatar
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        // Fetch Shopify basic info
        const res = await fetch("/api/customer/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.customer) {
            setFormData({
              firstName: data.customer.firstName || "",
              lastName: data.customer.lastName || "",
              email: data.customer.email || "",
              phone: data.customer.phone || ""
            });
          }
        } else if (res.status === 401 || res.status === 404) {
          // Session expired or customer not found
          dispatch(logout());
          router.push("/login");
          return;
        }

        // Fetch Avatar from MongoDB/Local
        const avRes = await fetch("/api/customer/profile/avatar");
        if (avRes.ok) {
          const avData = await avRes.json();
          if (avData.avatar) setProfileImage(avData.avatar);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [dispatch, router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Update failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append("avatar", file);
      
      const res = await fetch("/api/customer/profile/avatar", {
        method: "POST",
        body: data
      });

      if (res.ok) {
        const result = await res.json();
        setProfileImage(result.url);
        toast.success("Profile image updated");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile image");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white rounded-[3rem] border border-zinc-100">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">My Profile</h2>
          <p className="text-zinc-500 font-medium">Update your personal details and account preferences.</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <User size={24} />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-zinc-900" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-zinc-900" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Input 
                    value={formData.email} 
                    disabled
                    className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 font-bold text-zinc-400 pl-12 cursor-not-allowed" 
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-zinc-900 pl-12" 
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Member Rewards */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Member Rewards & Perks</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl border border-zinc-50 bg-zinc-50/30 space-y-3">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Available Voucher</p>
                <h4 className="text-lg font-black text-zinc-900 leading-tight">₹2,000 OFF</h4>
                <p className="text-xs text-zinc-400 font-medium">Valid on orders above ₹20,000</p>
                <button className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1 pt-2">
                  Copy Code: GOLD20 <ChevronRight size={12} />
                </button>
              </div>

              <div className="p-6 rounded-3xl border border-zinc-50 bg-zinc-50/30 space-y-3">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Next Gift</p>
                <h4 className="text-lg font-black text-zinc-900 leading-tight">Jewelry Box</h4>
                <p className="text-xs text-zinc-400 font-medium">Unlocked at 1,500 points</p>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full w-[83%] bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Avatar Card */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 text-center space-y-6 shadow-sm">
            <div className="relative size-32 mx-auto">
              <div className="size-32 rounded-[2.5rem] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden relative">
                {profileImage ? (
                  <Image src={profileImage} alt="Profile" fill className="object-cover" />
                ) : (
                  <span className="text-4xl font-black text-zinc-200">{formData.firstName?.[0]}{formData.lastName?.[0]}</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <label className="absolute -right-2 -bottom-2 size-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h4 className="text-xl font-black text-zinc-900">{formData.firstName} {formData.lastName}</h4>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Gold Member Since 2024</p>
            </div>
            <div className="pt-6 border-t border-zinc-50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-zinc-300 uppercase mb-1">Orders</p>
                <p className="text-lg font-black text-zinc-900">12</p>
              </div>
              <div className="border-l border-zinc-50">
                <p className="text-[10px] font-black text-zinc-300 uppercase mb-1">Points</p>
                <p className="text-lg font-black text-zinc-900">1,250</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900">Communication</h3>
            <div className="space-y-4">
              {[
                { label: "Email Notifications", active: true },
                { label: "SMS Alerts", active: true },
                { label: "WhatsApp Updates", active: false },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-600">{pref.label}</span>
                  <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${pref.active ? 'bg-primary' : 'bg-zinc-200'}`}>
                    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${pref.active ? 'left-5' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
