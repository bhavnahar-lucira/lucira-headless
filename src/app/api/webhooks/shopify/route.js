import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';
import { shopifyAdminFetch } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

const PRODUCT_FULL_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id title handle descriptionHtml vendor productType status tags createdAt publishedAt updatedAt
      featuredImage { url }
      shop_for: metafield(namespace: "custom", key: "shop_for") { value }
      weight: metafield(namespace: "custom", key: "weight") { value }
      carat_range: metafield(namespace: "custom", key: "carat_range") { value }
      material_type: metafield(namespace: "ornaverse", key: "material_type") { value }
      components: metafield(namespace: "ornaverse", key: "components") { value }
      finishing: metafield(namespace: "custom", key: "finishing") { value }
      fit: metafield(namespace: "custom", key: "fit") { value }
      matching_products: metafield(namespace: "custom", key: "matching_product") { value }
      complementary_products: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") { value }
      lead_time: metafield(namespace: "custom", key: "lead_time") { value }
      variants(first: 250) {
        edges {
          node {
            id price compareAtPrice inventoryQuantity sku title
            selectedOptions { name value }
            image { url }
          }
        }
      }
      images(first: 20) {
        edges {
          node { url altText }
        }
      }
    }
  }
`;

/**
 * Verify Shopify Webhook HMAC
 */
function verifyShopifyWebhook(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) {
    console.error('SHOPIFY_WEBHOOK_SECRET or HMAC header is missing');
    return false;
  }

  try {
    const generatedHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest(); // Returns Buffer

    const headerHmac = Buffer.from(hmacHeader, 'base64');

    if (generatedHmac.length !== headerHmac.length) {
      return false;
    }

    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(generatedHmac, headerHmac);
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Fetch full product data from Shopify Admin GraphQL API
 */
async function fetchFullProduct(productId) {
  try {
    const gid = productId.startsWith('gid://') ? productId : `gid://shopify/Product/${productId}`;
    const data = await shopifyAdminFetch(PRODUCT_FULL_QUERY, { id: gid });
    return data.product;
  } catch (error) {
    console.error(`Failed to fetch full product ${productId}:`, error);
    return null;
  }
}

/**
 * Process the webhook event asynchronously
 */
async function processWebhook(topic, payload, eventId) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    
    // 2. Idempotency & Race Conditions - Atomic Check
    // We try to "lock" this event immediately. If it already exists, matchedCount > 0.
    const eventLock = await db.collection("webhook_events").updateOne(
      { eventId },
      { $setOnInsert: { topic, startedAt: new Date() } },
      { upsert: true }
    );

    if (eventLock.matchedCount > 0) {
      console.log(`Event ${eventId} already being processed or completed. Skipping.`);
      return;
    }

    const productsCollection = db.collection("products");

    if (topic === 'products/delete') {
      const shopifyId = `gid://shopify/Product/${payload.id}`;
      await productsCollection.deleteOne({ shopifyId });
      console.log(`Product ${payload.id} deleted.`);
    } else if (topic === 'products/create' || topic === 'products/update') {
      const isTruncated = payload.truncated_fields || 
                         (payload.variants && payload.variants.length >= 100) ||
                         (payload.variants && payload.variants.some(v => v.price === undefined));
      
      let productData;
      let isFromGraphQL = false;

      if (isTruncated || topic === 'products/create') {
        productData = await fetchFullProduct(payload.id);
        isFromGraphQL = true;
      } 
      
      if (!productData) {
        productData = payload;
        isFromGraphQL = false;
      }

      const shopifyId = isFromGraphQL ? productData.id : `gid://shopify/Product/${productData.id}`;
      const newUpdate = new Date(productData.updatedAt || productData.updated_at);

      // Map data (omitted for brevity in this replace call, keeping your logic)
      const status = productData.status;
      const publishedAt = productData.publishedAt || productData.published_at;
      const isVisible = status === "active" && publishedAt !== null;

      // ... mappedVariants logic ...
      const mappedVariants = isFromGraphQL 
        ? productData.variants.edges.map(({ node: v }) => ({
            id: v.id.split("/").pop(),
            sku: v.sku || "",
            price: Number(v.price),
            compare_price: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            inventoryQuantity: v.inventoryQuantity,
            title: v.title,
            image: v.image?.url
          }))
        : productData.variants?.map(v => ({
            id: String(v.id),
            sku: v.sku,
            price: Number(v.price),
            compare_price: v.compare_at_price ? Number(v.compare_at_price) : null,
            inventoryQuantity: v.inventory_quantity,
            title: v.title,
          }));

      // Map Metafields
      const productMetafields = isFromGraphQL ? {
        shop_for: productData.shop_for?.value,
        weight: productData.weight?.value,
        carat_range: productData.carat_range?.value,
        material_type: productData.material_type?.value,
        components: productData.components?.value,
        finishing: productData.finishing?.value,
        fit: productData.fit?.value,
        lead_time: productData.lead_time?.value
      } : undefined; // We'll use $set only if we have them

      const doc = {
        shopifyId,
        title: productData.title,
        handle: productData.handle,
        description: productData.descriptionHtml || productData.body_html || productData.description,
        vendor: productData.vendor,
        type: productData.productType || productData.product_type,
        status,
        publishedAt,
        updatedAt: newUpdate,
        tags: productData.tags,
        isVisible,
        variants: mappedVariants,
        image: isFromGraphQL ? productData.featuredImage?.url : (productData.image?.src || productData.images?.[0]?.src),
        images: isFromGraphQL 
          ? productData.images.edges.map(e => ({ url: e.node.url, alt: e.node.altText || "" }))
          : productData.images?.map(img => ({ url: img.src, alt: img.alt || "" })),
        lastWebhookUpdate: new Date(),
      };

      if (productMetafields) {
        doc.productMetafields = productMetafields;
      }

      // 2. Race Conditions - Atomic Update with Versioning
      // We only update if the product doesn't exist OR the existing update is older.
      // This prevents an older webhook from overwriting a newer state.
      await productsCollection.updateOne(
        { 
          shopifyId, 
          $or: [
            { updatedAt: { $lt: newUpdate } },
            { updatedAt: { $exists: false } }
          ]
        },
        { $set: doc },
        { upsert: true }
      );
      
      console.log(`Product ${productData.handle} processed. Visibility: ${isVisible}`);
    }

    // Mark event as completed
    await db.collection("webhook_events").updateOne(
      { eventId },
      { $set: { completedAt: new Date() } }
    );

  } catch (error) {
    console.error(`Error processing webhook ${eventId}:`, error);
  }
}


export async function POST(req) {
  try {
    // 2. Security (MANDATORY) - Use raw body
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');
    const eventId = req.headers.get('x-shopify-event-id');

    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.warn('Webhook HMAC verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 5. Event Routing check
    if (!topic || !eventId) {
      return new NextResponse('Missing headers', { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // 3. Fast Response (CRITICAL)
    // Process asynchronously - do NOT await
    processWebhook(topic, payload, eventId).catch(err => {
      console.error('Async processing error:', err);
    });

    // Immediately return 200
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    // 11. Error Handling
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
