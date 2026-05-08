import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { shopifyStorefrontFetch } from "@/lib/shopify";

async function getCustomerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("customerAccessToken")?.value || "";
}

async function getCustomerId(customerAccessToken) {
  const data = await shopifyStorefrontFetch(
    `query($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
      }
    }`,
    { customerAccessToken }
  );
  return data?.customer?.id;
}

export async function GET() {
  try {
    const customerAccessToken = await getCustomerAccessToken();
    if (!customerAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerId(customerAccessToken);
    if (!customerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const client = await clientPromise;
    const db = client.db();
    const wishlistCollection = db.collection("wishlist");
    const items = await wishlistCollection
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const customerAccessToken = await getCustomerAccessToken();
    if (!customerAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerId(customerAccessToken);
    if (!customerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      productId,
      variantId,
      variantTitle,
      size,
      color,
      karat,
      productHandle,
      title,
      image,
      price,
      comparePrice,
      reviews,
      hasVideo,
      hasSimilar,
    } = body;

    if (!productId || !title) {
      return NextResponse.json({ error: "Invalid wishlist item" }, { status: 400 });
    }

    const item = {
      customerId,
      productId,
      variantId: variantId || "",
      variantTitle: variantTitle || "",
      size: size || "",
      color: color || "",
      karat: karat || "",
      productHandle: productHandle || "",
      title,
      image: typeof image === "string" ? image : image?.url || "",
      price: price || "",
      comparePrice: comparePrice || "",
      reviews: reviews || null,
      hasVideo: Boolean(hasVideo),
      hasSimilar: Boolean(hasSimilar),
      updatedAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db();
    const wishlistCollection = db.collection("wishlist");

    await wishlistCollection.updateOne(
      { customerId, productId, variantId: variantId || "" },
      {
        $set: item,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const customerAccessToken = await getCustomerAccessToken();
    if (!customerAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerId(customerAccessToken);
    if (!customerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const productId = req.nextUrl.searchParams.get("productId");
    const variantId = req.nextUrl.searchParams.get("variantId") || "";

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const wishlistCollection = db.collection("wishlist");
    
    if (variantId) {
      await wishlistCollection.deleteOne({ customerId, productId, variantId });
    } else {
      // If no variantId provided, delete based on productId (caution: might delete multiple if they exist)
      // For safety, let's just delete the one with empty variantId if it exists, 
      // or all of them if that's the intended behavior.
      // The user wants them distinct, so we should probably always pass variantId.
      await wishlistCollection.deleteMany({ customerId, productId });
    }

    return NextResponse.json({ success: true, productId, variantId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
