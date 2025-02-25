/* 
Query: Get All Product Slugs
Description: Fetches slugs of all products from the WordPress GraphQL API with pagination support.
Arguments:
 - $first (Int!): Number of products to fetch per request.
 - $after (String): Cursor for pagination. Use `null` for the first page.
Returns:
 - nodes: Array of product slugs.
 - pageInfo: Contains hasNextPage and endCursor for pagination.
*/

export const GRAPHQL_QUERY_GET_ALL_PRODUCT_SLUGS = `
  query GetAllProductSlugs($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        slug
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
