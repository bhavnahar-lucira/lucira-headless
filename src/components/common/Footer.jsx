"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-white mt-15">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          
          {/* LEFT LOGO */}
          <div className="text-center">
            <div className="mb-4 opacity-75">
              <Image
                src="/images/footer-logo.svg"
                alt="Lucira"
                width={90}
                height={165}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-white/80">
              Love, Joy & Comfort.
            </p>
          </div>

          {/* RIGHT LINKS */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            
            {/* SHOP ALL */}
            <div>
              <h4 className="mb-4 text-lg font-extrabold font-abhaya">Shop All</h4>
              <ul className="space-y-2.5 text-sm text-white font-figtree">
                <li><Link href="#">Best Sellers</Link></li>
                <li><Link href="#">Engagement Rings</Link></li>
                <li><Link href="#">Wedding Rings</Link></li>
                <li><Link href="#">Earrings</Link></li>
                <li><Link href="#">Bracelets</Link></li>
                <li><Link href="#">Necklaces</Link></li>
                <li><Link href="#">Nosepins</Link></li>
                <li><Link href="#">Men's Rings</Link></li>
                <li><Link href="#">Men's Studs</Link></li>
                <li><Link href="#">Men's Bracelets</Link></li>
                <li><Link href="#">Collections</Link></li>
                <li><Link href="#">Gifting</Link></li>
                <li><Link href="#">9KT Collection</Link></li>
              </ul>
            </div>

            {/* JEWELRY GUIDE */}
            <div>
              <h4 className="mb-4 text-lg font-extrabold font-abhaya">
                Lucira Jewelry Guide
              </h4>
              <ul className="space-y-2.5 text-sm text-white font-figtree">
                <li><Link href="#">Diamond Education</Link></li>
                <li><Link href="#">Metal Education</Link></li>
                <li><Link href="#">Size Guide</Link></li>
                <li><Link href="#">How To Wear</Link></li>
                <li><Link href="#">Jewelry Care Tips</Link></li>
                <li><Link href="#">LGD vs Mined</Link></li>
                <li><Link href="#">Product Passport</Link></li>
                <li><Link href="#">Diamond Shapes</Link></li>
              </ul>
            </div>

            {/* ABOUT */}
            <div>
              <h4 className="mb-4 text-lg font-extrabold font-abhaya">About Lucira</h4>
              <ul className="space-y-2.5 text-sm text-white font-figtree">
                <li><Link href="#">About Our Company</Link></li>
                <li><Link href="#">Purpose & Value</Link></li>
                <li><Link href="#">Blogs</Link></li>
                <li><Link href="#">Rewards</Link></li>
                <li><Link href="#">Featured In</Link></li>
                <li><Link href="#">Sitemap</Link></li>
                <li><Link href="#">Craftsmanship</Link></li>
                <li><Link href="#">Modern Slavery Policy</Link></li>
                <li><Link href="#">Supplier Code of Conduct</Link></li>
              </ul>
            </div>

            {/* HELP */}
            <div>
              <h4 className="mb-4 text-lg font-extrabold font-abhaya">Help</h4>
              <ul className="space-y-2.5 text-sm text-white font-figtree">
                <li><Link href="#">Contact Us</Link></li>
                <li><Link href="#">FAQ's</Link></li>
                <li><Link href="#">Reviews</Link></li>
                <li><Link href="#">15-Days Return</Link></li>
                <li><Link href="#">Cancel & Refund</Link></li>
                <li><Link href="#">Lifetime Exchange & Buyback</Link></li>
                <li><Link href="#">Old Gold Exchange</Link></li>
                <li><Link href="#">Shipping Policy</Link></li>
                <li><Link href="#">Privacy Policy</Link></li>
                <li><Link href="#">Offers T&C</Link></li>
                <li><Link href="#">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h4 className="mb-4 text-lg font-extrabold font-abhaya">Contact Us</h4>

              <div className="space-y-2.5 text-sm text-white font-figtree">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>care@lucirajewelry.com</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>+91 9004436052</span>
                </div>
              </div>

              <div className="mt-15">
                <h5 className="mb-3 text-lg font-extrabold font-abhaya">
                  Experience Lucira
                </h5>
                <ul className="space-y-2.5 text-sm text-white font-figtree">
                  <li><Link href="#">Careers</Link></li>
                  <li><Link href="#">Franchise</Link></li>
                  <li><Link href="#">Bespoke</Link></li>
                  <li><Link href="#">Packaging</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
       {/* SOCIAL */}
        <div className="mb-6.5 flex items-center justify-center gap-6 border-t border-white/20 pt-6">
          <p className="text-lg font-extraboldfont-abhaya">Follow Us</p>

          <div className="flex items-center gap-4">
            <Facebook size={18} />
            <Instagram size={18} />
            <Youtube size={18} />
            <Linkedin size={18} />
          </div>
        </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/20 py-4 text-sm">
        <div className="container-main flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-white text-sm">
            ©{new Date().getFullYear()} LuciraJewelry.com. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 text-white text-base">
            <Link href="#">Privacy policy</Link>
            <span>|</span>
            <Link href="#">Terms of service</Link>
            <span>|</span>
            <Link href="#">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}