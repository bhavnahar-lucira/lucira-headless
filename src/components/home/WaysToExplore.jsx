"use client";

import React, { useState } from "react";
import LazyImage from "../common/LazyImage";
import { Button } from "@/components/ui/button";
import VideoCallPopup from "./VideoCallPopup";
import TryAtHomePopup from "./TryAtHomePopup";
import BookAppointmentPopup from "./BookAppointmentPopup";

const WAYS = [
  {
    title: "Virtual Shop",
    desc: "Shop live over video call view designs up close, compare pieces, and get expert guidance.",
    buttonText: "SCHEDULE VIDEO CALL",
    image: "/images/explore/1.jpg",
  },
  {
    title: "Try At Home",
    desc: "Select your favorite pieces & try them at home before you decide, see the fit, finish in your own space.",
    buttonText: "BOOK HOME TRIAL",
    image: "/images/explore/2.jpg",
  },
  {
    title: "Visit Our Store",
    desc: "Explore and try your favorite designs in person, with expert guidance from our in-store team.",
    buttonText: "BOOK APPOINTMENT",
    image: "/images/explore/3.jpg",
  }
];

export default function WaysToExplore() { 
  const [isVideoCallPopupOpen, setIsVideoCallPopupOpen] = useState(false);
  const [isTryAtHomePopupOpen, setIsTryAtHomePopupOpen] = useState(false);
  const [isBookAppointmentPopupOpen, setIsBookAppointmentPopupOpen] = useState(false);

  const handleButtonClick = (buttonText) => {
    if (buttonText === "SCHEDULE VIDEO CALL") {
      setIsVideoCallPopupOpen(true);
    } else if (buttonText === "BOOK HOME TRIAL") {
      setIsTryAtHomePopupOpen(true);
    } else if (buttonText === "BOOK APPOINTMENT") {
      setIsBookAppointmentPopupOpen(true);
    }
  };

  return (
    <section className="w-full mt-16 bg-[#FEF5F1] py-16">
      <div className="container-main">
        <div className="text-center mb-10">
          <h2 className="main-title font-extrabold font-abhaya mb-3">More Ways To Explore</h2>
          <p className="text-gray-600 text-base md:text-lg">Experience Lucira your way, online or at our showrooms.</p>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {WAYS.map((way, index) => (
              <div key={index} className="flex flex-col h-full bg-white rounded-sm overflow-hidden group p-5 md:p-4 lg:p-5 shadow-sm">
                <div className="relative aspect-[395/295] overflow-hidden rounded-sm mb-5">
                  <LazyImage 
                    src={way.image} 
                    alt={way.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col items-start gap-4 flex-grow">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{way.title}</h3>
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-4">
                    {way.desc}
                  </p>
                  <div className="mt-auto w-full">
                    <Button 
                      variant="outline" 
                      onClick={() => handleButtonClick(way.buttonText)}
                      className="h-12 px-8 text-xs font-bold tracking-widest uppercase transition-colors hover:cursor-pointer"
                    >
                      {way.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Call Popup */}
      <VideoCallPopup 
        isOpen={isVideoCallPopupOpen} 
        onClose={() => setIsVideoCallPopupOpen(false)} 
      />

      {/* Try At Home Popup */}
      <TryAtHomePopup 
        isOpen={isTryAtHomePopupOpen}
        onClose={() => setIsTryAtHomePopupOpen(false)}
      />

      {/* Book Appointment Popup */}
      <BookAppointmentPopup
        isOpen={isBookAppointmentPopupOpen}
        onClose={() => setIsBookAppointmentPopupOpen(false)}
      />
    </section>
  );
}
