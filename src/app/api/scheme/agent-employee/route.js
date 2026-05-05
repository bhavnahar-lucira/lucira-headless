

import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    let token = req.cookies.get("agent_session")?.value;
    const refreshToken = req.cookies.get("agent_refresh")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = {
      Sort: ["employee_name"],
      ColumnSelection: 1,
      IncludeColumns: [
        "company_id",
        "employee_id",
        "employee_name",
      ],
      Criteria: null,
      Skip: 0,
      Take: 101,
      ExcludeTotalCount: true,
    };

    try {
      const response = await fetch(
        "https://lucira.uat.ornaverse.in/Services/HR/Employee/List",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && refreshToken) {
          const refreshResponse = await fetch(
            "https://lucira.uat.ornaverse.in/connect/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: "api_access",
              }),
            }
          );

          const refreshData = await refreshResponse.json();

          if (!refreshResponse.ok) {
            throw new Error("Session expired");
          }

          const {
            access_token,
            refresh_token: new_refresh_token,
            expires_in,
          } = refreshData;

          token = access_token;

          /* Retry employee API */

          const retryResponse = await fetch(
            "https://lucira.uat.ornaverse.in/Services/HR/Employee/List",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          const retryData = await retryResponse.json();

          if (!retryResponse.ok) {
            return NextResponse.json(retryData, { status: retryResponse.status });
          }

          const res = NextResponse.json(retryData);

          /* Update cookies */

          res.cookies.set("agent_session", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: expires_in,
          });

          res.cookies.set("agent_refresh", new_refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });

          return res;
        }

        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data);

    } catch (err) {
      if (err.message === "Session expired") {
        const res = NextResponse.json(
          { error: "Session expired" },
          { status: 401 }
        );

        res.cookies.set("agent_session", "", {
          maxAge: 0,
          path: "/",
        });

        res.cookies.set("agent_refresh", "", {
          maxAge: 0,
          path: "/",
        });

        return res;
      }
      throw err;
    }

  } catch (err) {
    console.error(
      "Employee API Error:",
      err?.response?.data || err
    );

    return NextResponse.json(
      {
        error:
          err?.response?.data ||
          "Employee fetch failed",
      },
      { status: err?.response?.status || 500 }
    );
  }
}