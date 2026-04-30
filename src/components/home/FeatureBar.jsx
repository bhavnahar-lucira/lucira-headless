"use client";

import LazyImage from "../common/LazyImage";
import { Truck, RefreshCcw, Gem, HandCoins } from "lucide-react";

const moneyBack = "/images/icons/money-back.svg";

export default function FeatureBar() {
  const features = [
    {
      icon: Truck,
      text: "Free and secure shipping",
    },
    {
      icon: Gem,
      text: "100% diamond value guarantee",
    },
    {
      icon: RefreshCcw,
      text: "Lifetime buy back or exchange",
    },
    {
      icon: HandCoins,
      text: "15-day free returns",
    },
  ];

  return (
    <div className="w-full my-7 bg-white">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 items-start">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-center md:text-left"
              >
                <div className="shrink-0 text-zinc-700">
                  {Icon && <Icon size={28} strokeWidth={1.2} />}

                  {item.image && (
                    <LazyImage
                      src={item.image}
                      alt={item.text}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  )}
                </div>

                <span className="text-sm md:text-base font-medium text-zinc-800 leading-tight md:leading-snug max-w-[140px] md:max-w-none">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
