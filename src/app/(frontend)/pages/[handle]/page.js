import { getPageByHandle, getPageByHandleStorefront } from "@/lib/pages";
import { notFound } from "next/navigation";
import ContactSection from "@/components/common/ContactSection";

export default async function page({ params }) {
  const { handle } = await params;

  if (handle === "contact-us") {
    return <ContactSection />;
  }

  let page = await getPageByHandle(handle);

  // Fallback to direct Shopify Storefront API if not found in DB
  if (!page) {
    page = await getPageByHandleStorefront(handle);
  }

  if (!page) return notFound();

  if (handle === "exclusive-promotions-page") {
    return (
      <div className="w-full bg-white min-h-screen">
        {/* Banner Section */}
        <section
          className="relative flex items-center justify-center w-full"
          style={{
            backgroundImage: `url('https://www.lucirajewelry.com/cdn/shop/files/Offer-T-_-C-Desktop.jpg?v=1754045882&width=2000')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "500px",
          }}
        >
          {/* Mobile image override via a hidden img trick */}
          <style>{`
                    @media (max-width: 749px) {
                        #promo-banner {
                            background-image: url('https://www.lucirajewelry.com/cdn/shop/files/Offer-T-_-C-Mobile.jpg?v=1754045881&width=1000') !important;
                            min-height: 400px !important;
                        }
                    }
                `}</style>

          {/* Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", opacity: 0.7 }}
          />

          {/* Content */}
          <div className="relative z-10 text-center max-w-5xl mx-auto px-8 py-8">
            <h1 className="font-figtree font-medium text-[48px] text-white tracking-tight leading-tight mb-3">
                OFFERS T&C
            </h1>
          </div>
        </section>

        {/* Body Content */}
        <section className="container-main py-10 md:py-10">
          <div
            className="footer-pages max-w-none font-figtree text-zinc-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </section>
      </div>
    );
  }

  return (
    <>
      <h1 className="hidden">{page.title}</h1>

      <div className="container mx-auto py-7 px-4">
        {page.body ? (
          <div
            className="footer-pages"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <p>No Content Available</p>
        )}
      </div>
    </>
  );
}
