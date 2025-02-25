/*
Query: Get Single Product by ID
Description: Fetches details of a single product by its database ID, including price and image.
Arguments:
 - $id (ID!): The database ID of the product to fetch.
Returns:
 - Product details including id, name, price (for all types), categories, and image.
*/

export const GRAPHQL_QUERY_GET_PRODUCT_BY_ID = `
query GetProductById($id: ID!) {
  product(id: $id, idType: DATABASE_ID) {
    id
    databaseId
    name
    slug
    productCategories {
      nodes {
        name
      }
    }
    image {
      sourceUrl
    }
    ... on SimpleProduct {
      price
    }
    ... on VariableProduct {
      price
    }
    ... on ExternalProduct {
      price
    }
    ... on GroupProduct {
      price
    }
  }
}`;
