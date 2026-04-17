import Image from "next/image";

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

  return (
    <>
        <section className="relative overflow-hidden text-center py-16 px-5">
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
        <section className="bg-white py-16 relative overflow-hidden">
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
        <section className="py-16 bg-white">
            <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-2 gap-12">

                {/* VISION BLOCK */}
                <div className="relative flex flex-col gap-8">
                    {/* IMAGE */}
                    <div className="relative w-full h-[500px]">
                        <Image
                        src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Lucira_aug_2564003_1.png?v=1758796025"
                        alt="Our Vision"
                        fill
                        className="object-contain"
                        />
                    </div>

                    {/* TEXT CARD */}
                    <div className="absolute right-[-460px] top-[14%] z-20 max-w-[605px] bg-[#f2f2f2] px-[40px] py-[60px]">
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
                    <div className="relative w-full h-[500px] mt-[400px]">
                        <Image
                        src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Lucira_aug_2564090.png?v=1758796097"
                        alt="Our Mission"
                        fill
                        className="object-contain"
                        />
                    </div>

                    {/* TEXT CARD */}
                    <div className="absolute left-[-460px] bottom-[-70px] z-20 max-w-[605px] bg-[#f2f2f2] px-[40px] py-[60px]">
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
    </>
  );
}