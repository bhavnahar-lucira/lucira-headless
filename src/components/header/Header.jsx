"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import Navbar from "./Navbar";

const TOP_HEIGHT = 40;
const HEADER_HEIGHT = 88;

export default function Header() {
  const [hideTop, setHideTop] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setHideTop(y > 120);
  });

  return (
    <>
      {/* Placeholder to prevent layout jump */}
      <div style={{ height: TOP_HEIGHT + HEADER_HEIGHT + 56 }} />

      <header className="fixed top-0 left-0 w-full z-100 bg-white border-b">

        {/* Announcement Bar */}
        <motion.div
          animate={{
            height: hideTop ? 0 : TOP_HEIGHT,
            opacity: hideTop ? 0 : 1,
          }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <TopBar />
        </motion.div>

        {/* Main Header */}
        <motion.div
          animate={{
            height: hideTop ? 0 : HEADER_HEIGHT,
            opacity: hideTop ? 0 : 1,
            visibility: hideTop ? "hidden" : "visible",
          }}
          transition={{ duration: 0.25 }}
          className="relative z-20"
        >
          <MainHeader />
        </motion.div>

        {/* Navbar always visible */}
        <div className="relative z-10">
          <Navbar hideTop={hideTop} />
        </div>

      </header>
    </>
  );
}