"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="flex flex-col md:flex-row items-stretch bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-[1000px] mx-auto h-auto md:h-[550px]">
        <div 
          className="hidden md:block w-[50%] bg-center bg-cover bg-no-repeat" 
          style={{ backgroundImage: "url('https://www.lucirajewelry.com/cdn/shop/files/Jan-Popup-Desktop-New_2.jpg?v=1769844544')" }}
        />
        <div className="w-full md:w-[50%] p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <img src="/images/logo.svg" width="120" height="49" alt="lucira jewelry logo" className="mx-auto" />
          </div>
          
          <h2 className="text-xl font-bold text-center uppercase mb-1">Welcome to Lucira</h2>
          <p className="text-sm text-gray-500 text-center mb-8 tracking-wide">Welcome To The Jewelry World Of Lucira!</p>

          <LoginForm />

          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-8 uppercase tracking-widest">
            <span>100% Secured & Spam Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
