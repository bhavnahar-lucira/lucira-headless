import { getAllPages } from "@/lib/pages";

export async function GET() {
    const pages = await getAllPages();

    return Response.json({pages})
}