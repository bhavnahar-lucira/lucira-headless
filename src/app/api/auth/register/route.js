import { NextResponse } from "next/server";
import crypto from "crypto";

const SHOP = "luciraonline";

function formatMobile(raw) {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 10) return "91" + cleaned;
  if (cleaned.length === 12 && cleaned.startsWith("91"))
    return cleaned;
  return "91" + cleaned.slice(-10);
}

export async function POST(req) {
  try {
    const { firstName, lastName, email, mobile } =
      await req.json();

    if (!firstName || !email || !mobile) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const formattedMobile = formatMobile(mobile);
    const password = crypto.randomBytes(16).toString("hex");

    /* ===== CREATE CUSTOMER ===== */

    const createRes = await fetch(
      `https://${SHOP}.myshopify.com/admin/api/2024-10/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            process.env.ADMIN_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone: "+" + formattedMobile,
            password,
            password_confirmation: password,
            verified_email: true,
          },
        }),
      }
    );

    const created = await createRes.json();
    const customer = created.customer;

    /* ===== LOGIN ===== */

    const loginRes = await fetch(
      `https://${SHOP}.myshopify.com/api/2024-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation {
              customerAccessTokenCreate(input: {
                email: "${email}",
                password: "${password}"
              }) {
                customerAccessToken {
                  accessToken
                  expiresAt
                }
              }
            }
          `,
        }),
      }
    );

    const loginData = await loginRes.json();
    const token =
      loginData?.data?.customerAccessTokenCreate
        ?.customerAccessToken;

    if (token?.accessToken) {
      const expiresAt = new Date(token.expiresAt);
      const maxAge = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );
      const res = NextResponse.json({
        status: "REGISTER_SUCCESS",
        user: customer,
        expiresAt: token?.expiresAt,
      });
      res.cookies.set("customerAccessToken", token.accessToken, {
        httpOnly: true,
        path: "/",
        maxAge,
      });
      return res;
    }

    return NextResponse.json({
      status: "REGISTER_SUCCESS",
      user: customer,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}