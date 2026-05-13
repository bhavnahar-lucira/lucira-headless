import { NextResponse } from "next/server";
import { shopifyAdminRestFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    const query = search ? {
      $or: [
        { path: { $regex: search, $options: "i" } },
        { target: { $regex: search, $options: "i" } }
      ]
    } : {};

    const redirects = await collection.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      success: true,
      redirects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Fetch redirects error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, target, bulk } = body;

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    if (bulk && Array.isArray(bulk)) {
      // Bulk import from CSV data
      const results = [];
      const errors = [];

      for (const item of bulk) {
        try {
          // Check if redirect already exists in Shopify to avoid "path has already been taken" error
          let shopifyRedirect;
          const existingRes = await shopifyAdminRestFetch("redirects.json", { path: item.path });
          const existingRedirects = existingRes.data.redirects || [];
          const existing = existingRedirects.find(r => r.path === item.path);

          if (existing) {
            // Update existing in Shopify
            const updateRes = await shopifyAdminRestFetch(`redirects/${existing.id}.json`, {}, {
              method: "PUT",
              body: {
                redirect: {
                  id: existing.id,
                  target: item.target
                }
              }
            });
            shopifyRedirect = updateRes.data.redirect;
          } else {
            // Create in Shopify
            const res = await shopifyAdminRestFetch("redirects.json", {}, {
              method: "POST",
              body: {
                redirect: {
                  path: item.path,
                  target: item.target
                }
              }
            });
            shopifyRedirect = res.data.redirect;
          }

          await collection.updateOne(
            { path: shopifyRedirect.path },
            { 
              $set: {
                shopifyId: shopifyRedirect.id,
                path: shopifyRedirect.path,
                target: shopifyRedirect.target,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          results.push(shopifyRedirect);
        } catch (err) {
          errors.push({ path: item.path, error: err.message });
        }
      }

      return NextResponse.json({
        success: true,
        imported: results.length,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    if (!path || !target) {
      return NextResponse.json(
        { success: false, error: "Path and target are required" },
        { status: 400 }
      );
    }

    // Check if redirect already exists in Shopify to avoid "path has already been taken" error
    let shopifyRedirect;
    try {
      const existingRes = await shopifyAdminRestFetch("redirects.json", { path });
      const existingRedirects = existingRes.data.redirects || [];
      const existing = existingRedirects.find(r => r.path === path);

      if (existing) {
        // Update existing in Shopify
        const updateRes = await shopifyAdminRestFetch(`redirects/${existing.id}.json`, {}, {
          method: "PUT",
          body: {
            redirect: {
              id: existing.id,
              target
            }
          }
        });
        shopifyRedirect = updateRes.data.redirect;
      } else {
        // Create in Shopify
        const res = await shopifyAdminRestFetch("redirects.json", {}, {
          method: "POST",
          body: {
            redirect: {
              path,
              target
            }
          }
        });
        shopifyRedirect = res.data.redirect;
      }
    } catch (shopifyError) {
      // If direct check/create fails, try one last time to create (legacy behavior) or throw
      console.error("Shopify redirect operation failed:", shopifyError);
      throw shopifyError;
    }

    // Save in MongoDB
    await collection.updateOne(
      { path: shopifyRedirect.path },
      { 
        $set: {
          shopifyId: shopifyRedirect.id,
          path: shopifyRedirect.path,
          target: shopifyRedirect.target,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      redirect: shopifyRedirect
    });
  } catch (error) {
    console.error("Create redirect error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopifyId = searchParams.get("shopifyId");

    if (!shopifyId) {
      return NextResponse.json(
        { success: false, error: "Shopify ID is required" },
        { status: 400 }
      );
    }

    // Delete from Shopify
    await shopifyAdminRestFetch(`redirects/${shopifyId}.json`, {}, {
      method: "DELETE"
    });

    // Delete from MongoDB
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");
    await collection.deleteOne({ shopifyId: parseInt(shopifyId) });

    return NextResponse.json({
      success: true,
      message: "Redirect deleted"
    });
  } catch (error) {
    console.error("Delete redirect error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
