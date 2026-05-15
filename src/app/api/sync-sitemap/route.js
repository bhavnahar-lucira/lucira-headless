import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";
import {
  GET_COLLECTIONS_QUERY,
  GET_PAGES_QUERY,
  GET_ARTICLES_QUERY,
  GET_ALL_PRODUCTS_QUERY,
} from "@/lib/graphqlQueries";

async function fetchAll(query, fieldName, variables = { first: 250 }) {
  let allItems = [];
  let hasNextPage = true;
  let cursor = null;

  try {
    while (hasNextPage) {
      const data = await shopifyStorefrontFetch(query, { ...variables, after: cursor });
      
      let connection;
      if (fieldName === "articles" && data.blog) {
        connection = data.blog.articles;
      } else {
        connection = data[fieldName];
      }
      
      if (!connection) break;

      const nodes = connection.edges.map(edge => edge.node);
      allItems = [...allItems, ...nodes];
      
      hasNextPage = connection.pageInfo?.hasNextPage || false;
      cursor = connection.edges[connection.edges.length - 1]?.cursor;
      
      if (allItems.length > 10000) break; 
    }
  } catch (error) {
    console.error(`Error fetching ${fieldName}:`, error);
    throw error;
  }

  return allItems;
}

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");

    console.log("Starting Sitemap Sync...");

    // 1. Fetch GraphQL data
    const [collections, pages, articles, products] = await Promise.all([
      fetchAll(GET_COLLECTIONS_QUERY, "collections"),
      fetchAll(GET_PAGES_QUERY, "pages"),
      fetchAll(GET_ARTICLES_QUERY, "articles", { first: 250, blogHandle: "stories" }),
      fetchAll(GET_ALL_PRODUCTS_QUERY, "products"),
    ]);

    // 2. Fetch XML Sitemap Index and Sub-sitemaps
    let xmlSitemaps = [];
    let xmlUrls = [];
    try {
      const SHOP = "luciraonline";
      const rawStore = process.env.SHOPIFY_STORE || process.env.SHOPIFYSTORE || SHOP;
      const domain = rawStore.includes(".") ? rawStore : `${rawStore}.myshopify.com`;
      
      const sitemapUrl = `https://${domain}/sitemap.xml`;
      const res = await fetch(sitemapUrl);
      if (res.ok) {
        const xml = await res.text();
        const locs = xml.match(/<loc>(.*?)<\/loc>/g);
        if (locs) {
          xmlSitemaps = locs.map(loc => loc.replace(/<\/?loc>/g, ""));
          
          // Optionally fetch each sub-sitemap to get individual URLs
          for (const subSitemapUrl of xmlSitemaps) {
            try {
              const subRes = await fetch(subSitemapUrl);
              if (subRes.ok) {
                const subXml = await subRes.text();
                const subLocs = subXml.match(/<loc>(.*?)<\/loc>/g);
                if (subLocs) {
                  xmlUrls.push(...subLocs.map(loc => loc.replace(/<\/?loc>/g, "")));
                }
              }
            } catch (subErr) {
              console.error(`Error fetching sub-sitemap ${subSitemapUrl}:`, subErr);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error fetching XML sitemap:", e);
    }

    const sitemapData = {
      collections: collections.map(c => ({ title: c.title, handle: c.handle })),
      pages: pages.map(p => ({ title: p.title, handle: p.handle })),
      articles: articles.map(a => ({ title: a.title, handle: a.handle })),
      products: products.map(p => ({ title: p.title, handle: p.handle })),
      xmlSitemaps,
      xmlUrls: Array.from(new Set(xmlUrls)), // Unique URLs discovered from XML
      updatedAt: new Date()
    };

    const collection = db.collection("sitemaps");
    await collection.updateOne(
      { type: "main" },
      { $set: { ...sitemapData, type: "main" } },
      { upsert: true }
    );

    console.log("Sitemap Sync Completed.");

    return NextResponse.json({ 
      success: true, 
      counts: {
        collections: collections.length,
        pages: pages.length,
        articles: articles.length,
        products: products.length,
        xmlSitemaps: xmlSitemaps.length
      }
    });
  } catch (error) {
    console.error("Sync Sitemap Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const sitemap = await db.collection("sitemaps").findOne({ type: "main" });
    
    if (!sitemap) {
      return NextResponse.json({ success: false, error: "Sitemap not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sitemap });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
