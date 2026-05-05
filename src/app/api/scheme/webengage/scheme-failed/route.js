import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, firstName, lastName, email, scheme, failure_reason } =
      await req.json();

    // normalize phone (E.164)
    const phone = userId.startsWith("+") ? userId : `+91${userId}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WEBENGAGE_TOKEN}`,
    };

    /* ========= 1. UPDATE USER FIRST ========= */
    const userResponse = await fetch(
      `https://api.webengage.com/v1/accounts/${process.env.WEBENGAGE_ACCOUNT_ID}/users`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: phone,          // same identity everywhere
          firstName,
          lastName,
          email,
          phone,
          whatsappOptIn: true,
          emailOptIn: true,
          smsOptIn: true,
        }),
      }
    );

    /* ========= 2. SEND FAILED EVENT ========= */
    const eventResponse = await fetch(
      `https://api.webengage.com/v1/accounts/${process.env.WEBENGAGE_ACCOUNT_ID}/events`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: phone,        // MUST match user profile id
          eventName: "scheme_failed",
          eventTime: Math.floor(Date.now() / 1000),
          eventData: {
            amount: Number(scheme.amount),
            tenure: Number(scheme.tenure),
            subscription_id: String(scheme.subscription_id),
            failure_reason: String(failure_reason),
            status: "FAILED",
            platform: "web",
          },
        }),
      }
    );

    return NextResponse.json({
      success: true,
      eventStatus: eventResponse.status,
      userStatus: userResponse.status,
    });

  } catch (error) {
    console.error("WebEngage Failed Event Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
