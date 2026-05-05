
import { NextResponse } from "next/server";

export async function POST(req) {
  const token = req.cookies.get("agent_session")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      "https://lucira.uat.ornaverse.in/Services/Administration/Stores/GetUserStores",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
      { error: "Failed to fetch stores" },
      { status: 400 }
    );
  }
}