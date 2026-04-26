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
        <div className="flex flex-col justify-center py-6 px-10">
          <div className="w-full space-y-6">
            <div className="text-left mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold font-abhaya mb-2 text-black">Join the Lucira Community Today</h2>
              <p className="text-black text-base font-normal">Get early access to jewelry drops, care tips, and exclusive offers, straight to your inbox.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-row gap-3">
                <Input 
                  placeholder="Enter your email" 
                  className="h-14 bg-white/50 border-primary rounded-lg px-6 text-base placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-900"
                />
                <Button className="h-14 w-full md:w-fit px-12 bg-primary hover:bg-accent text-white font-bold text-sm tracking-widest uppercase rounded-lg transition-all">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-black">
                You can unsubscribe anytime. For more details read our{" "}
                <a href="/pages/privacy-policy" className="underline font-bold text-zinc-900 hover:text-black transition-colors">
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
