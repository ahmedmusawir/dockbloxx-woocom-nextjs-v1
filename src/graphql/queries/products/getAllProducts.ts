/* 
Query: Get Products with Pagination
Description: Fetches a paginated list of products along with their details and metadata.
Arguments:
 - $first (Int!): Number of products to fetch.
 - $after (String): Cursor for pagination.
Returns:
 - nodes: Array of products with details such as id, name, slug, sku, price, categories, and image.
 - pageInfo: Contains hasNextPage and endCursor for pagination.
*/

export const GRAPHQL_QUERY_GET_ALL_PRODUCTS = `
query GetProductsWithPagination($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
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
}`;
