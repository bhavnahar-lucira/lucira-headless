import { NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";
import clientPromise from "@/lib/mongodb";
import { GET_PAGES_QUERY, GET_BLOGS_QUERY, GET_ARTICLES_QUERY } from "@/lib/graphqlQueries";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Sync Pages (Storefront API)
    let pagesHasNextPage = true;
    let pagesAfter = null;
    const allPages = [];

    while (pagesHasNextPage) {
      const pagesData = await shopifyStorefrontFetch(GET_PAGES_QUERY, {
        first: 250,
        after: pagesAfter,
      });

      const pages = pagesData.pages.edges.map((edge) => edge.node);
      allPages.push(...pages);
      pagesHasNextPage = pagesData.pages.pageInfo.hasNextPage;
      if (pagesHasNextPage) {
        pagesAfter = pagesData.pages.edges[pagesData.pages.edges.length - 1].cursor;
      }
    }

    if (allPages.length > 0) {
      const pageCollection = db.collection("pages");
      const pageOps = allPages.map((page) => ({
        updateOne: {
          filter: { id: page.id },
          update: { $set: page },
          upsert: true,
        },
      }));
      await pageCollection.bulkWrite(pageOps);
    }

    // 2. Sync Blogs (Storefront API)
    let blogsHasNextPage = true;
    let blogsAfter = null;
    const allBlogs = [];

    while (blogsHasNextPage) {
      const blogsData = await shopifyStorefrontFetch(GET_BLOGS_QUERY, {
        first: 250,
        after: blogsAfter,
      });

      const blogs = blogsData.blogs.edges.map((edge) => edge.node);
      allBlogs.push(...blogs);
      blogsHasNextPage = blogsData.blogs.pageInfo.hasNextPage;
      if (blogsHasNextPage) {
        blogsAfter = blogsData.blogs.edges[blogsData.blogs.edges.length - 1].cursor;
      }
    }

    if (allBlogs.length > 0) {
      const blogCollection = db.collection("blogs");
      const blogOps = allBlogs.map((blog) => ({
        updateOne: {
          filter: { id: blog.id },
          update: { $set: blog },
          upsert: true,
        },
      }));
      await blogCollection.bulkWrite(blogOps);
    }

    // 3. Sync Articles (Storefront API)
    let articlesHasNextPage = true;
    let articlesAfter = null;
    const allArticles = [];

    while (articlesHasNextPage) {
      const articlesData = await shopifyStorefrontFetch(GET_ARTICLES_QUERY, {
        first: 250,
        after: articlesAfter,
      });

      const articles = articlesData.articles.edges.map((edge) => {
        const { blog, ...node } = edge.node;
        return {
          ...node,
          blogId: blog?.id,
          blogHandle: blog?.handle,
        };
      });

      allArticles.push(...articles);
      articlesHasNextPage = articlesData.articles.pageInfo.hasNextPage;
      if (articlesHasNextPage) {
        articlesAfter = articlesData.articles.edges[articlesData.articles.edges.length - 1].cursor;
      }
    }

    if (allArticles.length > 0) {
      const articleCollection = db.collection("articles");
      const articleOps = allArticles.map((article) => ({
        updateOne: {
          filter: { id: article.id },
          update: { $set: article },
          upsert: true,
        },
      }));
      await articleCollection.bulkWrite(articleOps);
    }

    return NextResponse.json({
      success: true,
      pagesCount: allPages.length,
      blogsCount: allBlogs.length,
      articlesCount: allArticles.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
