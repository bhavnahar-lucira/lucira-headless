"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/scheme/utils";
import { User, MapPin, Users, CreditCard, LogOut } from "lucide-react";
import { clearCustomer } from "@/redux/features/scheme/customerSlice";
import { useDispatch  } from "react-redux";
const navItems = [
  { label: "Profile", href: "/dashboard/scheme", icon: User },
  { label: "Enrolled Scheme", href: "/admin/schemes", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

    const handleLogout = async () => {
      await fetch("/api/scheme/session/logout", { method: "POST" });
      dispatch(clearCustomer());
      router.push("/scheme");
    };

  return (
    <div className="p-4 space-y-2">
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
