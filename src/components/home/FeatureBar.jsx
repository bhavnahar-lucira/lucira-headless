import LazyImage from "../common/LazyImage";
import { Truck, RefreshCcw, Gem } from "lucide-react";

const moneyBack = "/images/icons/money-back.svg";

export default function FeatureBar() {
  const features = [
    {
      icon: Truck,
      text: "Free and secure shipping",
    },
    {
      icon: RefreshCcw,
      text: "Lifetime return or exchange",
    },
    {
      icon: Gem,
      text: "100% diamond value guarantee",
    },
    {
      image: moneyBack,
      text: "15-day money back guarantee",
    },
  ];

  return (
    <div className="w-full pt-7">
      <div className="container-main">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-sm">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-center justify-center md:justify-start gap-2.5"
              >
                {Icon && <Icon size={26} strokeWidth={1.5} />}

                {item.image && (
                  <LazyImage
                    src={item.image}
                    alt={item.text}
                    width={26}
                    height={26}
                  />
                )}

                <span className="text-base font-semibold">{item.text}</span>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}