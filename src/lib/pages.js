import clientPromise from "./mongodb";
import { shopifyStorefrontFetch } from "./shopify";

export async function getAllPages() {
    const client = await clientPromise
    const db = client.db("next_local_db");

    return db.collection("pages").find({}).toArray();
}

export async function getPageByHandle(handle) {
    const client = await clientPromise;
    const db = client.db("next_local_db");

    return db.collection("pages").findOne({handle});
}

export async function getPageByHandleStorefront(handle) {
    const query = `
      query getPage($handle: String!) {
        page(handle: $handle) {
          id
          title
          handle
          body
          bodySummary
          city: metafield(namespace: "custom", key: "city_name") {
            value
          }
          state: metafield(namespace: "custom", key: "state_name") {
            value
          }
        }
      }
    `;

    const data = await shopifyStorefrontFetch(query, { handle });
    return data?.page;
}