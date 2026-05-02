import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (JSON.stringify(value) || "") + expires + "; path=/";
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
        const val = c.substring(nameEQ.length, c.length);
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    }
    }
    return null;
    }

    export async function uploadToShopify(file, customFilename = null) {
      try {
        const finalFilename = customFilename || file.name;
        // 1. Get staged target
        const stagedRes = await fetch("/api/shopify/upload/staged", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: finalFilename,
            mimeType: file.type,
          }),
        });
        const { stagedTarget } = await stagedRes.json();

        // 2. Upload to Shopify's URL
        const formData = new FormData();
        stagedTarget.parameters.forEach((param) => {
          formData.append(param.name, param.value);
        });
        formData.append("file", file);

        const uploadRes = await fetch(stagedTarget.url, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to Shopify storage");
        }

        // 3. Register file in Shopify
        const registerRes = await fetch("/api/shopify/upload/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceUrl: stagedTarget.resourceUrl,
            mimeType: file.type,
            filename: finalFilename,
          }),
        });

    const result = await registerRes.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to register file in Shopify");
    }

    return result.url;
    } catch (error) {
    console.error("Upload to Shopify error:", error);
    throw error;
    }
    }