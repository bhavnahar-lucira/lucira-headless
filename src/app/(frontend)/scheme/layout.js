"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SchemeLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const protectedRoutes = ["/scheme/enroll", "/scheme/payment"];
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected && !isAuthenticated) {
      router.push("/scheme");
    }
  }, [pathname, isAuthenticated, router, isMounted]);

  if (!isMounted) return null;

  return (
    <>
      <div>
        {children}
      </div>
    </>
  );
}
