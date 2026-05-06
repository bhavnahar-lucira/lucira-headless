import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Configuration
const RETRY_ATTEMPTS = 3;
const BACKOFF_MS = 2000;

/**
 * Helper to update sync status in MongoDB
 */
async function updateSyncStatus(data) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    await db.collection("sync_history").updateOne(
      { type: "cron_sync_all" },
      { $set: { ...data, lastUpdated: new Date() } },
      { upsert: true }
    );
  } catch (e) {
    console.error("[Cron] Failed to update sync status in DB:", e);
  }
}

/**
 * Helper to consume a streaming NDJSON response and wait for completion.
 */
async function consumeStream(url, method = "POST", secret, stepLabel, currentResults) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  
  console.log(`[Cron] Starting sync for: ${url}`);
  
  const response = await fetch(fullUrl, {
    method,
    headers: { 
      "Content-Type": "application/json",
      "x-cron-secret": secret
    },
    body: method === "POST" ? JSON.stringify({}) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          // Update progress in DB if available
          if (data.status === "progress" || data.status === "starting") {
             const stepIndex = currentResults.steps.findIndex(s => s.step === stepLabel);
             if (stepIndex !== -1) {
               currentResults.steps[stepIndex].progress = data.progress;
               currentResults.steps[stepIndex].message = data.message;
               await updateSyncStatus(currentResults);
             }
          }

          if (data.status === "error") {
            throw new Error(data.message || "Sync failed in stream");
          }
          if (data.status === "complete") {
            console.log(`[Cron] Completed: ${url} - ${data.message}`);
            return data;
          }
        } catch (e) {
          if (e.message.includes("Sync failed in stream")) throw e;
        }
      }
    }
  }
}

/**
 * Helper for standard JSON endpoints.
 */
async function executeSimple(url, method = "POST", secret) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  
  console.log(`[Cron] Starting sync for: ${url}`);
  
  const response = await fetch(fullUrl, {
    method,
    headers: { 
      "Content-Type": "application/json",
      "x-cron-secret": secret
    },
    body: method === "POST" ? JSON.stringify({}) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success === false) {
    throw new Error(data.error || "Sync failed");
  }
  
  console.log(`[Cron] Completed: ${url}`);
  return data;
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, label) {
  for (let i = 0; i < RETRY_ATTEMPTS; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`[Cron] Attempt ${i + 1} failed for ${label}:`, error.message);
      if (i === RETRY_ATTEMPTS - 1) throw error;
      const wait = BACKOFF_MS * Math.pow(2, i);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    type: "cron_sync_all",
    status: "in_progress",
    startTime: new Date().toISOString(),
    steps: [
      { step: "Products", status: "pending", progress: 0 },
      { step: "Variants", status: "pending", progress: 0 },
      { step: "Collections", status: "pending", progress: 0 },
      { step: "PagesBlogs", status: "pending", progress: 0 }
    ]
  };

  await updateSyncStatus(results);

  try {
    // 1. Products Sync
    const productStep = results.steps.find(s => s.step === "Products");
    productStep.status = "running";
    await updateSyncStatus(results);

    await withRetry(async () => {
      await consumeStream("/api/sync-shopify", "POST", secret, "Products", results);
      productStep.status = "success";
      productStep.progress = 100;
      await updateSyncStatus(results);
    }, "Products");

    // 2. Variants Sync
    const variantStep = results.steps.find(s => s.step === "Variants");
    variantStep.status = "running";
    await updateSyncStatus(results);

    await withRetry(async () => {
      await consumeStream("/api/sync-variants", "POST", secret, "Variants", results);
      variantStep.status = "success";
      variantStep.progress = 100;
      await updateSyncStatus(results);
    }, "Variants");

    // 3. Collections Sync
    const collectionStep = results.steps.find(s => s.step === "Collections");
    collectionStep.status = "running";
    await updateSyncStatus(results);

    await withRetry(async () => {
      await executeSimple("/api/sync-collections", "POST", secret);
      collectionStep.status = "success";
      collectionStep.progress = 100;
      await updateSyncStatus(results);
    }, "Collections");

    // 4. Pages & Blogs Sync
    const pageStep = results.steps.find(s => s.step === "PagesBlogs");
    pageStep.status = "running";
    await updateSyncStatus(results);

    await withRetry(async () => {
      await executeSimple("/api/sync/shopify", "POST", secret);
      pageStep.status = "success";
      pageStep.progress = 100;
      await updateSyncStatus(results);
    }, "PagesBlogs");

    results.status = "success";
    results.endTime = new Date().toISOString();
    results.success = true;
    await updateSyncStatus(results);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Cron] Sequence Failed:", error);
    results.status = "failed";
    results.success = false;
    results.error = error.message;
    results.failedAt = new Date().toISOString();
    await updateSyncStatus(results);
    
    return NextResponse.json(results, { status: 500 });
  }
}

