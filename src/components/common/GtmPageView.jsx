"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { pushPageType, pushCustomerData, pushMarketingData } from "@/lib/gtm";

// Helper to determine the page type
const getPageType = (pathname) => {
  if (pathname === "/") return "Homepage";
  if (pathname.startsWith("/collections")) return "ListingPage";
  if (pathname.startsWith("/products")) return "ProductPage";
  if (pathname === "/checkout/cart") return "CartPage";
  if (pathname === "/checkout/shipping") return "CheckoutAddressPage";
  if (pathname === "/checkout/payment") return "CheckoutPaymentPage";
  if (pathname.startsWith("/search")) return "SearchPage";
  if (pathname.startsWith("/pages/")) return "FooterContentPage";
  if (pathname.startsWith("/admin")) return "MyAccountPage";
  if (pathname === "/login") return "LoginPage";
  return "Other";
};

export default function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    // 1. Push Page Type
    const pageType = getPageType(pathname);
    pushPageType(pageType);

    // 2. Push Marketing Data if UTM params exist
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmTerm = searchParams.get("utm_term");
    const utmContent = searchParams.get("utm_content");
    
    // Only push if there's at least one UTM param, or we can just push empty string fallbacks
    // Usually, we only push if they visited with UTMs, or we can read from session if persisted
    if (utmSource || utmMedium || utmCampaign) {
      pushMarketingData({
        utm_source: utmSource || "",
        utm_medium: utmMedium || "",
        utm_campaign: utmCampaign || "",
        utm_term: utmTerm || "",
        utm_content: utmContent || "",
        referrer: document.referrer || ""
      });
    }

    // 3. Push Customer Data if authenticated
    if (isAuthenticated && user) {
      pushCustomerData({
        name: user.name || "",
        mobile: user.mobile || "",
        email: user.email || "",
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        // Other fields omitted as requested: gender, dob, doa, billing, shipping address
      });
    }

  }, [pathname, searchParams, user, isAuthenticated]);

  return null; // This component does not render anything
}
