"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to login page instead of homepage
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
