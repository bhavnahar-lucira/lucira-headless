import { getPageByHandle } from "@/lib/pages";
import { notFound } from "next/navigation";

export default async function page({params}) {
    const {handle} = await params
    
    const page = await getPageByHandle(handle);

    if(!page) return notFound()

    return (
        <>
            <h1 className="hidden">{page.title}</h1>

            <div className="container mx-auto py-7">
                {page.body? (
                    <div className="footer-pages" dangerouslySetInnerHTML={{__html: page.body}} />
                ) : (
                    <p>No Content Available</p>
                )}
            </div>
        </>
    )
}