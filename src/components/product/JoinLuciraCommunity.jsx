"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LazyImage from "../common/LazyImage";
import { setCookie } from "@/lib/utils";
import { toast } from "react-toastify";

export function JoinLuciraCommunity() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) return toast.error("Enter email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address");

    console.log("Subscribing email:", email);
    setCookie("subscriberEmail", email, 30);
    
    // Construct WhatsApp message
    const message = `Hi Lucira, I'd like to join the community. My email is: ${email}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=+919004435760&text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Subscribed successfully!");
  };

  return (
    <section className="w-full bg-[#F9F9F9] overflow-hidden mt-15">
      <div className="max-w-480 mx-auto pe-17 min-[1440px]:pe-17 grid md:grid-cols-2 gap-16 items-stretch">
        {/* Left Side: Images */}
        <div className="flex h-80">
          <div className="w-1/2 relative bg-[#E5E5E5]">
            <LazyImage
              src="/images/subscribe-2.jpg"
              alt="Community 1"
              fill
              className="object-cover opacity-80"
            />
          </div>
          <div className="w-1/2 relative bg-[#F0F0F0]">
            <LazyImage
              src="/images/subscribe-1.jpg"
              alt="Community 2"
              fill
              className="object-cover opacity-80"
            />
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center py-10">
          <div className="w-full space-y-6">
            <div className="space-y-1">
              <h2 className="text-28px font-bold text-black">
                Join the Lucira Community Today
              </h2>
              <p className="text-base leading-relaxed w-[70%]">
                Get early access to jewelry drops, care tips, and exclusive offers, straight to your inbox.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative grow">
                  <Input 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-13 bg-white border-[#A1A1A1] rounded-md px-6 text-base placeholder:text-[#8E8E8E] focus-visible:ring-1 focus-visible:ring-black"
                  />
                </div>

                <Button 
                  onClick={handleSubscribe}
                  className="h-13 px-10 text-lg tracking-wide hover:cursor-pointer"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm">
                You can unsubscribe anytime. For more details read our{" "}
                <a href="#" className="underline hover:text-black transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
