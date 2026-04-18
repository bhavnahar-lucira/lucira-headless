export default function BespokePage() {
    return (
        <section className="relative w-full">
        <img
          src="https://www.lucirajewelry.com/cdn/shop/files/Bespoke-Desktop-Banner_2.jpg"
          alt="Banner"
          className="w-full h-[calc(100dvh-200px)] object-cover hidden md:block"
        />
        <img
          src="https://www.lucirajewelry.com/cdn/shop/files/7df9539829becce028c90cc314b6e75fad295914_1.jpg"
          alt="Banner"
          className="w-full h-[360px] object-cover md:hidden"
        />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white px-4">
          <h2 className="text-xl md:text-3xl uppercase tracking-widest">
            Bespoke Jewelry
          </h2>
          <p className="text-sm md:text-lg mt-2">
            Your story deserves nothing less than a jewel made just for you.
          </p>
        </div>
      </section>
    )
}