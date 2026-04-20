"use client";
import { useState } from "react";
import Image from "next/image";

// ─── DATA ───────────────────────────────────────────────────────────────────

const heroImages = [
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

const featureCards = [
  {
    title: "Store Location Research",
    description:
      "We'll guide you to the right strategic location and set up every key process you need.",
    icon: null,
  },
  {
    title: "Full Training Support",
    description:
      "Our team provides end-to-end training so you and your staff are ready from day one.",
    icon: null,
  },
  {
    title: "Proven Business Model",
    description:
      "Leverage a tested and refined system that delivers consistent results across all locations.",
    icon: null,
  },
  {
    title: "Marketing & Branding",
    description:
      "Benefit from our established brand identity and national marketing campaigns.",
    icon: null,
  },
];

// ─── ICONS ──────────────────────────────────────────────────────────────────

const DefaultIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M31.25 43.75V33.3333C31.25 32.7808 31.0305 32.2509 30.6398 31.8602C30.2491 31.4695 29.7192 31.25 29.1667 31.25H20.8333C20.2808 31.25 19.7509 31.4695 19.3602 31.8602C18.9695 32.2509 18.75 32.7808 18.75 33.3333V43.75"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M37.0291 21.4791C36.5948 21.0634 36.0168 20.8313 35.4156 20.8313C34.8143 20.8313 34.2363 21.0634 33.802 21.4791C32.8333 22.4031 31.546 22.9186 30.2072 22.9186C28.8685 22.9186 27.5812 22.4031 26.6124 21.4791C26.1782 21.064 25.6007 20.8323 24.9999 20.8323C24.3992 20.8323 23.8216 21.064 23.3874 21.4791C22.4186 22.4037 21.1308 22.9196 19.7916 22.9196C18.4524 22.9196 17.1646 22.4037 16.1958 21.4791C15.7615 21.0634 15.1835 20.8313 14.5822 20.8313C13.981 20.8313 13.403 21.0634 12.9687 21.4791C12.0329 22.3721 10.7984 22.8849 9.50541 22.9178C8.2124 22.9506 6.95341 22.5012 5.97349 21.657C4.99358 20.8128 4.36285 19.6341 4.20408 18.3505C4.0453 17.0668 4.36984 15.77 5.11453 14.7125L11.1333 5.99579C11.5152 5.43227 12.0293 4.97091 12.6307 4.65203C13.2322 4.33316 13.9025 4.1665 14.5833 4.16663H35.4166C36.0953 4.16637 36.7639 4.33192 37.3641 4.64889C37.9642 4.96587 38.4779 5.42466 38.8604 5.98538L44.8916 14.7187C45.6365 15.7771 45.9606 17.0749 45.8008 18.3592C45.6411 19.6435 45.0088 20.8223 44.0274 21.666C43.0459 22.5096 41.7855 22.9576 40.4918 22.9227C39.198 22.8878 37.9636 22.3724 37.0291 21.477"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.33337 22.8125V39.5833C8.33337 40.6884 8.77236 41.7482 9.55376 42.5296C10.3352 43.311 11.395 43.75 12.5 43.75H37.5C38.6051 43.75 39.6649 43.311 40.4463 42.5296C41.2277 41.7482 41.6667 40.6884 41.6667 39.5833V22.8125"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FranchisePage() {
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [brochureForm, setBrochureForm] = useState({ name: "", phone: "" });
  const [brochureErrors, setBrochureErrors] = useState({});
  const [brochureSubmitting, setBrochureSubmitting] = useState(false);
  const [brochureSuccess, setBrochureSuccess] = useState(false);

  // Hero modal handlers
  const handleHeroOpen = () => {
    setHeroModalOpen(true);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "formOpen",
      formName: "Franchise Registration Form",
      formType: "google_form",
      timestamp: new Date().toISOString(),
    });
  };
  const handleHeroClose = () => setHeroModalOpen(false);

  // Brochure modal handlers
  const handleBrochureOpen = () => {
    setBrochureSuccess(false);
    setBrochureForm({ name: "", phone: "" });
    setBrochureErrors({});
    setBrochureModalOpen(true);
  };
  const handleBrochureClose = () => setBrochureModalOpen(false);

  const validateBrochure = () => {
    const errors = {};
    if (!brochureForm.name.trim()) errors.name = "Name is required.";
    if (!brochureForm.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(brochureForm.phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }
    return errors;
  };

  const handleBrochureSubmit = (e) => {
    e.preventDefault();
    const errors = validateBrochure();
    if (Object.keys(errors).length > 0) {
      setBrochureErrors(errors);
      return;
    }
    setBrochureSubmitting(true);
    setBrochureErrors({});
    // Replace setTimeout with your actual API call
    setTimeout(() => {
      setBrochureSubmitting(false);
      setBrochureSuccess(true);
      setTimeout(() => {
        handleBrochureClose();
        setBrochureSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      <section
        className="
          grid grid-cols-1 gap-[50px] px-5 pt-0
          md:grid-cols-[400px_1fr] md:gap-10 md:px-[30px] md:pt-[60px]
          lg:grid-cols-[450px_1fr] lg:gap-[60px] lg:px-[50px] lg:pt-[80px]
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
            onClick={handleHeroOpen}
            className="
              inline-block px-[35px] py-[14px] md:px-[45px] md:py-[16px]
              bg-[#a68380] text-white uppercase tracking-[1.5px]
              text-[12px] md:text-[13px] font-medium rounded-[8px]
              border-none cursor-pointer transition-all duration-300
              hover:bg-[#956f6c] hover:-translate-y-0.5
            "
          >
            REGISTER NOW
          </button>
        </div>

        {/* Right Gallery */}
        <div className="relative h-[275px] sm:h-[400px] lg:h-[500px]">
          {heroImages.map((img, i) => (
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

      {/* ═══════════════════════════════════════════
          2. WHY FRANCHISE SECTION
      ═══════════════════════════════════════════ */}
      <section
        className="
          pt-[50px] px-5 pb-0 bg-white
          md:px-[30px] md:pt-[30px]
          lg:px-[50px] lg:pt-[50px]
          max-w-[1400px] mx-auto
        "
      >
        {/* Header */}
        <div className="text-center mb-[60px] md:mb-[25px]">
          <h2
            className="
              text-[18px] sm:text-[26px] lg:text-[24px]
              font-medium tracking-[1px] uppercase text-[#333]
              leading-[1.7] mb-0
            "
          >
            WHY LUCIRA FRANCHISE?
          </h2>
          <p
            className="
              text-[12px] md:text-[18px] leading-[1.8]
              text-[#666] max-w-[800px] mx-auto
            "
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, ut alconsequat.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          className="
            grid grid-cols-2 gap-x-3 gap-y-[45px]
            lg:grid-cols-4 lg:gap-[30px]
            mb-[25px] lg:mb-[60px]
          "
        >
          {featureCards.map((card, i) => (
            <div
              key={i}
              className="
                bg-[#f2f2f2] rounded-[8px] text-center
                px-5 pt-[35px] pb-[30px]
                h-[120px] sm:h-[150px] lg:h-[185px]
                relative
              "
            >
              {/* Icon bubble */}
              <div
                className="
                  w-[40px] h-[40px]
                  sm:w-[60px] sm:h-[60px]
                  lg:w-[75px] lg:h-[75px]
                  bg-[#a68380] rounded-full
                  flex items-center justify-center
                  absolute
                  -top-[20px] sm:-top-[30px] lg:-top-[37px]
                  left-5
                "
              >
                {card.icon ? (
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={40}
                    height={40}
                    className="brightness-0 invert w-[22px] h-[22px] sm:w-[30px] sm:h-[30px] lg:w-[40px] lg:h-[40px]"
                  />
                ) : (
                  <span className="flex items-center justify-center w-[22px] h-[22px] sm:w-[30px] sm:h-[30px] lg:w-[40px] lg:h-[40px]">
                    <DefaultIcon size={40} />
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                className="
                  text-[9px] sm:text-[10px] lg:text-[17px]
                  font-medium text-[#1a1a1a] text-left mb-1
                  mt-[10px] lg:mt-[5px]
                "
              >
                {card.title}
              </h3>

              {/* Description */}
              <p
                className="
                  text-[9px] sm:text-[10px] lg:text-[13px]
                  leading-[1.5] lg:leading-[1.6]
                  text-[#666] text-left
                "
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Download Brochure Button */}
        <div className="text-center pb-[50px]">
          <button
            onClick={handleBrochureOpen}
            className="
              inline-block px-5 py-[14px] lg:px-[40px]
              bg-[#a68380] text-white uppercase tracking-[1px]
              text-[12px] sm:text-[13px] lg:text-[16px]
              font-medium rounded-[12px] border-none cursor-pointer
              transition-colors duration-300 hover:bg-[#956e6b]
            "
          >
            DOWNLOAD BROCHURE
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. BANNER SECTION
      ═══════════════════════════════════════════ */}
      <div className="mx-5 md:mx-[20px] lg:mx-[60px] mb-[60px]">
        <div
          className="
            relative h-[485px] md:h-[500px]
            rounded-[12px] overflow-hidden
            bg-black
          "
        >
          {/* Background Image — replace src with your actual banner image */}
          <Image
            src="https://www.lucirajewelry.com/cdn/shop/files/DSC_2253_2_1.jpg?v=1765200316&width=800"
            alt="Franchise banner background"
            fill
            className="object-cover opacity-100"
            loading="lazy"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50 z-[1]" />

          {/* Content */}
          <div
            className="
              relative z-[2]
              max-w-[1200px] mx-auto px-5
              text-center
              h-full flex flex-col justify-center
              pt-[70px]
            "
          >
            {/* Heading */}
            <h1
              className="
                text-[32px] md:text-[32px] lg:text-[48px]
                font-normal text-white
                leading-[1.2] tracking-[0px]
                mb-[20px]
              "
            >
              Become Our Franchise Partner
            </h1>

            {/* Subheading */}
            <p
              className="
                text-[14px] md:text-[14px] lg:text-[16px]
                font-normal text-white
                leading-[1.6] tracking-[0px]
                max-w-[600px] mx-auto
                mb-[30px]
              "
            >
              Join our growing network of successful franchise partners and
              build your business with us.
            </p>

            {/* Button */}
            <div>
              <button
                onClick={handleHeroOpen}
                className="
                  inline-block
                  py-[12px] px-[30px] md:py-[15px] md:px-[40px]
                  text-[12px] md:text-[14px]
                  font-semibold text-white
                  bg-transparent
                  border border-white
                  rounded-[0px]
                  uppercase tracking-[1px]
                  cursor-pointer
                  transition-all duration-300
                  hover:bg-white hover:text-black hover:-translate-y-0.5
                "
              >
                APPLY NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MODAL — REGISTRATION (Hero + Banner button)
      ═══════════════════════════════════════════ */}
      {heroModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4"
          onClick={(e) => e.target === e.currentTarget && handleHeroClose()}
        >
          <div className="bg-white rounded-[12px] w-full max-w-[650px] max-h-[90vh] relative shadow-2xl overflow-hidden flex flex-col">
            <button
              onClick={handleHeroClose}
              className="
                absolute top-[10px] right-[14px] z-10
                w-[32px] h-[32px] rounded-full bg-white border border-[#eee]
                text-[22px] text-[#666] flex items-center justify-center
                cursor-pointer hover:text-black transition-colors leading-none
              "
            >
              &times;
            </button>
            <h3
              className="
                text-[14px] sm:text-[18px] font-medium tracking-[1.5px]
                uppercase text-[#2c2c2c] text-center
                px-[30px] py-[22px] bg-[#f8f8f8] border-b border-[#e0e0e0]
              "
            >
              REGISTRATION FORM
            </h3>
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

      {/* ═══════════════════════════════════════════
          MODAL — BROCHURE DOWNLOAD
      ═══════════════════════════════════════════ */}
      {brochureModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4"
          onClick={(e) =>
            e.target === e.currentTarget && handleBrochureClose()
          }
        >
          <div className="bg-white rounded-[12px] w-full max-w-[450px] relative shadow-2xl overflow-hidden">
            {/* Close */}
            <button
              onClick={handleBrochureClose}
              className="
                absolute top-[15px] right-[20px] z-10
                text-[28px] text-[#666] leading-none bg-transparent
                border-none cursor-pointer hover:text-black transition-colors
              "
            >
              &times;
            </button>

            <div className="px-[30px] py-[35px]">
              {!brochureSuccess ? (
                <>
                  <h3
                    className="
                      font-medium text-[18px] md:text-[20px]
                      tracking-[1.5px] uppercase text-[#2c2c2c]
                      text-center mb-[25px]
                    "
                  >
                    DOWNLOAD BROCHURE
                  </h3>

                  <form
                    onSubmit={handleBrochureSubmit}
                    className="flex flex-col"
                  >
                    {/* Name */}
                    <div className="relative mb-[18px]">
                      <svg
                        className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="1.8"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={brochureForm.name}
                        onChange={(e) =>
                          setBrochureForm({
                            ...brochureForm,
                            name: e.target.value,
                          })
                        }
                        className="
                          w-full py-4 pl-[50px] pr-5
                          border border-[#ddd] rounded-[8px]
                          text-[14px] tracking-[0.5px]
                          focus:outline-none focus:border-[#a68380]
                          transition-colors
                        "
                      />
                      {brochureErrors.name && (
                        <p className="text-[#e74c3c] text-[12px] mt-1">
                          {brochureErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="relative mb-[18px]">
                      <svg
                        className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="1.8"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.91-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={brochureForm.phone}
                        onChange={(e) =>
                          setBrochureForm({
                            ...brochureForm,
                            phone: e.target.value,
                          })
                        }
                        className="
                          w-full py-4 pl-[50px] pr-5
                          border border-[#ddd] rounded-[8px]
                          text-[14px] tracking-[0.5px]
                          focus:outline-none focus:border-[#a68380]
                          transition-colors
                        "
                      />
                      {brochureErrors.phone && (
                        <p className="text-[#e74c3c] text-[12px] mt-1">
                          {brochureErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={brochureSubmitting}
                      className="
                        mt-[10px] py-4
                        bg-[#a68380] text-white uppercase
                        tracking-[1.3px] text-[14px] font-medium
                        rounded-[8px] border-none cursor-pointer
                        transition-colors duration-300
                        hover:enabled:bg-[#956e6b]
                        disabled:bg-[#ccc] disabled:cursor-not-allowed disabled:opacity-60
                      "
                    >
                      {brochureSubmitting ? "Submitting..." : "DOWNLOAD BROCHURE"}
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="flex flex-col items-center text-center py-5">
                  <div className="mb-5">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="32" cy="32" r="32" fill="#e8f5e9" />
                      <path
                        d="M20 32L28 40L44 24"
                        stroke="#4caf50"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[24px] font-semibold text-[#1a1a1a] mb-[10px]">
                    Thank You!
                  </h3>
                  <p className="text-[16px] text-[#666] leading-[1.5]">
                    Your brochure is on its way. We&apos;ll be in touch shortly.
                  </p>
                  {/* Progress bar */}
                  <div className="w-full h-[4px] bg-[#e0e0e0] rounded-[2px] overflow-hidden mt-5">
                    <div className="h-full bg-[#4caf50] animate-[shrink_3s_linear_forwards]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}