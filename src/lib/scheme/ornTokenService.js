let cachedToken = null;
let tokenExpiry = null;

export async function getORNToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const response = await fetch(
    "https://lucira.uat.ornaverse.in/connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: process.env.ORN_USERNAME,
        password: process.env.ORN_PASSWORD,
        grant_type: "password",
        client_id: "api_access",
        scope: "openid offline_access",
      }),
    }
  );

  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
  return cachedToken;
}
