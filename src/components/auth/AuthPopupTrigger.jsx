"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthModalOpen } from "@/redux/features/user/userSlice";

export default function AuthPopupTrigger() {
  const dispatch = useDispatch();
  const { user, isAuthModalOpen } = useSelector((state) => state.user);

  useEffect(() => {
    // 1. If user is logged in or already seen popup, do nothing
    if (user || sessionStorage.getItem("hasSeenSpinPopup")) return;

    // 2. Initialize start time if not present
    let startTimeStr = sessionStorage.getItem("spinPopupStartTime");
    if (!startTimeStr) {
      startTimeStr = Date.now().toString();
      sessionStorage.setItem("spinPopupStartTime", startTimeStr);
    }
    const startTime = parseInt(startTimeStr);

    // 3. Set up interval to check elapsed time
    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed >= 20000) {
        dispatch(setAuthModalOpen(true));
        sessionStorage.setItem("hasSeenSpinPopup", "true");
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [user, dispatch]);

  return null; // This is a headless component
}
