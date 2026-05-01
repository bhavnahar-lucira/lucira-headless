"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  selectIsAuthenticated, 
  selectIsAuthDialogOpen,
  openAuthDialog 
} from "@/redux/features/user/userSlice";

const AUTO_OPEN_DELAY = 15000; // 15 seconds
const SUPPRESSION_TIME = 6 * 60 * 60 * 1000; // 6 hours

const STORAGE_KEYS = {
  START_TIME: "auth_popup_start_time",
  SUPPRESSED_UNTIL: "auth_popup_suppressed_until",
};

export default function AutoAuthTrigger() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthDialogOpen = useSelector(selectIsAuthDialogOpen);
  const timerRef = useRef(null);

  // Helper to get remaining time to open
  const getRemainingTime = () => {
    const startTime = localStorage.getItem(STORAGE_KEYS.START_TIME);
    if (!startTime) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.START_TIME, now.toString());
      return AUTO_OPEN_DELAY;
    }
    const elapsed = Date.now() - parseInt(startTime);
    return Math.max(0, AUTO_OPEN_DELAY - elapsed);
  };

  // Helper to check if suppressed
  const isSuppressed = () => {
    const suppressedUntil = localStorage.getItem(STORAGE_KEYS.SUPPRESSED_UNTIL);
    if (!suppressedUntil) return false;
    return Date.now() < parseInt(suppressedUntil);
  };

  // Helper to set suppression
  const suppress = () => {
    const until = Date.now() + SUPPRESSION_TIME;
    localStorage.setItem(STORAGE_KEYS.SUPPRESSED_UNTIL, until.toString());
    // Also clear start time so it restarts from scratch after suppression ends
    localStorage.removeItem(STORAGE_KEYS.START_TIME);
  };

  useEffect(() => {
    // If authenticated, we don't start any timers.
    // We also clear start time to avoid immediate popup on logout.
    if (isAuthenticated) {
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // If already suppressed, do nothing
    if (isSuppressed()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // If dialog is already open, we should ensure suppression is set
    // (This handles manual opens too)
    if (isAuthDialogOpen) {
      suppress();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start or continue the timer
    const remaining = getRemainingTime();
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (!isAuthenticated && !isSuppressed() && !isAuthDialogOpen) {
        dispatch(openAuthDialog());
        suppress();
      }
    }, remaining);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, isAuthDialogOpen, dispatch]);

  // Special case: handle logout suppression
  // We can't easily detect the "moment" of logout here without tracking previous state
  // But the logic above handles it: when isAuthenticated becomes false, 
  // we check suppression. If the user wants 6 hours AFTER logout, 
  // we need to set suppression when they logout.
  // Actually, I should probably handle the suppression in the logout action or in another effect.
  
  const prevIsAuthenticated = useRef(isAuthenticated);
  useEffect(() => {
    if (prevIsAuthenticated.current && !isAuthenticated) {
        // Just logged out
        suppress();
    }
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  return null;
}
