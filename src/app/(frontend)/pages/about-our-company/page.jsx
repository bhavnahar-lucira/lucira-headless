import Image from "next/image";
import { Suspense } from "react";
import FeaturedIn from "@/components/home/FeaturedIn";
import ExploreCollectionSection from "@/components/home/homeCollection/ExploreCollectionSection";
import LuciraPromise from "@/components/common/LuciraPromise";
import FAQ from "@/components/common/FAQ";

export default function AboutPage() {
    const data = {
        aboutBlack:
        "https://www.lucirajewelry.com/cdn/shop/files/about_us_2.png?v=1760097369&width=1200",
        aboutWhite:
        "https://www.lucirajewelry.com/cdn/shop/files/about_us_3.png?v=1760097396&width=1200",
        founderImage:
        "https://www.lucirajewelry.com/cdn/shop/files/Group_1321315953_2.png?crop=center&height=700&width=560",
        signatureBlack:
        "https://www.lucirajewelry.com/cdn/shop/files/Group_1321315956_1.png",
        signatureWhite:
        "https://www.lucirajewelry.com/cdn/shop/files/Group_1321315955_2.png",
        founderName: "Rupesh Jain",
        founderRole: "Founder & CEO",
        founderQuote:
        "Jewelry runs in my blood—it's who I am. After building brands in India, I created Lucira to go beyond tradition and craft pieces that reflect elegance and meaning. For me, jewelry isn't just adornment—it's a celebration of moments, love, and legacy. Every piece we make is a promise.",
    };

    const timelineData = [
        {
        year: "APRIL 2025",
        title: "LUCIRA LAUNCH",
        description:
            "Lucira was founded with a vision to make diamond jewellery more contemporary and accessible.",
        image:
            "https://www.lucirajewelry.com/cdn/shop/files/Group_1321316005_1.png",
        },
        {
        year: "JUNE 2025",
        title: "COLLECTION LAUNCH",
        description:
            "Introduced two collections - On The Move & Hexa Collection, combining everyday comfort with bold design.",
        image:
            "https://www.lucirajewelry.com/cdn/shop/files/Group_1321316005_1.png",
        },
        {
        year: "SEPT 2025",
        title: "SEED INVESTMENT",
        description:
            "Backed by early investors who believed in our vision to reshape India’s modern jewelry landscape.",
        image:
            "https://www.lucirajewelry.com/cdn/shop/files/Group_1321316005_1.png",
        },
        {
        year: "OCT 2025",
        title: "1st STORE LAUNCH",
        description:
            "Opened the first Lucira Experience Store in Mumbai, extending our journey beyond digital.",
        image:
            "https://www.lucirajewelry.com/cdn/shop/files/Group_1321316005_1.png",
        },
    ];

    const faqData = [
        {
        question: "What values guide your company?",
        answer:
            "We operate on the principles of trust, transparency, and craftsmanship. Every piece reflects our commitment to ethical practices, high quality, and long-lasting beauty.",
        },
        {
        question: "Who designs your jewelry?",
        answer:
            "Our collections are designed by a team of creative professionals who blend traditional artistry with modern innovation to craft pieces that are both elegant and wearable.",
        },
        {
        question: "Are your diamonds and materials ethically sourced?",
        answer:
            "Yes. We work only with suppliers who follow ethical sourcing practices and comply with strict labor and environmental standards to ensure responsible production.",
        },
        {
        question: "Do you provide certificates of authenticity?",
        answer:
            "All jewelry pieces come with certification verifying their authenticity, material quality, and gemstone grading.",
        },
        {
        question: "What makes your jewelry sustainable?",
        answer:
            "Our brand is committed to minimizing environmental impact by responsibly sourcing materials, using recyclable packaging, and ensuring traceability throughout our supply chain.",
        },
        {
        question: "What is your return and exchange policy?",
        answer:
            "We offer a customer-friendly return and exchange policy within a specific period, provided the jewelry is in its original condition and accompanied by proof of purchase.",
        },
        {
        question: "Do you have a buyback or lifetime exchange option?",
        answer:
            "Yes, customers can often exchange or upgrade their jewelry through a lifetime buyback or exchange program, allowing long-term flexibility and value.",
        },
        {
        question: "How is my order shipped and insured?",
        answer:
            "Orders are securely packed, fully insured, and shipped through reliable logistics partners. Tracking information is provided to ensure safe and transparent delivery.",
        },
        {
        question: "What kind of warranty or support do you provide?",
        answer:
            "We stand behind the quality of every piece. Our after-sales support includes maintenance guidance, repair assistance, and professional jewelry care.",
        },
        {
        question: "Do you offer custom or bespoke designs?",
        answer:
            "Yes, we provide personalized jewelry design services that allow customers to co-create pieces tailored to their style and occasion.",
        },
        {
        question: "What types of jewelry do you offer?",
        answer:
            "Our collections include engagement rings, wedding bands, earrings, necklaces, and bracelets, crafted for both everyday wear and special moments.",
        },
        {
        question: "Where can I experience your jewelry in person?",
        answer:
            "Our jewelry can be explored both online and in select retail or experience stores, designed to provide personalized consultation and service.",
        },
    ];

    return (
    <>
        <section className="relative w-full overflow-hidden text-center py-16 px-5">
        <div className="max-w-[1200px] mx-auto relative">

            {/* BLACK ABOUT TEXT (BACKGROUND) */}
            <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-full flex justify-center z-0 pointer-events-none">
            <div className="relative w-[1000px] h-[160px]">
                <Image
                src={data.aboutBlack}
                alt="About Us"
                fill
                className="object-contain"
                priority
                />
            </div>
            </div>

            {/* CONTENT */}
            <div className="pt-[140px] flex flex-col items-center">

            {/* FOUNDER BLOCK */}
            <div className="relative w-[420px] flex flex-col items-center mb-10">

                {/* WHITE OVERLAY (CLIPPED) */}
                <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">

                <div className="absolute left-1/2 -translate-x-1/2 top-[-88px] w-[1000px] h-[200px]">
                    <Image
                    src={data.aboutWhite}
                    alt="About Us White"
                    fill
                    className="object-contain"
                    />
                </div>

                {/* WHITE SIGNATURE */}
                <div className="absolute bottom-[-60px] right-[-80px] w-[150px] h-[150px]">
                    <Image
                    src={data.signatureWhite}
                    alt="Signature White"
                    fill
                    className="object-contain"
                    />
                </div>
                </div>

                {/* FOUNDER IMAGE (MIDDLE LAYER) */}
                <div className="relative z-10 w-full h-[700px]">
                <Image
                    src={data.founderImage}
                    alt={data.founderName}
                    fill
                    className="object-cover rounded"
                />
                </div>

                {/* BLACK SIGNATURE (BEHIND WHITE) */}
                <div className="absolute bottom-[-60px] right-[-80px] w-[150px] h-[150px] z-0">
                <Image
                    src={data.signatureBlack}
                    alt="Signature Black"
                    fill
                    className="object-contain"
                />
                </div>

                {/* FOUNDER DETAILS */}
                <div className="absolute bottom-0 left-[-170px] text-left">
                <h3 className="text-[25px] font-medium uppercase tracking-wide text-black">
                    {data.founderName}
                </h3>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                    {data.founderRole}
                </p>
                </div>
            </div>

            {/* QUOTE */}
            <blockquote className="max-w-[800px] text-gray-600 italic text-[20px] leading-[32px] tracking-[1px] pt-10">
                {data.founderQuote}
            </blockquote>
            </div>
        </div>
        </section>
        {/* TIMELINE SECTION */}
        <section className="w-full bg-white py-16 relative overflow-hidden">
            <div className="max-w-[1300px] mx-auto relative">
                {/* <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#b8957a] -translate-y-1/2 z-0"></div> */}
                <div className="absolute top-[35%] left-0 w-full h-[2px] bg-[#b8957a] -translate-y-1/2 z-0"></div>

                {/* ITEMS */}
                <div className="flex justify-between items-center gap-8 px-5 relative z-10">
                    {timelineData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center min-w-[280px]">
                            <div className="text-[20px] tracking-wide mb-6">{item.year}</div>

                            <div className="w-[80px] h-[80px] mb-6 relative">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover rounded-full border-[3px] border-white shadow-md"
                                />
                            </div>

                            <div className="text-center max-w-[280px]">
                                <h3 className="text-[18px] font-medium uppercase mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-[16px] text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        {/* VISION & MISSION SECTION */}
        <section className="w-full py-16 bg-white">
            <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-2 gap-12">

                {/* VISION BLOCK */}
                <div className="relative flex flex-col gap-8">
                    {/* IMAGE */}
                    <div className="relative w-full h-[600px]">
                        <Image
                        src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Lucira_aug_2564003_1.png?v=1758796025"
                        alt="Our Vision"
                        fill
                        className="object-cover"
                        />
                    </div>

                    {/* TEXT CARD */}
                    <div className="absolute right-[-460px] top-[12%] z-20 max-w-[605px] bg-[#f2f2f2] px-[40px] py-[60px]">
                        <h3 className="text-[32px] font-medium uppercase tracking-wide mb-6 text-black">
                        Our Vision
                        </h3>
                        <p className="text-[16px] leading-[24px] tracking-wide text-gray-600">
                        Lucira reimagines diamonds for the modern India, a design-first fine
                        jewelry brand that turns everyday moments into timeless expressions of
                        self. Through bold experimentation in cuts, forms, and stories, we
                        craft pieces that blend contemporary design with ethical brilliance.
                        </p>
                    </div>
                </div>

                {/* MISSION BLOCK */}
                <div className="relative flex flex-col-reverse gap-8 mt-16">

                    {/* IMAGE */}
                    <div className="relative w-full h-[600px] mt-[400px]">
                        <Image
                        src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Lucira_aug_2564090.png?v=1758796097"
                        alt="Our Mission"
                        fill
                        className="object-cover"
                        />
                    </div>

                    {/* TEXT CARD */}
                    <div className="absolute left-[-460px] bottom-[10%] z-20 max-w-[605px] bg-[#f2f2f2] px-[40px] py-[60px]">
                        <h3 className="text-[32px] font-medium uppercase tracking-wide mb-6 text-black">
                        Our Mission
                        </h3>
                        <p className="text-[16px] leading-[24px] tracking-wide text-gray-600">
                        To craft high-quality, ethically sourced diamond jewelry that blends
                        modern aesthetics with lasting value. We aim to inspire confidence and
                        joy in every customer interaction, whether in-store, online, or
                        through personalized experiences while upholding trust, transparency,
                        and craftsmanship as our core values.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
            <FeaturedIn/>
        </Suspense>
        {/* TEAM SECTION */}
        <section className="w-full py-16">
            <div className="max-w-[1200px] mx-auto">
                {/* HERO CONTAINER */}
                <div className="relative w-full h-[600px] flex items-center justify-center rounded-[10px] overflow-hidden">

                    {/* BACKGROUND IMAGE */}
                    <Image
                        src="https://www.lucirajewelry.com/cdn/shop/files/WhatsApp_Image_2025-09-24_at_11.43.16_3c4dde0d_1_2_2000x.png?v=1760096833"
                        alt="Our Team"
                        fill
                        className="object-contain"
                        priority
                    />

                    {/* TEXT OVERLAY */}
                    <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-5 pb-6 text-white">

                        <p className="text-[24px] font-normal opacity-80">
                        OUR TEAM, OUR FAMILY
                        </p>

                        <p className="text-[18px] max-w-[800px] mt-2 leading-[1.4]">
                        Designers, Thinkers and Storytellers shaping a new language of luxury.
                        </p>

                    </div>
                </div>
            </div>
        </section>
        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
            <ExploreCollectionSection />
        </Suspense>
        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
            <LuciraPromise title="Lucira Promise" description="Where Authenticity meets Trust and Care that lasts a Lifetime" />
        </Suspense>
        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
            <FAQ title="FAQ'S" description="Got questions? We've got answers. Here's everything you need to know about earning, redeeming, and making the most of your rewards." faqs={faqData} />
        </Suspense>
    </>
  );
}