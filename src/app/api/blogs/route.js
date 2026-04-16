import { shopifyStorefrontFetch } from "@/lib/shopify";
import { GET_ARTICLES } from "@/lib/queries";

export async function POST(req) {
  try {
    const { cursor } = await req.json();

    const data = await shopifyStorefrontFetch(GET_ARTICLES, {
      cursor: cursor || null,
    });

    return Response.json({
      articles: data.articles.edges,
      pageInfo: data.articles.pageInfo,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}