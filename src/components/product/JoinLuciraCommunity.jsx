"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function JoinLuciraCommunity() {
  return (
    <section className="w-full bg-[#F9F9F9] overflow-hidden mt-15">
      <div className="max-w-480 mx-auto pe-17 min-[1440px]:pe-17 grid md:grid-cols-2 gap-16 items-stretch">
        {/* Left Side: Images */}
        <div className="flex h-80">
          <div className="w-1/2 relative bg-[#E5E5E5]">
            <Image
              src="/images/subscribe-2.jpg"
              alt="Community 1"
              fill
              className="object-cover opacity-80"
            />
          </div>
          <div className="w-1/2 relative bg-[#F0F0F0]">
            <Image
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
                    className="h-13 bg-white border-[#A1A1A1] rounded-md px-6 text-base placeholder:text-[#8E8E8E] focus-visible:ring-1 focus-visible:ring-black"
                  />
                </div>

                <Button className="h-13 px-10 text-lg tracking-wide hover:cursor-pointer">
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
