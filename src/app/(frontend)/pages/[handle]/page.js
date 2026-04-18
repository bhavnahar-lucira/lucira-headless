import { getPageByHandle } from "@/lib/pages";
import { notFound } from "next/navigation";

export default async function page({params}) {
    const {handle} = await params
    
    const page = await getPageByHandle(handle);    

    if(!page) return notFound()

    if(page.body) {
        return (
            <div className="container mx-auto py-7">
                <div className="footer-pages" dangerouslySetInnerHTML={{__html: page.body}} />
            </div>
        )
    }

    try {
        const CustomPage = (await import(`../_custom/${handle}.js`)).default;
        return (
            <div className="w-full mx-auto py-7">
                <CustomPage />
            </div>
        )
    } catch (error) {
        console.log("No custom page found for:", handle);

        return notFound()
    }
}