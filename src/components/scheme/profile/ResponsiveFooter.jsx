"use client";

import Footer from "@/components/scheme/footer/Footer";
import useWindowSize from "@/hooks/useWindowSize";
import useIsMounted from "@/hooks/useIsMounted";
import ProfileFooter from "./profileFooter/ProfileFooter";

export default function ResponsiveFooter() {
  const { width } = useWindowSize();
  const mounted = useIsMounted();

  if (!mounted || !width) return null;

  // ✅ Desktop
  if (width >= 1024) {
    return <Footer />;
  }

  // ✅ Mobile
  return <ProfileFooter />;
}
