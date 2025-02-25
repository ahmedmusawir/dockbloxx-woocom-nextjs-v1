/* 
Query: Get All Published Products with Pagination
Description: Fetches a paginated list of products that are explicitly in "PUBLISHED" status.
Arguments:
 - $first (Int!): Number of products to fetch.
 - $after (String): Cursor for pagination.
Returns:
 - nodes: Array of published products with details such as id, name, slug, sku, price, categories, and image.
 - pageInfo: Contains hasNextPage and endCursor for pagination.
*/

export const GRAPHQL_QUERY_GET_ALL_PUBLISHED_PRODUCTS = `
query GetAllPublishedProducts($first: Int!, $after: String) {
  products(where: { status: "publish" }, first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        databaseId
        name
        slug
        sku
        ... on SimpleProduct {
          price
          productCategories {
            nodes {
              name
            }
          }
          image {
            sourceUrl
          }
        }
        ... on VariableProduct {
          price
          productCategories {
            nodes {
              name
            }
          }
          image {
            sourceUrl
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;
