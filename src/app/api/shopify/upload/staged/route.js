import { NextResponse } from "next/server";
import { shopifyAdminFetch, STAGED_UPLOADS_CREATE_MUTATION } from "@/lib/shopify";

export async function POST(req) {
  try {
    const { filename, mimeType, resourceType } = await req.json();

    const data = await shopifyAdminFetch(STAGED_UPLOADS_CREATE_MUTATION, {
      input: [
        {
          filename,
          mimeType,
          resource: resourceType || "IMAGE",
          httpMethod: "POST",
        },
      ],
    });

    const stagedTarget = data.stagedUploadsCreate.stagedTargets[0];
    const userErrors = data.stagedUploadsCreate.userErrors;

    if (userErrors.length > 0) {
      return NextResponse.json({ success: false, errors: userErrors }, { status: 400 });
    }

    return NextResponse.json({ success: true, stagedTarget });
  } catch (error) {
    console.error("Staged upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
