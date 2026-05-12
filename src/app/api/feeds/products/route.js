import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const productsCollection = db.collection("products");

    // Fetch all active and published products
    const products = await productsCollection
      .find({ status: "ACTIVE", isPublished: true })
      .project({
        title: 1,
        handle: 1,
        descriptionHtml: 1,
        type: 1,
        vendor: 1,
        price: 1,
        compareAtPrice: 1,
        "images.url": 1,
        collectionHandles: 1,
        updatedAt: 1,
      })
      .toArray();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.lucirajewelry.com";

    // Generate XML content
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Lucira Jewelry Product Feed</title>
    <link>${baseUrl}</link>
    <description>Dynamic product feed from Lucira Jewelry database</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    products.forEach((product) => {
      const link = `${baseUrl}/products/${product.handle}`;
      const imageLink = product.images?.[0]?.url || "";
      const description = product.descriptionHtml 
        ? product.descriptionHtml.replace(/<[^>]*>?/gm, "").substring(0, 5000) 
        : "";

      xml += `
    <item>
      <g:id>${product.handle}</g:id>
      <g:title><![CDATA[${product.title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${product.price} INR</g:price>
      <g:brand>${product.vendor || "Lucira"}</g:brand>
      <g:google_product_category>Jewelry &gt; Rings</g:google_product_category>
      <g:product_type><![CDATA[${product.type || ""}]]></g:product_type>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("XML Feed Error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${error.message}</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      }
    );
  }
}
