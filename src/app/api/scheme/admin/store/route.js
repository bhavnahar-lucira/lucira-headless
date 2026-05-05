
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const accessToken = payload.access_token;

    const response = await fetch(
      "https://lucira.uat.ornaverse.in/Services/Administration/Stores/GetUserStores",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ Take: 0 }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch stores" },
      { status: 401 }
    );
  }
}
