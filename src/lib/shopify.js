const SHOP = "luciraonline";
const SHOP_DOMAIN = process.env.SHOPIFY_STORE || `${process.env.SHOPIFYSTORE || SHOP}.myshopify.com`;

export async function shopifyStorefrontFetch(query, variables = {}) {
  if (!process.env.STOREFRONT_TOKEN) {
    throw new Error("STOREFRONT_TOKEN not configured");
  }

  const res = await fetch(
    `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const data = await res.json();

  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data;
}

export async function shopifyAdminFetch(query, variables = {}) {
  const adminToken = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error("ADMIN_TOKEN or SHOPIFY_ADMIN_TOKEN not configured");
  }

  const res = await fetch(
    `https://${SHOP_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const data = await res.json();

  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data;
}

export async function shopifyAdminRestFetch(endpoint, params = {}) {
  const adminToken = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error("ADMIN_TOKEN or SHOPIFY_ADMIN_TOKEN not configured");
  }

  const url = new URL(`https://${SHOP_DOMAIN}/admin/api/2026-01/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Admin REST Errors:", data);
    throw new Error(data.errors?.[0]?.message || data.error || `Admin REST error ${res.status}`);
  }

  return {
    data,
    linkHeader: res.headers.get("link"),
  };
}

/* ================= MUTATIONS ================= */

export const STAGED_UPLOADS_CREATE_MUTATION = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const FILE_CREATE_MUTATION = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        ... on GenericFile {
          url
        }
        ... on MediaImage {
          image {
            url
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const FILE_QUERY = `
  query getFile($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        fileStatus
        image {
          url
        }
      }
      ... on GenericFile {
        fileStatus
        url
      }
    }
  }
`;

export const CUSTOMER_METAFIELD_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        metafield(namespace: "custom", key: "avatar_url") {
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
