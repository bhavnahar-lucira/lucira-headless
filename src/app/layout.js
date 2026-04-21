import { Figtree, Abhaya_Libre, Lobster, Yellowtail, Satisfy, ABeeZee } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import ReduxProvider from "@/redux/provider";
import QueryProvider from "@/providers/QueryProvider";
import BackToTop from "@/components/common/BackToTop";
import ToastProvider from "@/components/common/ToastProvider";
import Script from "next/script";
import GtmPageView from "@/components/common/GtmPageView";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800","900"],
  variable: "--font-figtree",
  display: "swap",
});

const abhaya = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["400","500","600","700","800"],
  variable: "--font-abhaya",
  display: "swap",
});

const lobster = Lobster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lobster",
  display: "swap",
});

const yellowtail = Yellowtail({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-yellowtail",
  display: "swap",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-satisfy",
  display: "swap",
});

const abeezee = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-abeezee",
  display: "swap",
});

export const metadata = {
  title: "India's Best Lab Grown Diamond Jewellery Brand - Lucira Jewelry",
  description: "Shop premium diamond jewellery online in India at Lucira Jewelry. Discover elegant lab grown diamond designs, certified quality, modern craftsmanship, and timeless styles crafted for every occasion. Shop now.",
};

export default function RootLayout({ children }) {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
      <head>
        {isProd && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MKZBJB8M');`}
          </Script>
        )}
      </head>
      <body className={`${figtree.variable} ${abhaya.variable} ${lobster.variable} ${yellowtail.variable} ${satisfy.variable} ${abeezee.variable} font-sans antialiased`}>
        {isProd && (
          <noscript>
            <iframe 
              src="https://www.googletagmanager.com/ns.html?id=GTM-MKZBJB8M"
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <ReduxProvider>
          <QueryProvider> 
            {isProd && (
              <Suspense fallback={null}>
                <GtmPageView />
              </Suspense>
            )}
            {children}
            <BackToTop />
          </QueryProvider>
        </ReduxProvider>
        <ToastProvider />
      </body>
    </html>
  );
}