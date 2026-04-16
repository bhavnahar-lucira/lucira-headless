export const GET_PAGES_QUERY = `
  query GetPages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          body
          bodySummary
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const GET_BLOGS_QUERY = `
  query GetBlogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const GET_ARTICLES_QUERY = `
  query GetArticles($first: Int!, $after: String) {
    articles(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          content
          contentHtml
          excerpt
          excerptHtml
          authorV2 {
            name
          }
          image {
            url
          }
          publishedAt
          blog {
            id
            handle
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

