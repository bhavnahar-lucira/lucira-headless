"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "faq_item_fk8RVR",
    question: "What is a Lab Grown Diamond?",
    answer: "<p>Lab Grown Diamonds are Real Diamonds, identical to natural ones in chemical, physical, and optical properties, with only one key difference: their origin. While Natural Diamonds form deep within the Earth over billions of years, Lab Grown Diamonds are created in controlled environments using advanced technology. They offer the same brilliance and durability including the same hardness and resistance to scratches or damage at up to 85% less cost.</p>"
  },
  {
    id: "faq_item_hJTL6Q",
    question: "How long does delivery take?",
    answer: "<p>All orders are typically shipped within 8–10 business days, while customized products take up to 15 working days. Tracking details are shared with you the moment your order is dispatched.</p>"
  },
  {
    id: "faq_item_VVFQNn",
    question: "Which manufacturing process does Lucira Jewelry use?",
    answer: "<p>We use the CVD (Chemical Vapor Deposition) method, where a tiny carbon seed grows into a diamond inside a controlled chamber, resulting in a diamond that's completely identical to a mined one, but created above ground with zero environmental disruption.</p>"
  },
  {
    id: "faq_item_ncbnNG",
    question: "How much does a 1 carat Natural Diamond cost compared to a Lab Grown Diamond?",
    answer: "<p>A 1-carat diamond with EF color and VVS1 clarity can cost between ₹10 to 13 lakhs if it's Natural, while the same quality in a Lab Grown Diamond is priced around ₹35,000 to ₹50,000. That's up to 95% more affordable with absolutely no compromise on quality, brilliance or beauty.</p>"
  },
  {
    id: "faq_item_3bCqxT",
    question: "What is your return and exchange policy?",
    answer: "<p>We offer 15-days easy returns and exchanges for unworn items with original tags and certificates. Custom or engraved jewelry are only applicable for lifetime exchange and buyback.</p>"
  },
  {
    id: "faq_item_UUYJpx",
    question: "How can I trust that your diamonds are real?",
    answer: "<p>All Lucira Jewelry diamonds are independently certified, tested, and accompanied by a grading report from IGI, SGl, GIA and BIS hallmark. You'll receive full transparency with every purchase.</p>"
  },
  {
    id: "faq_item_GU9qGy",
    question: "Can I speak to someone before buying?",
    answer: "<p>Of course. You can <strong>book a video call</strong>, chat with us online, or message us on WhatsApp. Our diamond experts are happy to guide you every step of the way.</p>"
  },
  {
    id: "faq_item_CFeAUB",
    question: "Do you offer customization or engraving?",
    answer: "<p>Yes! We love personal touches. You can engrave names, dates or messages, and even customize the diamond shape, size, setting, or band.</p>"
  },
  {
    id: "faq_item_ERB3Hp",
    question: "Do you offer lifetime exchange or buyback on jewelry?",
    answer: "<p>We offer a 100% Lifetime Exchange policy on both gold/platinum and diamond, allowing you to exchange or upgrade your jewellery anytime.</p><p>Our Lifetime Buyback option lets you sell your diamond jewellery back to us whenever you choose. For diamonds, 10% will be deducted from the Lifetime Exchange value at the time of buyback.</p><p>For complete details on our policies, please visit our official website or reach out to our customer care team.</p>"
  }
];

export default function HomeFAQSection() {
  // First item open by default
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-12 md:py-20 bg-[#FEF5F1]">
      <div className="container-main max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-abhaya text-zinc-900 mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] lg:text-[16px] text-zinc-500 font-figtree max-w-xl mx-auto">
            Everything You Need to Know About Lab Grown Diamonds
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 lg:space-y-6">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-zinc-100 shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 lg:p-6 text-left flex justify-between items-center group transition-all duration-300"
              >
                <span
                  className={`text-[15px] lg:text-[17px] font-bold font-figtree transition-colors duration-300 pr-8 ${openIndex === index ? "text-primary" : "text-zinc-800"
                    }`}
                >
                  {item.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index
                      ? "bg-primary text-white rotate-0"
                      : "bg-zinc-50 text-zinc-400"
                    }`}
                >
                  {openIndex === index ? (
                    <Minus size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <div
                  className="px-4 lg:px-6 pb-6 pt-0 text-zinc-600 leading-relaxed text-[13px] lg:text-[15px] font-figtree border-t border-zinc-50 pt-6"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .font-abhaya { font-family: var(--font-abhaya), serif; }
        .font-figtree { font-family: var(--font-figtree), sans-serif; }
      `}</style>
    </section>
  );
}
