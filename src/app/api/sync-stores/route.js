import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { PINCODE_COORDINATES } from "@/utils/coordinateMapping";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE;
  const ACCESS_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  
  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const storesCollection = db.collection("stores");

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/locations.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.errors || "Failed to fetch locations");

    const locations = result.locations || [];
    let processedCount = 0;

    for (const loc of locations) {
      let pincode = loc.zip ? loc.zip.replace(/\D/g, '').slice(-6) : null;
      if (!pincode || pincode.length !== 6) {
        const addressFull = `${loc.address1} ${loc.address2} ${loc.city}`.toLowerCase();
        const pincodeMatch = addressFull.match(/\b\d{6}\b/);
        if (pincodeMatch) pincode = pincodeMatch[0];
      }

      let latitude = loc.latitude ? parseFloat(loc.latitude) : null;
      let longitude = loc.longitude ? parseFloat(loc.longitude) : null;

      if (!latitude && pincode && PINCODE_COORDINATES[pincode]) {
        latitude = PINCODE_COORDINATES[pincode].lat;
        longitude = PINCODE_COORDINATES[pincode].lng;
      }

      const storeData = {
        shopifyId: `gid://shopify/Location/${loc.id}`,
        name: loc.name,
        address1: loc.address1,
        address2: loc.address2,
        city: loc.city,
        zip: loc.zip,
        province: loc.province,
        provinceCode: loc.province_code,
        country: loc.country,
        countryCode: loc.country_code,
        phone: loc.phone,
        isActive: loc.active,
        pincode: pincode,
        latitude: latitude,
        longitude: longitude,
        updatedAt: new Date()
      };

      await storesCollection.updateOne(
        { shopifyId: storeData.shopifyId },
        { $set: storeData },
        { upsert: true }
      );
      processedCount++;
    }

    return NextResponse.json({ 
        success: true, 
        message: `Synced ${processedCount} stores with coordinate mapping.`, 
        count: processedCount 
    });
  } catch (error) {
    console.error("Store Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
