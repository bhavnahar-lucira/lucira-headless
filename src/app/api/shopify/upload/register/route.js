import { NextResponse } from "next/server";
import { shopifyAdminFetch, FILE_CREATE_MUTATION, FILE_QUERY } from "@/lib/shopify";

async function pollFileStatus(fileId) {
  let attempts = 0;
  const maxAttempts = 10;
  const delay = 1000; // 1 second

  while (attempts < maxAttempts) {
    const data = await shopifyAdminFetch(FILE_QUERY, { id: fileId });
    const file = data.node;

    if (file && (file.fileStatus === "READY" || (file.image && file.image.url) || file.url)) {
      return file.image?.url || file.url;
    }

    if (file && file.fileStatus === "FAILED") {
      throw new Error("File upload processing failed in Shopify");
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    attempts++;
  }
  
  throw new Error("Timeout waiting for file to be ready in Shopify");
}

export async function POST(req) {
  try {
    const { resourceUrl, mimeType, filename } = await req.json();

    const finalAlt = filename.startsWith("headless_") ? filename : `headless_${filename}`;

    const data = await shopifyAdminFetch(FILE_CREATE_MUTATION, {
      files: [
        {
          alt: finalAlt,
          contentType: mimeType.startsWith("image/") ? "IMAGE" : "FILE",
          originalSource: resourceUrl,
        },
      ],
    });

    const file = data.fileCreate.files[0];
    const userErrors = data.fileCreate.userErrors;

    if (userErrors.length > 0) {
      return NextResponse.json({ success: false, errors: userErrors }, { status: 400 });
    }

    // Wait for the file to be ready to get the final URL
    const finalUrl = await pollFileStatus(file.id);

    return NextResponse.json({ success: true, url: finalUrl, fileId: file.id });
  } catch (error) {
    console.error("Register upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
