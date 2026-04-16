import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId");

  if (!variantId) {
    return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");

    // Search for the variant in the products collection
    const product = await db.collection("products").findOne(
      { "variants.id": variantId },
      { projection: { "variants.$": 1 } }
    );

    if (!product || !product.variants || product.variants.length === 0) {
      // Return a mock price breakup if variant not found, to keep things working
      return NextResponse.json({
        price: 0,
        price_breakup: {
          price: [
            { label: "14K Gold", value: "₹0" },
            { label: "Making Charges", value: "₹0" },
            { label: "GST (3%)", value: "₹0" }
          ],
          savings: [],
          total_savings: "₹0",
          grand_total: "₹0"
        }
      });
    }

    const variant = product.variants[0];
    const price = Number(variant.price);
    const comparePrice = variant.compare_price ? Number(variant.compare_price) : price;
    const savingsAmount = comparePrice - price;

    // Construct a dynamic price breakup if one doesn't exist
    const defaultBreakup = {
      price: [
        { label: "14K Gold", value: `₹${formatPrice(price * 0.6)}` },
        { label: "Diamond/Stone", value: `₹${formatPrice(price * 0.3)}` },
        { label: "Making Charges", value: `₹${formatPrice(price * 0.07)}` },
        { label: "GST (3%)", value: `₹${formatPrice(price * 0.03)}` }
      ],
      savings: savingsAmount > 0 ? [
        { label: "Limited Time Offer", value: `₹${formatPrice(savingsAmount)}` }
      ] : [],
      total_savings: `₹${formatPrice(savingsAmount)}`,
      grand_total: `₹${formatPrice(price)}`,
      comparison: {
        carat: variant.metafields?.diamonds?.[0]?.weight ? `${variant.metafields.diamonds[0].weight} CT` : "0.50 CT",
        clarity: { lucira: "VVS", mined: "SI" },
        color: { lucira: "EF", mined: "IJ" },
        price: { lucira: `₹${formatPrice(price)}`, mined: `₹${formatPrice(price * 3.5)}` },
        savings: `₹${formatPrice(price * 2.5)}`
      }
    };

    return NextResponse.json({
      price: variant.price,
      price_breakup: variant.price_breakup || defaultBreakup
    });
  } catch (error) {
    console.error("Failed to fetch variant pricing", error);
    return NextResponse.json({ error: "Failed to fetch variant pricing" }, { status: 500 });
  }
}

function formatPrice(num) {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
}
