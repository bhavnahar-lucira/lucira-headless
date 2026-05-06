"use client";

import { useState } from "react";
import Image from "next/image";

export default function Page() {
  return (
    <>
      <HowItWorksSection />
      <VideoCallScheduler />
    </>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorksSection() {
  const steps = [
    {
      title: "Step 1 : Schedule a call",
      img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226_4.jpg?v=1751367485",
      desc: "Fill out a quick form and one of our experts will guide you.",
    },
    {
      title: "Step 2 : select jewelry",
      img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22227.jpg?v=1751367485",
      desc: "Tell us your style and we curate options for you.",
    },
    {
      title: "Step 3 : live video call",
      img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22228.jpg?v=1751367486",
      desc: "Explore pieces live with photos & videos.",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-semibold uppercase">
          HOW IT WORKS
        </h2>
        <p className="text-gray-600 mt-2 mb-10">
          Shopping made personal - get real-time guidance from Lucira experts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i}>
              <div className="relative w-full aspect-square mb-4">
                <Image src={s.img} alt="" fill className="object-cover rounded-md" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= VIDEO CALL SCHEDULER ================= */

function VideoCallScheduler() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const settings = {
    heading: "Schedule a Video Call",
    subheading: "Enter your details and we'll get back to you.",
    button: "Send Message",
    layout: "image-form", // change to "form-image"
    desktopImg:
      "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22227.jpg?v=1751367485",
    mobileImg:
      "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226_4.jpg?v=1751367485",
  };

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Please enter your first name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Please enter a valid email";
    if (form.phone && !/^[\d\s+\-()]{7,20}$/.test(form.phone))
      err.phone = "Please enter a valid phone";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "" });
    setErrors({});
  };

  const FormBlock = (
    <div className="w-full md:max-w-[450px]">
      {!submitted ? (
        <>
          <h2 className="text-xl font-medium uppercase mb-2">
            {settings.heading}
          </h2>
          <p className="text-gray-700 mb-6">{settings.subheading}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs uppercase font-medium">
                First Name
              </label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs uppercase font-medium">
                Email
              </label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs uppercase font-medium">
                Phone Number
              </label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            <button className="w-full bg-[#9d7c78] text-white py-3 rounded-lg mt-4">
              {settings.button}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-10">
          <svg width="80" height="80" className="mx-auto mb-4">
            <circle
              cx="40"
              cy="40"
              r="38"
              stroke="#9d7c78"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M25 40L35 50L55 30"
              stroke="#9d7c78"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h2 className="text-lg font-semibold text-[#9d7c78] mb-2">
            Thank You!
          </h2>
          <p>Your information has been submitted successfully.</p>
          <p className="text-sm text-gray-500">
            Our executive will contact you shortly.
          </p>

          <button
            onClick={resetForm}
            className="mt-6 bg-[#9d7c78] text-white px-6 py-2 rounded-lg"
          >
            Submit Another
          </button>
        </div>
      )}
    </div>
  );

  const ImageBlock = (
    <div className="w-full md:flex-1">
      {/* Mobile */}
      <div className="block md:hidden mb-6">
        <Image
          src={settings.mobileImg}
          alt="Video Call Mobile"
          width={600}
          height={600}
          className="w-full"
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <Image
          src={settings.desktopImg}
          alt="Video Call Desktop"
          width={600}
          height={600}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-10">
        {settings.layout === "form-image" ? (
          <>
            {FormBlock}
            {ImageBlock}
          </>
        ) : (
          <>
            {ImageBlock}
            {FormBlock}
          </>
        )}
      </div>
    </section>
  );
}