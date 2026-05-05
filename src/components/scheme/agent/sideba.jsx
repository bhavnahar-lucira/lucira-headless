"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/scheme/utils";
import {CreditCard, LogOut, UserRoundPlus  } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/scheme/logo.svg";
import { useDispatch } from "react-redux";
import { logoutAgent } from "@/redux/features/scheme/agentAuthSlice";
import { agentPersistor } from "@/redux/schemeStore";
const navItems = [
  { label: "Enrolled Scheme", href: "/scheme/admin/scheme", icon: CreditCard },
  { label: "Create Enrolment", href: "/scheme/admin/scheme/create", icon: UserRoundPlus },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await fetch("/api/scheme/agent-auth/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch(logoutAgent());

      // 🔥 VERY IMPORTANT
      await agentPersistor.purge();   // clears persisted redux safely

      localStorage.removeItem("persist:agent");

      router.replace("/scheme/admin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  

  return (
    <div className="p-4 space-y-4 w-full">
      <Link href="/" className="block mb-30 border-b pb-5">
        <Image src={Logo.src} alt="lucira" className="ms-0" width={150} height={50} priority />
      </Link>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
      <div
       onClick={handleLogout}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-muted hover:cursor-pointer"
        >
        <LogOut  size={18} />
            Logout
        </div>
    </div>
  );
}
