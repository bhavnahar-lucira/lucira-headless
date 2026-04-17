import { shopifyStorefrontFetch } from "@/lib/shopify";

const GET_ARTICLE = `
query getArticle($blogHandle: String!, $handle: String!) {
  blog(handle: $blogHandle) {
    articleByHandle(handle: $handle) {
      title
      contentHtml
      publishedAt

      metafields(identifiers: [
        { namespace: "custom", key: "subtitle" }
        { namespace: "custom", key: "hero_image" }
      ]) {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }

      image {
        url
      }
    }
  }
}
`;

export default async function BlogDetail({ params }) {
  const resolvedParams = await params;
  const parsedParams =
    typeof resolvedParams === "string"
      ? JSON.parse(resolvedParams)
      : resolvedParams;

  const handle = parsedParams?.handle;

  if (!handle) {
    return <div className="text-center py-20">Invalid blog URL</div>;
  }

  // ✅ Fetch data
  const data = await shopifyStorefrontFetch(GET_ARTICLE, {
    blogHandle: "stories", // 👈 change if your blog handle is different
    handle,
  });

  const article = data?.blog?.articleByHandle;

  if (!article) {
    return <div className="text-center py-20">Article not found</div>;
  }

  // ✅ Extract metafields
// ✅ Extract metafields safely
const metafields = Array.isArray(article.metafields)
  ? article.metafields.filter((m) => m && typeof m === "object")
  : [];

// ✅ Safe access (no crash even if something is wrong)
const subtitle = metafields.find(
  (m) => m?.key === "subtitle"
)?.value;

const heroImage = metafields.find(
  (m) => m?.key === "hero_image"
)?.reference?.image?.url;


  return (
    <div className="max-w-4xl mx-auto px-6 py-16">

      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          {article.title}
        </h1>

        {subtitle && (
          <p className="text-gray-500 mt-4 text-lg">
            {subtitle}
          </p>
        )}

        <p className="text-sm text-gray-400 mt-2">
          {new Date(article.publishedAt).toDateString()}
        </p>
      </div>

      {/* Hero Image (metafield first priority) */}
      {(heroImage || article.image?.url) && (
        <div className="mb-12 overflow-hidden rounded-2xl">
          <img
            src={heroImage || article.image?.url}
            alt={article.title}
            className="w-full h-[450px] object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-gray-700"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </div>
  );
}