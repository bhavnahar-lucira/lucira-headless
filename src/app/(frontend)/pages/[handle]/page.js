import { getPageByHandle, getPageByHandleStorefront } from "@/lib/pages";
import { notFound } from "next/navigation";
import ContactSection from "@/components/common/ContactSection";

export default async function page({params}) {
    const {handle} = await params

    if (handle === 'contact-us') {
        return <ContactSection />;
    }

    let page = await getPageByHandle(handle);

    // Fallback to direct Shopify Storefront API if not found in DB
    if (!page) {
        page = await getPageByHandleStorefront(handle);
    }

    if(!page) return notFound()

    if (handle === 'exclusive-promotions-page') {
        return (
            <div className="w-full bg-white min-h-screen">
                <section className="w-full py-16 md:py-24 bg-[#FEF5F1]">
                    <div className="container-main text-center space-y-4">
                        <h1 className="main-title font-extrabold font-abhaya text-4xl md:text-6xl tracking-tight text-zinc-900 leading-tight">
                            {page.title}
                        </h1>
                        <p className="max-w-3xl mx-auto text-gray-600 text-base md:text-lg font-figtree leading-relaxed uppercase tracking-widest">
                            Offers T&C
                        </p>
                    </div>
                </section>

                <section className="container-main py-16 md:py-24">
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
                {page.body? (
                    <div className="footer-pages" dangerouslySetInnerHTML={{__html: page.body}} />
                ) : (
                    <p>No Content Available</p>
                )}
            </div>
        </>
    )
}