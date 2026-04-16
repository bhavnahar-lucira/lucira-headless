"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function QuestionsAnswered() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What is a Lab Grown Diamond?",
      answer:
        "Lab grown diamonds are real diamonds created using advanced technology, offering the same brilliance and durability as natural diamonds.",
    },
    {
      question: "What if I order the wrong ring size?",
      answer:
        "If the ring size is incorrect, we offer complimentary resizing within fifteen days of delivery for your convenience.",
    },
    {
      question: "Do you offer a free ring sizer?",
      answer:
        "Yes, we provide a complimentary ring sizer so you can accurately measure your finger size at home.",
    },
    {
      question: "Can I get my engagement ring engraved for free?",
      answer:
        "Yes, complimentary engraving is available on selected designs, allowing you to personalize your jewellery with a special message.",
    },
    {
      question: "What is your lifetime buyback policy?",
      answer:
        "Lucira offers lifetime exchange and buyback options, ensuring long-term value and flexibility for your jewellery purchase.",
    },
    {
      question: "What is made-to-order and how long does it take to deliver?",
      answer:
        "Made-to-order jewellery is crafted specially for you and typically ships within ten to fourteen days after confirmation.",
    },
  ];

  return (
    <section className="w-full py-12 bg-gray-50 mt-15"> 

      <div className="max-w-480 mx-auto px-17 min-[1440px]:px-17 grid lg:grid-cols-[1fr_480px] gap-16">

        {/* LEFT FAQ */}

        <div>

          <h2 className="text-28px font-bold mb-6 text-black">
            Your Questions Answered
          </h2>

          <div className="w-full">

            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={index} className="border-b py-6">

                  <button
                    onClick={() =>
                      setOpenIndex(isOpen ? -1 : index)
                    }
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-semibold text-base">
                      {faq.question}
                    </span>

                    <span className="text-xl">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>

                  <AnimatePresence>

                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm leading-relaxed mt-4 max-w-130">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </div>
              );
            })}

          </div>

        </div>

        {/* RIGHT IMAGE */}

        <div className="relative w-full min-h-132 rounded-lg overflow-hidden bg-gray-200">

          <Image
            src="/images/faq.jpg"
            alt="FAQ"
            fill
            className="object-cover"
          />

        </div>

      </div>

    </section>
  );
}