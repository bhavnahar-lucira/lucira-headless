import clientPromise from "./mongodb";

const INSTAGRAM_ID = '17841474216178936';

/**
 * Get the current access token from DB or Env
 */
export async function getAccessToken() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("settings").findOne({ key: "instagram_token" });
    
    // Return DB token if it exists, otherwise fallback to process.env
    return config?.value || process.env.INSTAGRAM_ACCESS_TOKEN;
  } catch (error) {
    console.error("Error fetching token from DB:", error);
    return process.env.INSTAGRAM_ACCESS_TOKEN;
  }
}

/**
 * Save a new token to the database
 */
export async function saveTokenToDb(token) {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection("settings").updateOne(
      { key: "instagram_token" },
      { $set: { value: token, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Error saving token to DB:", error);
    return false;
  }
}

/**
 * Exchange a short-lived token for a long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  const appId = process.env.INSTAGRAM_CLIENT_ID;
  const appSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Failed to exchange token: ${data.error.message}`);
  }

  // Auto-save to DB when exchanging
  await saveTokenToDb(data.access_token);

  return data;
}

/**
 * Refresh a long-lived token. 
 */
export async function refreshLongLivedToken(longLivedToken) {
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_CLIENT_ID}&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&fb_exchange_token=${longLivedToken}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Failed to refresh token: ${data.error.message}`);
  }

  // Auto-save to DB when refreshing
  await saveTokenToDb(data.access_token);

  return data;
}

/**
 * Fetch media from Instagram
 */
export async function getInstagramMedia() {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    console.error("Instagram Access Token not found (Env or DB)");
    return [];
  }

  const url = `https://graph.facebook.com/v21.0/${INSTAGRAM_ID}/media?fields=id,caption,media_url,permalink,media_type,thumbnail_url&access_token=${accessToken}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); 
    const data = await response.json();

    if (data.error) {
      console.error("Instagram API Error:", data.error);
      return [];
    }

    return data.data.map(item => ({
      id: item.id,
      image: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
      isVideo: item.media_type === 'VIDEO',
      videoUrl: item.media_type === 'VIDEO' ? item.media_url : null,
      caption: item.caption,
      permalink: item.permalink
    }));
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
    return [];
  }
}
