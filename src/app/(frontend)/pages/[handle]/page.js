import { getPageByHandle } from "@/lib/pages";
import { notFound } from "next/navigation";
import FooterPageContent from "@/components/FooterPageContent";

export default async function Page({ params }) {
    const { handle } = await params;

    const page = await getPageByHandle(handle);

    if (!page) return notFound();

    const hasBody =
        typeof page.body === "string" && page.body.trim() !== "";

    const isAccordionPage = hasBody && page.body.includes("data-toggle");

    if (hasBody) {
        return (
            <div className="container mx-auto py-7">
                {isAccordionPage ? (
                    <FooterPageContent html={page.body} />
                ) : (
                    <div
                        className="footer-pages"
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: page.body }}
                    />
                )}
            </div>
        );
    }
    
    return notFound();
}