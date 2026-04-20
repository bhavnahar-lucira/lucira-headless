"use client";
import { useState } from "react";
import Image from "next/image";

const images = [
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2176.jpg?v=1764398076&width=800",
    alt: "Lucira gallery 1",
  },
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2185_2.jpg?v=1765200019&width=800",
    alt: "Lucira gallery 2",
  },
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2427_1.jpg?v=1765198765&width=800",
    alt: "Lucira gallery 3",
  },
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2424_2_cb7dad77-df08-4d26-8ab5-9bfcfc99556f.jpg?v=1765200337&width=800",
    alt: "Lucira gallery 4",
  },
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2253_2_1.jpg?v=1765200316&width=800",
    alt: "Lucira gallery 5",
  },
  {
    src: "https://www.lucirajewelry.com/cdn/shop/files/DSC_2447_2_27ff37cf-7502-4e89-b110-2043ae6f7269.jpg?v=1765199990&width=800",
    alt: "Lucira gallery 6",
  },
];

const galleryPositions = [
  "bottom-[62%] left-[10%] w-[48%] h-[38%]",
  "top-[18%] left-[59%] w-[13%] h-[20%]",
  "top-0 left-[73%] w-[28%] h-[60%]",
  "top-[39.5%] left-[19%] w-[24%] h-[28%]",
  "top-[39.5%] left-[44%] w-[28%] h-[62%]",
  "bottom-[3%] left-[73%] w-[31%] h-[35%]",
];

export default function FranchiseHero() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "formOpen",
      formName: "Franchise Registration Form",
      formType: "google_form",
      timestamp: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="
          grid grid-cols-1 gap-[50px] px-5 pt-0
          md:grid-cols-[400px_1fr] md:gap-10 md:px-[30px] md:pt-[60px]
          lg:grid-cols-[450px_1fr] lg:gap-[60px] lg:px-[50px] lg:pt-[60px] lg:pb-[60px]
          max-w-[1400px] mx-auto items-center min-h-[500px]
        "
      >
        {/* Left Content */}
        <div className="md:pr-5">
          <h1
            className="
              text-[18px] sm:text-[30px] lg:text-[32px]
              font-medium tracking-[3px] uppercase text-[#2c2c2c]
              leading-[1.3] mb-4 mt-[30px] md:mt-0 md:mb-[25px]
            "
          >
            LUCIRA&apos;S FRANCHISE
          </h1>
          <p className="text-[13px] md:text-[14px] leading-[1.9] text-[#666] mb-[35px]">
            Build your future with a brand that stands for elegance, quality,
            and care. Join our growing network of franchise partners and bring
            the Lucira experience to your community. We provide full support,
            training, and a proven business model to help you succeed from day
            one.
          </p>
          <button
            onClick={handleOpen}
            className="
              inline-block px-[35px] py-[14px] md:px-[45px] md:py-[16px]
              bg-[#a68380] text-white uppercase tracking-[1.5px]
              text-[12px] md:text-[13px] font-medium rounded-[8px]
              border-none cursor-pointer
              transition-all duration-300
              hover:bg-[#956f6c] hover:-translate-y-0.5
            "
          >
            REGISTER NOW
          </button>
        </div>

        {/* Right Gallery */}
        <div className="relative h-[275px] sm:h-[400px] lg:h-[500px]">
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute overflow-hidden bg-[#f5f5f5] shadow-sm ${galleryPositions[i]}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Overlay / Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-[12px] w-full max-w-[650px] max-h-[90vh] relative shadow-2xl overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="
                absolute top-[10px] right-[14px] z-10
                w-[32px] h-[32px] rounded-full bg-white border border-[#eee]
                text-[22px] text-[#666] flex items-center justify-center
                cursor-pointer hover:text-black transition-colors leading-none
              "
            >
              &times;
            </button>

            {/* Modal Title */}
            <h3
              className="
                text-[14px] sm:text-[18px] font-medium tracking-[1.5px]
                uppercase text-[#2c2c2c] text-center
                px-[30px] py-[22px] bg-[#f8f8f8] border-b border-[#e0e0e0]
              "
            >
              REGISTRATION FORM
            </h3>

            {/* Google Form iframe */}
            <div className="flex-1 overflow-hidden min-h-[500px]">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScNWHT4WkZTuS8DCCQUOvM7MeUrdOrwqKxxcYfsEJUlapR5CQ/viewform?usp=sharing&ouid=113968896276132378000"
                className="w-full h-full border-none"
                loading="lazy"
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}