"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LazyImage from "../common/LazyImage";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function JoinLuciraCommunity() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className="w-full bg-[#FEF5F1] overflow-hidden mt-12 md:mt-20">
      <div className="max-w-480 mx-auto grid md:grid-cols-2 items-stretch">
        
        {/* Mobile: Top Content | Desktop: Left Side (Images) */}
        {!isMobile && (
          <div className="flex h-full min-h-[400px]">
            <div className="w-1/2 relative">
              <LazyImage
                src="/images/subscribe-2.jpg"
                alt="Community 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="w-1/2 relative">
              <LazyImage
                src="/images/subscribe-1.jpg"
                alt="Community 2"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Content Side */}
        <div className="flex flex-col justify-center py-12 px-6 md:px-16 lg:px-24">
          <div className="w-full space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black font-abhaya text-zinc-900 leading-tight">
                Join the Lucira Community Today
              </h2>
              <p className="text-sm md:text-base text-zinc-600 leading-relaxed md:max-w-[90%]">
                Get early access to jewelry drops, care tips, and exclusive offers, straight to your inbox.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <Input 
                  placeholder="Enter your email" 
                  className="h-14 bg-white/50 border-zinc-300 rounded-lg px-6 text-base placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-900"
                />
                <Button className="h-14 w-full md:w-fit px-12 bg-[#5A413F] hover:bg-[#4a3533] text-white font-bold text-sm tracking-widest uppercase rounded-lg transition-all">
                  Subscribe
                </Button>
              </div>
              <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed">
                You can unsubscribe anytime. For more details read our{" "}
                <a href="#" className="underline font-bold text-zinc-900 hover:text-black transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Bottom Images */}
        {isMobile && (
          <div className="flex h-64 w-full">
            <div className="w-1/2 relative">
              <LazyImage
                src="/images/subscribe-2.jpg"
                alt="Community 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="w-1/2 relative">
              <LazyImage
                src="/images/subscribe-1.jpg"
                alt="Community 2"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Desktop: Right Content is handled by the "Content Side" div above in the grid */}
      </div>
    </section>
  );
}
