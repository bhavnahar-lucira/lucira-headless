import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";

async function getCustomerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("customerAccessToken")?.value || "";
}

async function getCustomerId(customerAccessToken) {
  const data = await shopifyStorefrontFetch(`
    query($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
      }
    }
  `, { customerAccessToken });
  return data?.customer?.id;
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

    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Save locally to public/uploads/avatars
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name) || ".jpg";
    const cleanCustomerId = customerId.split("/").pop(); // Get numeric ID if it's GID
    const filename = `avatar-${cleanCustomerId}-${Date.now()}${ext}`;
    const publicPath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
    const relativeUrl = `/uploads/avatars/${filename}`;

    // Ensure directory exists
    await fs.mkdir(path.dirname(publicPath), { recursive: true });
    
    // Write file
    await fs.writeFile(publicPath, buffer);

    // 2. Save path to MongoDB
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("customer_profiles");

    await collection.updateOne(
      { customerId: customerId },
      { 
        $set: { 
          avatarUrl: relativeUrl,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ url: relativeUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
    const db = client.db("next_local_db");
    const collection = db.collection("customer_profiles");

    const profile = await collection.findOne({ customerId: customerId });

    return NextResponse.json({ avatar: profile?.avatarUrl || null });
  } catch (error) {
    console.error("Avatar get error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
