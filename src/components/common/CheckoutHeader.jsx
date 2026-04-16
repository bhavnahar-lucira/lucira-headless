"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function CheckoutHeader() {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.user);

  const steps = [
    { name: "Cart", path: "/checkout/cart" },
    { name: "Delivery", path: "/checkout/shipping" },
    { name: "Payment", path: "/checkout/payment" },
  ];

  const currentStepIndex = steps.findIndex((step) => pathname === step.path);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container-main h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1">
          <Link href="/">
            <Image 
              src="/images/logo.svg" 
              alt="Lucira" 
              width={120} 
              height={50} 
              priority
            />
          </Link>
        </div>

        {/* Center: Progress Bar */}
        <div className="hidden md:flex flex-col items-center justify-center flex-[2]">
          <div className="flex items-center w-full max-w-md">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.name} className="flex-1 flex flex-col items-center">
                  {/* Step Label */}
                  <span className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-2 font-figtree transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-zinc-400"
                  }`}>
                    {step.name}
                  </span>

                  {/* Circle & Line Container */}
                  <div className="relative flex items-center justify-center w-full">
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[50%] w-full h-[1px] bg-zinc-200">
                         <div 
                          className="h-full bg-green-600 transition-all duration-500 ease-in-out" 
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    )}

                    {/* Step Circle */}
                    <div className={`w-[18px] h-[18px] rounded-full border-2 z-10 bg-white transition-colors duration-300 flex items-center justify-center ${
                      isActive || isCompleted ? "border-green-600" : "border-zinc-300"
                    }`}>
                      {(isActive || isCompleted) && (
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Security & Login */}
        <div className="flex-1 flex items-center justify-end gap-4">
          {!user && (
            <>
              <Link href="/login" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors">
                Login
              </Link>
              <span className="text-zinc-300">|</span>
            </>
          )}
          
          <div className="flex items-center gap-2 text-zinc-500">
            <Lock size={16} className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              100% Secure
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
