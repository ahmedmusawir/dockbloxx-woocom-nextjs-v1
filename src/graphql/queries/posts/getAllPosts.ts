/* 
Query: Get All Blog Posts with Pagination
Description: Fetches a paginated list of blog posts along with their metadata.
Arguments:
 - $first (Int!): Number of posts to fetch.
 - $after (String): Cursor for pagination.
Returns:
 - nodes: Array of posts with details like id, title, slug, etc.
 - pageInfo: Contains hasNextPage and endCursor for pagination.
 */

export const GRAPHQL_QUERY_GET_ALL_POSTS = `
query GetBlogPosts($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    nodes {
      id
      title
      slug
      date
      excerpt
      featuredImage {
        node {
          sourceUrl
        }
      }
      categories {
        nodes {
          name
        }
      }
      author {
        node {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;
