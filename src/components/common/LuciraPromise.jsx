import Image from "next/image"
import Link from "next/link"

export default function LuciraPromise({title, description}) {
    const promiseData = [
    {
      title: "Certified Jewelry",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Frame_1321315897_1_8a6d4b51-56c2-4dc3-8356-5b1fcd8e2c24.png",
        href: '/pages/certificate'
    },
    {
      title: "Lucira Support",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Frame_1321315898_1_4be12348-2029-4648-9fee-6553cee6bc51.png",
       href: '/pages/contact-us'
    },
    {
      title: "15 Days Money Back",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Frame_1321315899_1_e801f813-4b5f-4342-99ba-27178f97826b.png",
        href: "/pages/15-days-return"
    },
    {
      title: "100% Lifetime Exchange",
      image:
        "https://www.lucirajewelry.com/cdn/shop/files/Frame_1321315900_1_f9cd91cb-2f02-4534-8eda-51f55f42cfd3.png",
        href: "/pages/lifetime-exchange-buyback-policy"
    },
]
    return (
        <section className="bg-white py-10">
            <div className="max-w-[1000px] mx-auto px-5">
                <div className="text-center mb-4">
                    <h2 className="text-[28px] tracking-wide uppercase">
                        {title}
                    </h2>
                    <p className="text-[16px] text-gray-500 max-w-[600px] mx-auto leading-[1.5]">
                        {description}
                    </p>
                </div>

                {/* GRID */}
                <div className="flex flex-row gap-0 w-full">

                {promiseData.map((item, index) => (
                    <Link href={item.href} key={index} className="text-center rounded">

                    {/* IMAGE */}
                    <div className="relative w-[240px] h-[240px]">
                        <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover p-[60px] transition-transform duration-300 hover:scale-[1.02]"
                        />
                    </div>

                    {/* TITLE */}
                    <div className="mt-[-32px]">
                        <p className="text-[16px] font-medium text-[#1a1a1a]">
                        {item.title}
                        </p>
                    </div>

                    </Link>
                ))}

                </div>
            </div>
        </section>
    )
}