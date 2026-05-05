import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("agent_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return NextResponse.json(
      { message: "Authenticated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}