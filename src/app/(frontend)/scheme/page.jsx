"use client";
import { Suspense } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { HandCoins, Calendar, Wallet, ShieldCheck  } from 'lucide-react';
import MainBanner from "@/assets/scheme/desktop-scheme.jpg";
import MainBannerMobile from "@/assets/scheme/mobile-scheme.jpg";
import ProductCard from "@/components/scheme/productCard/ProductCard";
import { useWindowSize } from "@/hooks/useWindowSize";
import DesktpSavingCalculator from "@/components/scheme/savingCalculator/DesktpSavingCalculator";
import MobileSavingCalculator from "@/components/scheme/savingCalculator/MobileSavingCalculator";
import { Faq } from "@/components/scheme/Faq";
import HowItWorks from "@/components/scheme/HowItWorks";

export default function Page() {  
  const { width } = useWindowSize();
  if (!width) return null;
    const items = [
      {
        icon: HandCoins,
        title: "FLEXIBLE PAYMENTS",
        desc: (<>Start With Just ₹2000/Month And Save Big!</>),
        bg: "bg-[#f5e3d3]",
      },
      {
        icon: Calendar,
        title: "SMART PLANNING",
        desc:(<>Perfect For Gifts, Weddings, And Special Milestones.</>),
        bg: "bg-[#f6dfe3]",
      },
      {
        icon: Wallet,
        title: "EXTRA SAVINGS",
        desc: (<>Enjoy A 100% Discount On Your 10th Installment.</>),
        bg: "bg-[#d7edd7]",
      },
      {
        icon: ShieldCheck,
        title: "SAFE & SECURE",
        desc: (<>Guaranteed Savings With No Hidden Charges.</>),
        bg: "bg-[#dff2f7]",
      },
    ];

  return (
    <div className="w-full">
      {/* Hero Banner */}
      {
        width > 1024 ?          
      <AspectRatio ratio={1920 / 420}>
        <Image src={MainBanner} alt="Savings Scheme Banner" fill priority className="object-cover"/>
      </AspectRatio>
      :
      <AspectRatio ratio={428 / 380}>
        <Image src={MainBannerMobile} alt="Savings Scheme Banner" fill priority className="object-cover"/>
      </AspectRatio>
      }     
      <Suspense fallback={<div>Loading calculator...</div>}>
        {
          width < 1024 ? <MobileSavingCalculator /> : <DesktpSavingCalculator />
        }
      </Suspense>
      <div className="w-full bg-white md:mt-10  mb-50 md:mb-55 lg:mb-20">
        <HowItWorks />
        <section className="text-center mb-12 w-[92%] mx-auto">
          <h2 className="text-xl md:text-2xl tracking-wide font-medium mb-10 uppercase">
           why scheme from lucira
          </h2>
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`${item.bg} rounded-xl p-3 md:p-5 text-center flex flex-col items-center`}
                >
                  <Icon
                    size={42}
                    strokeWidth={1.25}
                    className="mb-6 text-[#666666]"
                  />

                  <h3 className="text-[10px] md:text-base tracking-widest mb-2 md:mb-4 text-black">
                    {item.title}
                  </h3>

                  <p className="text-[10px] md:text-sm text-gray-700 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        <section className="w-[92%] mx-auto md:mt-20  mb-50 md:mb-55 lg:mb-20 flex justify-center items-center flex-col ">
          <div className="mb-10">
             <h2 className="text-xl md:text-2xl tracking-wide font-medium uppercase text-center"> Vault of Dreams</h2>
             <p className="text-base mt-4">Frequently Asked Questions (FAQ's)</p>
          </div>
         
          <Faq/>
        </section>
      </div>
      {/* <div className="w-full bg-white mt-10 mb-50 md:mt-20 md:mb-55 lg:mb-20">
       <ProductCard/>
      </div> */}
    </div>
  );
}
