import { RotateCcw, Calendar, BadgeCheck, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function CheckoutFooter() {
  const trustBadges = [
    {
      icon: <RotateCcw size={20} className="text-blue-600" />,
      text: "15 Day Exchange",
      subtext: "On Online Orders",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Calendar size={20} className="text-pink-600" />,
      text: "100% Certified",
      bgColor: "bg-pink-50",
    },
    {
      icon: <BadgeCheck size={20} className="text-green-600" />,
      text: "Lifetime Exchange",
      bgColor: "bg-green-50",
    },
    {
      icon: <RefreshCw size={20} className="text-yellow-600" />,
      text: "One Year Warranty",
      bgColor: "bg-yellow-50",
    },
  ];

  const paymentIcons = [
    { name: "VISA", src: "/images/icons/visa.svg" },
    { name: "MASTERCARD", src: "/images/icons/mastercard.svg" },
    { name: "RUPAY", src: "/images/icons/rupay.svg" },
    { name: "UPI", src: "/images/icons/upi.svg" },
    { name: "COD", src: "/images/icons/cod.png" }, // Generic COD icon
  ];

  return (
    <footer className="mt-auto border-t bg-[#F9F9FB] py-8 mb-[80px] lg:mb-0">
      <div className="container-main flex flex-col xl:flex-row items-center justify-between gap-8">
        
        {/* Left: Trust Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 md:gap-12">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badge.bgColor}`}>
                {badge.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#443360] uppercase tracking-tight font-figtree leading-tight">
                  {badge.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Payment Icons */}
        <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300 flex-wrap justify-center">
          {paymentIcons.map((icon) => (
            <Image 
              key={icon.name} 
              src={icon.src} 
              alt={icon.name} 
              height={20}
              width={40}
              className="h-5 w-auto object-contain"
            />
          ))}
        </div>

      </div>
    </footer>
  );
}
