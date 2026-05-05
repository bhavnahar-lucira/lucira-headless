"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HandCoins,
  Search,
  PhoneCall,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { UserModal } from "@/components/scheme/auth/UserModal";
import SearchPopup from "@/components/scheme/header/SearchPopup";
import { useSelector } from "react-redux";
import ContactSheet  from "../bottomSheet/ContactSheet";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function MobileBottomNav() {
  const router = useRouter();
  const customer = useSelector((s) => s.customer.customer);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <footer
        className="
          fixed bottom-0 left-0 w-full
          bg-primary
          safe-bottom
          rounded-t-2xl
          shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
          z-15
        "
      >
        <nav className={`grid ${customer?.mobile ? "grid-cols-4" : "grid-cols-3"} h-16`}>
          <NavItem
            icon={<HandCoins size={20} />}
            label="Plan Details"
            onClick={() => router.push("/scheme")}
          />

          {
            customer?.mobile &&  
            <NavItem
                icon={<HandCoins size={20} />}
                label="Enrolled Scheme"
                onClick={() => router.push("/admin/schemes")}
            />            
          }

          <NavItem
            icon={<PhoneCall size={20} />}
            label="Call Us"
            onClick={() => setDrawerOpen(true)}
          />

          {customer?.mobile ? (
            <NavItem
              icon={<UserRoundCheck size={20} />}
              label={getInitials(customer.name)}
              onClick={() => router.push("/admin/schemes")}
            />
          ) : (
            <NavItem
              icon={<UserRound size={20} />}
              label="Profile"
              onClick={() => setLoginOpen(true)}
            />
          )}
        </nav>
      </footer>

      {/* MODALS */}
      <UserModal open={loginOpen} onOpenChange={setLoginOpen} />
      {isSearchOpen && (
        <SearchPopup toggleSearch={() => setIsSearchOpen(false)} />
      )}
      <ContactSheet open={drawerOpen}
        onOpenChange={setDrawerOpen}/>
    </>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="
        flex flex-col items-center justify-center
        gap-1
        text-white/80
        hover:text-white
        active:bg-white/10
        transition
        text-[11px]
        w-full h-full
      "
    >
      {icon}
      <span className="leading-none mt-1">{label}</span>
    </button>
  );
}
