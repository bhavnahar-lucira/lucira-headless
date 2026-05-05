"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    HandCoins,
    PhoneCall,
    UserRoundCheck,
    House 
} from "lucide-react";
import { useSelector } from "react-redux";
import ContactSheet from "@/components/scheme/bottomSheet/ContactSheet";

const getInitials = (name = "") =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

export default function ProfileFooter() {       
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const customer = useSelector((s) => s.customer.customer);

    return (
        <>
            <footer
                className="
          fixed bottom-0 left-0 w-full
          bg-primary
          safe-bottom
          rounded-t-2xl
          shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
        "
            >
                <nav className="grid grid-cols-4 h-16">

                    <NavItem
                        icon={<House size={20} />}
                        label="Home"
                        onClick={() => router.push("/scheme")}
                       // onClick={() => handleLogout()}
                    />                   
                    <NavItem
                        icon={<HandCoins size={20} />}
                        label="Enrolled Scheme"
                        onClick={() => router.push("/admin/schemes")}
                    />
                    <NavItem
                        icon={<PhoneCall size={20} />}
                        label="Call Us"
                        onClick={() => setDrawerOpen(true)}
                    />
                    <NavItem
                        icon={<UserRoundCheck size={20} />}
                        label={getInitials(customer?.name)}
                        onClick={() => router.push("/admin/schemes")}
                    />
                </nav>
            </footer>
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
