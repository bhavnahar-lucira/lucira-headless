import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function buildSetPayload(body) {
  return {
    customer: body.customer || null,
    enrollment_draft: body.enrollment_draft || null,
    payment_context: body.payment_context || null,
    payment_status: body.payment_status || "initiated",
    payment_verified: Boolean(body.payment_verified),
    payment_failure_reason: body.payment_failure_reason || null,
    subscription: body.subscription || null,
    razorpay_payment: body.razorpay_payment || null,
    razorpay_failure: body.razorpay_failure || null,
    enrollment_payload: body.enrollment_payload || null,
    enrollment_result: body.enrollment_result || null,
    enrolled_scheme: body.enrolled_scheme || null,
    receipt_create_payload: body.receipt_create_payload || null,
    receipt_create_result: body.receipt_create_result || null,
    receipt_create_error: body.receipt_create_error || null,
    receipt_retrieve_result: body.receipt_retrieve_result || null,
    receipt_pdf_downloaded_at: body.receipt_pdf_downloaded_at || null,
    webhook_status: body.webhook_status || null,
    notes: body.notes || null,
    updated_at: new Date(),
  };
}

function buildIdentityFilter(body) {
  if (body.receipt_entity_id) {
    return { receipt_entity_id: String(body.receipt_entity_id) };
  }

  if (body.razorpay_payment?.razorpay_payment_id) {
    return {
      razorpay_payment_id: String(body.razorpay_payment.razorpay_payment_id),
    };
  }

  if (body.subscription?.id) {
    return { subscription_id: String(body.subscription.id) };
  }

  if (body.enrollment_result?.EntityId) {
    return {
      enrollment_entity_id: String(body.enrollment_result.EntityId),
    };
  }

  if (body.customer?.mobile) {
    return { mobile: String(body.customer.mobile) };
  }

  return null;
}

function buildIdentityFields(body) {
  return {
    mobile: body.customer?.mobile ? String(body.customer.mobile) : null,
    party_id: body.customer?.party_id ? String(body.customer.party_id) : null,
    subscription_id: body.subscription?.id
      ? String(body.subscription.id)
      : null,
    razorpay_payment_id: body.razorpay_payment?.razorpay_payment_id
      ? String(body.razorpay_payment.razorpay_payment_id)
      : null,
    enrollment_entity_id: body.enrollment_result?.EntityId
      ? String(body.enrollment_result.EntityId)
      : null,
    receipt_entity_id: body.receipt_entity_id
      ? String(body.receipt_entity_id)
      : body.receipt_create_result?.EntityId
      ? String(body.receipt_create_result.EntityId)
      : null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const filter = buildIdentityFilter(body);

    if (!filter) {
      return NextResponse.json(
        { error: "Unable to identify payment record" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("scheme_payment_records");

    await collection.createIndex({ subscription_id: 1 }, { sparse: true });
    await collection.createIndex({ razorpay_payment_id: 1 }, { sparse: true });
    await collection.createIndex({ receipt_entity_id: 1 }, { sparse: true });
    await collection.createIndex({ enrollment_entity_id: 1 }, { sparse: true });
    await collection.createIndex({ mobile: 1 }, { sparse: true });

    const update = {
      $set: {
        ...buildIdentityFields(body),
        ...buildSetPayload(body),
      },
      $setOnInsert: {
        created_at: new Date(),
      },
    };

    const result = await collection.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: "after",
    });

    return NextResponse.json({
      success: true,
      record: result,
    });
  } catch (error) {
    console.error("Payment record save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save payment record" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");
    const enrollmentEntityId = searchParams.get("enrollment_entity_id");
    const receiptEntityId = searchParams.get("receipt_entity_id");
    const subscriptionId = searchParams.get("subscription_id");

    const db = await getDatabase();
    const collection = db.collection("scheme_payment_records");

    const query = {};

    if (mobile) query.mobile = String(mobile);
    if (enrollmentEntityId) {
      query.enrollment_entity_id = String(enrollmentEntityId);
    }
    if (receiptEntityId) query.receipt_entity_id = String(receiptEntityId);
    if (subscriptionId) query.subscription_id = String(subscriptionId);

    const records = await collection
      .find(query)
      .sort({ updated_at: -1 })
      .limit(receiptEntityId || subscriptionId ? 1 : 50)
      .toArray();

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Payment record fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment records" },
      { status: 500 }
    );
  }
}
