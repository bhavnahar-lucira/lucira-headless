export const GET_ARTICLES = `
query getArticles($cursor: String) {
  articles(first: 12, after: $cursor,  sortKey: PUBLISHED_AT, reverse: true) {
    edges {
      cursor
      node {
        id
        title
        handle
        excerpt
        image {
          url
        }
        publishedAt
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
`;