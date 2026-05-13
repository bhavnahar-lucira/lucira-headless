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
    const stringId = String(productId);
    const gid = stringId.startsWith('gid://') ? stringId : `gid://shopify/Product/${stringId}`;
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
    let productHandle = payload.handle || "N/A";

    if (topic === 'products/delete') {
      const shopifyId = `gid://shopify/Product/${payload.id}`;
      await productsCollection.deleteOne({ shopifyId });
      console.log(`Product ${payload.id} deleted.`);
      
      await db.collection("webhook_events").updateOne(
        { eventId },
        { $set: { status: "success", productHandle, completedAt: new Date() } }
      );
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

      if (!productData.id) {
        console.error(`Webhook payload missing ID for topic ${topic}. EventId: ${eventId}`);
        await db.collection("webhook_events").updateOne(
          { eventId },
          { $set: { status: "failed", error: "Missing product ID in payload", completedAt: new Date() } }
        );
        return;
      }

      productHandle = productData.handle;
      const shopifyId = isFromGraphQL ? productData.id : `gid://shopify/Product/${productData.id}`;
      const newUpdate = new Date(productData.updatedAt || productData.updated_at);

      console.log(`Processing ${topic} for shopifyId: ${shopifyId} (Handle: ${productHandle})`);

      // 1. Fetch existing data
      const existingProduct = await productsCollection.findOne({ shopifyId });
      const existingVariants = existingProduct?.variants || [];

      // 2. Map new variant data
      const mappedVariants = isFromGraphQL 
        ? productData.variants.edges.map(({ node: v }) => {
            const options = {};
            v.selectedOptions?.forEach(o => { options[o.name.toLowerCase()] = o.value; });
            return {
              id: v.id.split("/").pop(),
              sku: v.sku || "",
              price: Number(v.price),
              compare_price: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              inventoryQuantity: v.inventoryQuantity,
              inStock: v.inventoryQuantity > 0,
              title: v.title,
              image: v.image?.url,
              options
            };
          })
        : productData.variants?.map(v => {
            const options = {};
            v.option_values?.forEach(o => { options[o.option_display_name?.toLowerCase()] = o.label; });
            return {
              id: String(v.id),
              sku: v.sku,
              price: Number(v.price),
              compare_price: v.compare_at_price ? Number(v.compare_at_price) : null,
              inventoryQuantity: v.inventory_quantity,
              inStock: v.inventory_quantity > 0,
              title: v.title,
              options
            };
          });

      // 3. Determine Representative Variant
      const inStockVariants = mappedVariants.filter(v => v.inStock);
      const isRing = String(productData.productType || productData.product_type || "").toLowerCase().includes("ring");
      
      let representativeVariant = null;
      if (inStockVariants.length > 0) {
        if (isRing) {
          representativeVariant = inStockVariants.find(v => 
            String(v.title || "").includes("Yellow Gold") || 
            Object.values(v.options || {}).some(val => String(val).includes("Yellow Gold"))
          );
        }
        if (!representativeVariant) representativeVariant = inStockVariants[0];
      } else {
        representativeVariant = mappedVariants[0];
      }

      const productMetafields = isFromGraphQL ? {
        shop_for: productData.shop_for?.value,
        weight: productData.weight?.value,
        carat_range: productData.carat_range?.value,
        material_type: productData.material_type?.value,
        components: productData.components?.value,
        finishing: productData.finishing?.value,
        fit: productData.fit?.value,
        lead_time: productData.lead_time?.value
      } : undefined;

      const status = (productData.status || "").toUpperCase(); // Keep as ACTIVE/DRAFT/ARCHIVED
      const publishedAt = productData.publishedAt || productData.published_at;
      const isPublished = publishedAt !== null; // True if published to Online Store/any channel
      const isVisible = status === "ACTIVE" && isPublished;

      let finalTags = [];
      if (Array.isArray(productData.tags)) {
        finalTags = productData.tags;
      } else if (typeof productData.tags === 'string') {
        finalTags = productData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }

      // 4. SURGICAL DIFF: Only update what changed
      const updateSet = {};
      const changedFields = [];

      const checkAndAdd = (field, newValue, existingValue) => {
        if (JSON.stringify(newValue) !== JSON.stringify(existingValue)) {
          updateSet[field] = newValue;
          changedFields.push(field);
        }
      };

      if (!existingProduct) {
        // Full Import if product doesn't exist
        updateSet.title = productData.title;
        updateSet.handle = productData.handle;
        updateSet.description = productData.descriptionHtml || productData.body_html || productData.description;
        updateSet.vendor = productData.vendor;
        updateSet.type = productData.productType || productData.product_type;
        updateSet.status = status;
        updateSet.publishedAt = publishedAt;
        updateSet.isPublished = isPublished;
        updateSet.isVisible = isVisible;
        updateSet.updatedAt = newUpdate;
        updateSet.tags = finalTags;
        updateSet.price = representativeVariant?.price || 0;
        updateSet.compare_price = representativeVariant?.compare_price || null;
        updateSet.image = representativeVariant?.image || productData.featuredImage?.url || (productData.image?.src || productData.images?.[0]?.src);
        updateSet.images = isFromGraphQL 
          ? productData.images.edges.map(e => ({ url: e.node.url, alt: e.node.altText || "" }))
          : productData.images?.map(img => ({ url: img.src, alt: img.alt || "" }));
        if (productMetafields) updateSet.productMetafields = productMetafields;
        changedFields.push("Full Import");
      } else {
        checkAndAdd("title", productData.title, existingProduct.title);
        checkAndAdd("handle", productData.handle, existingProduct.handle);
        checkAndAdd("description", productData.descriptionHtml || productData.body_html || productData.description, existingProduct.description);
        checkAndAdd("vendor", productData.vendor, existingProduct.vendor);
        checkAndAdd("type", productData.productType || productData.product_type, existingProduct.type);
        checkAndAdd("status", status, existingProduct.status);
        checkAndAdd("publishedAt", publishedAt, existingProduct.publishedAt);
        checkAndAdd("isPublished", isPublished, existingProduct.isPublished);
        checkAndAdd("isVisible", isVisible, existingProduct.isVisible);
        checkAndAdd("tags", finalTags, existingProduct.tags);
        checkAndAdd("price", representativeVariant?.price || 0, existingProduct.price);
        checkAndAdd("compare_price", representativeVariant?.compare_price || null, existingProduct.compare_price);
        checkAndAdd("image", representativeVariant?.image || productData.featuredImage?.url || (productData.image?.src || productData.images?.[0]?.src), existingProduct.image);
        
        const newImages = isFromGraphQL 
          ? productData.images.edges.map(e => ({ url: e.node.url, alt: e.node.altText || "" }))
          : productData.images?.map(img => ({ url: img.src, alt: img.alt || "" }));
        checkAndAdd("images", newImages, existingProduct.images);

        // Surgically update productMetafields sub-fields
        if (productMetafields) {
          Object.keys(productMetafields).forEach(key => {
            const fieldKey = `productMetafields.${key}`;
            if (JSON.stringify(productMetafields[key]) !== JSON.stringify(existingProduct.productMetafields?.[key])) {
              updateSet[fieldKey] = productMetafields[key];
              changedFields.push(fieldKey);
            }
          });
        }
        
        if (changedFields.length > 0) {
          updateSet.updatedAt = newUpdate;
          updateSet.lastWebhookUpdate = new Date();
        }
      }

      // 5. Surgical Variant Updates (Merged into updateSet)
      const finalVariants = [];
      let variantsChanged = false;

      // Track which existing variant IDs we've processed
      const processedVariantIds = new Set();

      for (const v of mappedVariants) {
        processedVariantIds.add(v.id);
        const existingV = existingVariants.find(ev => ev.id === v.id);
        
        if (!existingV) {
          finalVariants.push(v);
          variantsChanged = true;
          changedFields.push(`New Variant:${v.id}`);
        } else {
          let vChanged = false;
          // Start with a clean merge of existing data to preserve fields NOT in webhook (like complex metafields)
          const mergedV = { ...existingV };
          
          const checkVariant = (field, newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              mergedV[field] = newVal;
              vChanged = true;
              changedFields.push(`variant.${v.id}.${field}`);
            }
          };

          checkVariant("price", v.price, existingV.price);
          checkVariant("compare_price", v.compare_price, existingV.compare_price);
          checkVariant("inventoryQuantity", v.inventoryQuantity, existingV.inventoryQuantity);
          checkVariant("inStock", v.inStock, existingV.inStock);
          checkVariant("sku", v.sku, existingV.sku);
          checkVariant("title", v.title, existingV.title);
          checkVariant("image", v.image || undefined, existingV.image);
          checkVariant("options", v.options, existingV.options);

          finalVariants.push(mergedV);
          if (vChanged) variantsChanged = true;
        }
      }

      // Preserve variants that are in DB but not in current Shopify payload (deletion safety)
      existingVariants.forEach(ev => {
        if (!processedVariantIds.has(ev.id)) {
          finalVariants.push(ev);
        }
      });

      if (variantsChanged) {
        updateSet.variants = finalVariants;
      }

      // Perform surgical update for top-level and variants if changes detected
      if (Object.keys(updateSet).length > 0) {
        await productsCollection.updateOne(
          { shopifyId },
          { $set: updateSet },
          { upsert: !existingProduct }
        );
      }
      
      const changesSummary = changedFields.join(", ") || "No relevant changes";
      console.log(`Product ${productHandle} surgically processed. Changes: ${changesSummary}`);
      
      await db.collection("webhook_events").updateOne(
        { eventId },
        { $set: { 
          status: "success", 
          productHandle, 
          changes: changesSummary, 
          completedAt: new Date() 
        } }
      );
    }

  } catch (error) {
    console.error(`Error processing webhook ${eventId}:`, error);
    try {
      const client = await clientPromise;
      const db = client.db("next_local_db");
      await db.collection("webhook_events").updateOne(
        { eventId },
        { $set: { status: "failed", error: error.message, completedAt: new Date() } }
      );
    } catch (dbErr) {
      console.error("Failed to log webhook error to DB:", dbErr);
    }
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
