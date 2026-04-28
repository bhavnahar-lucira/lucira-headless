"use client";

import { useEffect } from "react";

export default function TryOnButton({ product, activeVariant, className = "", id = "tryonbutton2" }) {
  const sku = (activeVariant?.sku || product?.variants?.[0]?.sku)?.replace("/", "");
  const productName = product?.title;
  const isAvailable = activeVariant ? activeVariant.inStock : product?.available;

  // ✅ Load Camweara External Button Script
  useEffect(() => {
    if (!sku) return;

    let retryCount = 0;
    const maxRetries = 10;

    const initCamweara = () => {
      const btnElement = document.getElementById(id);
      
      if (window.loadTryOnButton && btnElement) {
        // console.log(`Initializing Camweara for ${id}`);
        window.loadTryOnButton({
          psku: sku,
          page: "product",
          tryonBtnId: id, // 👈 bind to button
          regionId: "2",
          company: "luciraonline",
          buynow: {
            enable: isAvailable,
          },
          buynowCallback: "onTryOnBuynowCallback",
        });
      } else if (retryCount < maxRetries) {
        // If button not in DOM yet or script not fully ready, retry
        retryCount++;
        setTimeout(initCamweara, 500);
      }
    };

    // If script already exists, try to init
    if (document.getElementById("camweara-script")) {
      initCamweara();
      return;
    }

    const script = document.createElement("script");
    script.id = "camweara-script";
    script.src =
      "https://camweara.com/integrations/camweara_api_external_btn.js";
    script.async = true;

    script.onload = () => {
      // Small delay after script load to ensure loadTryOnButton is defined
      setTimeout(initCamweara, 100);
    };

    document.body.appendChild(script);
  }, [sku, isAvailable, id]);

  // ✅ Buy Now Callback (Next.js compatible)
  useEffect(() => {
    if (!sku) return;

    window.onTryOnBuynowCallback = async (skuReceived) => {
      if (skuReceived === sku) {
        // 👉 Replace with your real cart logic
        await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sku: skuReceived,
            quantity: 1,
          }),
        });

        //window.location.href = "/checkout/cart";
      } else {
        const res = await fetch(
          `/api/search-by-sku?sku=${encodeURIComponent(skuReceived)}`
        );
        const data = await res.json();

        if (data?.handle) {
          window.location.href = `/products/${data.handle}`;
        }
      }
    };
  }, [sku]);

  // ✅ GTM Tracking (still works)
  const pushDataLayer = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "promoClick",
      promoClick: {
        promo_id: sku,
        creative_name: "Virtual Try On",
        promo_position: "Above Media Gallery",
        promo_name: productName,
        location_id: "pdp",
      },
    });
  };

  if (!sku) return null;

  return (
    <button
      id={id} // 👈 IMPORTANT (must match config)
      onClick={pushDataLayer} // 👈 tracking only (Camweara handles actual click)
      className={className || `
        flex items-center gap-2
        bg-[#EDEDED]
        text-black
        px-4 py-2
        rounded-full
        text-[14px]
        font-medium
        hover:bg-[#E0E0E0]
        transition
        cursor-pointer
      `}
    >
      {/* Eye Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>

      <span>Virtual try on</span>
    </button>
  );
}