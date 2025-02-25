/**
 * GraphQL Query: GetTotalProducts
 *
 * This query is used to fetch the total count of published products
 * from the WordPress GraphQL API. The `totalProducts` field was
 * added as a custom field in the WordPress GraphQL schema and returns
 * the total number of published products available in the store.
 *
 * Usage:
 * This query is typically used for pagination setup to determine
 * the total number of pages required and to render numbered pagination
 * components dynamically.
 */

export const GRAPHQL_QUERY_GET_TOTAL_PRODUCT_COUNT = `
query GetTotalProducts {
  totalProducts
}`;
