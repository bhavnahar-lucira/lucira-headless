import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, firstName, lastName, email, scheme } = await req.json();

    const phone = userId.startsWith("+") ? userId : `+91${userId}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WEBENGAGE_TOKEN}`,
    };

    /* ===== 1. IDENTIFY USER ===== */
    const userResponse = await fetch(
      `https://api.webengage.com/v1/accounts/${process.env.WEBENGAGE_ACCOUNT_ID}/users`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: phone,
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

    /* ===== 2. SEND EVENT ===== */
    const eventResponse = await fetch(
      `https://api.webengage.com/v1/accounts/${process.env.WEBENGAGE_ACCOUNT_ID}/events`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: phone,
          eventName: "scheme_success",
          eventTime: Math.floor(Date.now() / 1000),
          eventData: {
            scheme_id: scheme.id,
            amount: Number(scheme.amount),
            tenure: Number(scheme.tenure),
            subscription_id: String(scheme.subscription_id),
            status: "SUCCESS",
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
    console.error("WebEngage Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
