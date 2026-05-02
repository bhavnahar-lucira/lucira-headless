"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { AuthDialog } from "./AuthDialog";
import { selectIsAuthenticated } from "@/redux/features/user/userSlice";

export function AutoAuthPopup() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    // 15 seconds delay
    const SHOW_DELAY = 15000;

    // Exclude account pages and specific paths from user's snippet
    if (
      pathname?.startsWith("/account") || 
      pathname === "/login" || 
      pathname === "/register" ||
      pathname === "/account/login" ||
      pathname === "/account/register" ||
      /\/[a-z-]+-silver-rate-today\/?$/.test(pathname || "")
    ) {
      return;
    }

    // Check if already seen in session
    const hasSeenPopup = sessionStorage.getItem("lucira_login_popup_seen") === "true";
    if (hasSeenPopup) return;

    // Check if authenticated
    if (isAuthenticated) return;

    const timer = setTimeout(() => {
      // Re-check conditions inside timeout
      const manuallyOpened = sessionStorage.getItem("lucira_login_manually_opened") === "true";
      if (manuallyOpened) return;
      
      // If user is already logged in (Redux state might have updated)
      if (isAuthenticated) return;

      setOpen(true);
      sessionStorage.setItem("lucira_login_popup_seen", "true");
    }, SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [pathname, isAuthenticated]);

  // When manually opened, we should mark it so auto-popup doesn't trigger
  // This is usually handled by the manual buttons setting 'lucira_login_manually_opened'
  // But we can also listen to the open state here if it was opened via this component
  
  return (
    <AuthDialog 
      open={open} 
      onOpenChange={(val) => {
        setOpen(val);
        if (val) {
          sessionStorage.setItem("lucira_login_popup_seen", "true");
        }
      }} 
      initialStep="login"
      forceShowWheel={true}
      overrideHeading="Register to Win a Reward"
      overrideSubtext="Try Your Luck! Win a Diamond Pendant"
    />
  );
}
