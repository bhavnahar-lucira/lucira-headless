"use client";

import { useEffect } from "react";
import { pushPromoClick } from "@/lib/gtm";

export default function GlobalGtmListener() {
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Look for the closest element with data-gtm-promo 
      // This allows tracking ANY element across the site without wiring up specific onClick handlers
      const promoEl = event.target.closest('[data-gtm-promo]');
      
      if (promoEl) {
        pushPromoClick({
          promo_id: promoEl.getAttribute('data-gtm-promo-id') || 'N/A',
          promo_name: promoEl.getAttribute('data-gtm-promo') || 'N/A',
          creative_name: promoEl.getAttribute('data-gtm-creative') || 'Click Event',
          promo_position: promoEl.getAttribute('data-gtm-position') || 'N/A',
          location_id: promoEl.getAttribute('data-gtm-location') || 'N/A'
        });
      }
    };

    // Attach listener to document to catch all bubbled click events
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return null;
}
