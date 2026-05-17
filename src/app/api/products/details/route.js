import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    const PRODUCT_QUERY = `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          tags
          productMetafields: metafields(identifiers: [
            {namespace: "ornaverse", key: "weight"},
            {namespace: "ornaverse", key: "quality"},
            {namespace: "ornaverse", key: "carat_range"},
            {namespace: "ornaverse", key: "lead_time"},
            {namespace: "ornaverse", key: "components"}
          ]) {
            key
            value
          }
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price { amount }
                compareAtPrice { amount }
                selectedOptions { name value }
                image { url }
                metal_weight: metafield(namespace: "ornaverse", key: "metal_weight") { value }
                gross_weight: metafield(namespace: "ornaverse", key: "gross_weight") { value }
                top_width: metafield(namespace: "ornaverse", key: "top_width") { value }
                top_height: metafield(namespace: "ornaverse", key: "top_height") { value }
                diamonds_meta: metafield(namespace: "ornaverse", key: "diamonds") { value }
                gemstones_meta: metafield(namespace: "ornaverse", key: "gemstones") { value }
                components: metafield(namespace: "ornaverse", key: "components") { value }
              }
            }
          }
          seo { title description }
        }
      }
    `;

    const data = await shopifyStorefrontFetch(PRODUCT_QUERY, { handle }, { cache: 'no-store' });
    const productData = data?.product;

    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Clean up product metafields into a flat object
    const productMetafields = {};
    productData.productMetafields?.forEach(m => {
      if (m) productMetafields[m.key] = m.value;
    });

    // Clean up variants and their metafields
    const variants = productData.variants?.edges?.map(edge => {
      const v = edge.node;
      const comps = v.components?.value ? JSON.parse(v.components.value) : null;
      
      const metalComp = comps?.components?.find(c => c.item_group_name === "Gold");
      const diamondComps = comps?.components?.filter(c => c.item_group_name === "Diamond") || [];
      const gemstoneComps = comps?.components?.filter(c => c.item_group_name === "Gemstone" || c.item_group_name === "Color Stone") || [];

      // Map color and karat from components if possible
      let metal_purity = metalComp?.karat_code ? `${metalComp.karat_code}K` : null;
      let metal_color = metalComp?.stone_color_code && metalComp.stone_color_code !== "NA" ? metalComp.stone_color_code : null;
      
      // Fallback for metal color from variant title
      if (!metal_color) {
        if (v.title.toLowerCase().includes('rose')) metal_color = 'Rose Gold';
        else if (v.title.toLowerCase().includes('white')) metal_color = 'White Gold';
        else if (v.title.toLowerCase().includes('yellow')) metal_color = 'Yellow Gold';
        else if (v.title.toLowerCase().includes('platinum')) metal_color = 'Platinum';
      }

      const diamonds = diamondComps.map(d => ({
        quality: d.quality_code && d.quality_code !== "NA" ? d.quality_code : (d.purity || "VVS-VS, EF"),
        shape: d.shape_code,
        pieces: d.pieces,
        weight: d.weight
      }));

      const gemstones = gemstoneComps.map(g => ({
        color: g.stone_color_code,
        shape: g.shape_code,
        pieces: g.pieces,
        weight: g.weight
      }));

      return {
        id: v.id,
        shopifyId: v.id,
        title: v.title,
        sku: v.sku,
        inStock: v.availableForSale,
        price: parseFloat(v.price?.amount || 0),
        compare_price: parseFloat(v.compareAtPrice?.amount || 0),
        image: v.image?.url,
        size: v.selectedOptions?.find(o => o.name.toLowerCase() === 'size')?.value,
        color: v.selectedOptions?.find(o => o.name.toLowerCase() === 'color')?.value || v.title,
        metafields: {
          metal_purity: metal_purity,
          metal_color: metal_color,
          metal_weight: v.metal_weight?.value || metalComp?.weight,
          gross_weight: v.gross_weight?.value,
          top_width: v.top_width?.value,
          top_height: v.top_height?.value,
          diamonds: diamonds.length > 0 ? diamonds : (v.diamonds_meta?.value ? JSON.parse(v.diamonds_meta.value) : []),
          gemstones: gemstones.length > 0 ? gemstones : (v.gemstones_meta?.value ? JSON.parse(v.gemstones_meta.value) : []),
          components: v.components?.value
        }
      };
    }) || [];

    const product = {
      ...productData,
      shopifyId: productData.id,
      productMetafields,
      variants,
      images: productData.images?.edges?.map(e => ({ url: e.node.url, altText: e.node.altText })) || []
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product Details Error:", error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}
