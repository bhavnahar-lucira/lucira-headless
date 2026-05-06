import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configuration
const RETRY_ATTEMPTS = 3;
const BACKOFF_MS = 2000;

/**
 * Helper to consume a streaming NDJSON response and wait for completion.
 * Used for Products and Variants sync which return streams.
 */
async function consumeStream(url, method = "POST", secret) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  
  console.log(`[Cron] Starting sync for: ${url}`);
  
  const response = await fetch(fullUrl, {
    method,
    headers: { 
      "Content-Type": "application/json",
      "x-cron-secret": secret // Security header
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
          if (data.status === "error") {
            throw new Error(data.message || "Sync failed in stream");
          }
          if (data.status === "complete") {
            console.log(`[Cron] Completed: ${url} - ${data.message}`);
            return data;
          }
        } catch (e) {
          if (e.message.includes("Sync failed in stream")) throw e;
          // Ignore parse errors for partial chunks
        }
      }
    }
  }
}

/**
 * Helper for standard JSON endpoints.
 * Used for Collections and Pages/Blogs sync.
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

  // Security check
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    startTime: new Date().toISOString(),
    steps: []
  };

  try {
    // 1. Products Sync (Stream)
    await withRetry(async () => {
      await consumeStream("/api/sync-shopify", "POST", secret);
      results.steps.push({ step: "Products", status: "success" });
    }, "Products");

    // 2. Variants Sync (Stream)
    await withRetry(async () => {
      await consumeStream("/api/sync-variants", "POST", secret);
      results.steps.push({ step: "Variants", status: "success" });
    }, "Variants");

    // 3. Collections Sync (JSON)
    await withRetry(async () => {
      await executeSimple("/api/sync-collections", "POST", secret);
      results.steps.push({ step: "Collections", status: "success" });
    }, "Collections");

    // 4. Pages & Blogs Sync (JSON)
    await withRetry(async () => {
      await executeSimple("/api/sync/shopify", "POST", secret);
      results.steps.push({ step: "PagesBlogs", status: "success" });
    }, "PagesBlogs");

    results.endTime = new Date().toISOString();
    results.success = true;

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Cron] Sequence Failed:", error);
    results.success = false;
    results.error = error.message;
    results.failedAt = new Date().toISOString();
    
    return NextResponse.json(results, { status: 500 });
  }
}
