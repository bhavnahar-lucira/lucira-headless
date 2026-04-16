"use client";

import { useState } from "react";
import LazyImage from "../common/LazyImage";
import {
  MapPinned,
  Phone,
  CalendarDays,
  Clock3,
  Star,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stores = [
  {
    city: "Pune",
    name: "Pune Lucira Store",
    rating: 4.8,
    image: "/images/store/store.jpg",
    timings: "Monday - Sunday | 10:30 am - 10:00 pm",
    openNow: true,
    mapLink: "https://maps.google.com/?q=Pune+Lucira+Store",
    callLink: "tel:+919999999999",
    designLink: "/collections/store-designs/pune",
    appointmentLink: "/book-appointment?store=pune",
    facilities: [
      "Kids Area",
      "Design Your Ring",
      "Open Weekends",
      "Banks Nearby",
      "Parking Available",
      "Exclusive Offers",
    ],
    services: [
      { title: "Gold Exchange", icon: "/images/store/gold-exchange.svg" },
      { title: "Vault of Dreams", icon: "/images/store/vault.svg" },
      { title: "Carat Tester", icon: "/images/store/carat-tester.svg" },
      { title: "Jewelry Cleaning", icon: "/images/store/jewelry-cleaning.svg" },
    ],
    address:
      "Shop no. 3,4, Balgandharv Chowk, Sai Square, 5 & 6, Jangali Maharaj Rd, Pune, Maharashtra 411005",
  },
  {
    city: "Chembur",
    name: "Chembur Lucira Store",
    rating: 4.7,
    image: "/images/store/store.jpg",
    timings: "Monday - Sunday | 11:00 am - 9:30 pm",
    openNow: true,
    mapLink: "https://maps.google.com/?q=Chembur+Lucira+Store",
    callLink: "tel:+919888888888",
    designLink: "/collections/store-designs/chembur",
    appointmentLink: "/book-appointment?store=chembur",
    facilities: [
      "Kids Area",
      "Design Your Ring",
      "Open Weekends",
      "Banks Nearby",
    ],
    services: [
      { title: "Gold Exchange", icon: "/images/store/gold-exchange.svg" },
      { title: "Vault of Dreams", icon: "/images/store/vault.svg" },
      { title: "Carat Tester", icon: "/images/store/carat-tester.svg" },
      { title: "Jewelry Cleaning", icon: "/images/store/jewelry-cleaning.svg" },
    ],
    address:
      "Shop no. 12, Central Avenue, Chembur East, Mumbai, Maharashtra 400071",
  },
  {
    city: "Borivali",
    name: "Borivali Lucira Store",
    rating: 4.9,
    image: "/images/store/store.jpg",
    timings: "Monday - Sunday | 10:00 am - 9:00 pm",
    openNow: false,
    mapLink: "https://maps.google.com/?q=Borivali+Lucira+Store",
    callLink: "tel:+917777777777",
    designLink: "/collections/store-designs/borivali",
    appointmentLink: "/book-appointment?store=borivali",
    facilities: [
      "Parking Available",
      "Exclusive Offers",
      "Design Your Ring",
      "Open Weekends",
    ],
    services: [
      { title: "Gold Exchange", icon: "/images/store/gold-exchange.svg" },
      { title: "Vault of Dreams", icon: "/images/store/vault.svg" },
      { title: "Carat Tester", icon: "/images/store/carat-tester.svg" },
      { title: "Jewelry Cleaning", icon: "/images/store/jewelry-cleaning.svg" },
    ],
    address:
      "Shop no. 8, SV Road, Borivali West, Mumbai, Maharashtra 400092",
  },
];

function ServiceCard({ item }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-white px-3 py-4 text-center">
      {item.icon ? (
        <div className="relative mb-3 h-15 w-15">
          <LazyImage src={item.icon} alt={item.title} fill className="object-contain" />
        </div>
      ) : null}
      <p className="text-sm font-semibold text-primary">{item.title}</p>
    </div>
  );
}

export default function StoreLocatorSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStore = stores[activeIndex];

  return (
    <section className="w-full bg-[#FEF5F1] py-14 mt-15">
      <div className="container-main">
        <div className="text-left mb-4">
          <h2 className="main-title font-extrabold font-abhaya mb-2">Visit Lucira Store Near You</h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-8">
          {stores.map((store, index) => (
            <button
              key={store.city}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative pb-2 text-base transition ${
                activeIndex === index
                  ? "font-medium"
                  : "hover:cursor-pointer"
              }`}
            >
              {store.city}
              {activeIndex === index ? (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
          <div className="relative overflow-hidden rounded-sm">
            <div className="relative aspect-[4/4.3] w-full">
              <LazyImage
                src={activeStore.image}
                alt={activeStore.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-4">
              <h3 className="font-figtree text-2xl italic leading-none font-semibold text-white drop-shadow-md">
                {activeStore.name}
              </h3>

              <div className="mt-0.5 flex items-center gap-1 text-white">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#f5c518] text-[#f5c518]"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{activeStore.rating}</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-3 right-3 flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#f7efec] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-base">
                <Clock3 size={16} />
                <span className="font-medium">
                  <span className="font-semibold">Timings:</span>{" "}
                  {activeStore.timings}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#86c49b] bg-white px-3 py-1 text-base font-semibold">
                <Circle
                  size={8}
                  className={
                    activeStore.openNow
                      ? "fill-[#28a745] text-[#28a745]"
                      : "fill-[#dc2626] text-[#dc2626]"
                  }
                />
                {activeStore.openNow ? "Open Now" : "Closed"}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-6">
              <h4 className="mb-3 text-base font-semibold text-black">
                Facilities at Store:
              </h4>

              <div className="flex flex-wrap gap-3">
                {activeStore.facilities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#F7EEEA] px-4 py-2 text-base text-black"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-base font-semibold text-black">
                Services Offered at Store:
              </h4>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeStore.services.map((item) => (
                  <ServiceCard key={item.title} item={item} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-base font-semibold text-black">
                Address:
              </h4>
              <p className="max-w-120 text-base leading-7 text-black">
                {activeStore.address}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-[3px] border-[#5A413F] bg-transparent text-base font-medium"
              >
                <a
                  href={activeStore.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPinned className="mr-2 h-4 w-4" />
                  DIRECT ME
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 rounded-[3px] border-[#5A413F] bg-transparent text-base font-medium"
              >
                <a href={activeStore.callLink}>
                  <Phone className="mr-2 h-4 w-4" />
                  CALL US
                </a>
              </Button>
            </div>

            <div className="mt-3">
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-[3px] border-[#5A413F] text-base font-medium uppercase"
              >
                <a href={activeStore.designLink}>VIEW AVAILABLE DESIGNS</a>
              </Button>
            </div>

            <div className="mt-3">
              <Button
                asChild
                className="h-12 w-full rounded-[3px] text-base font-bold"
              >
                <a href={activeStore.appointmentLink}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  BOOK APPOINTMENT
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}