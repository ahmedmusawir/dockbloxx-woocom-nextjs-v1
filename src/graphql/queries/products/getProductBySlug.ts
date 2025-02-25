/* 
Query: Get Single Product by Slug
Description: Fetches details of a single product based on the provided slug.
Arguments:
 - $slug (ID!): The slug of the product to fetch.
Returns:
 - id: Unique identifier of the product.
 - name: Name of the product.
 - slug: Slug of the product.
 - sku: Stock Keeping Unit of the product.
 - shortDescription: A brief description of the product.
 - description: Full description of the product.
 - averageRating: Average customer rating of the product.
 - reviewCount: Number of customer reviews.
 - onSale: Boolean indicating if the product is on sale.
 - totalSales: Total number of units sold.
 - dateOnSaleFrom: Start date of the sale.
 - dateOnSaleTo: End date of the sale.
 - status: Current status of the product.
 - catalogVisibility: Visibility status in the catalog.
 - categories: Categories associated with the product.
 - productTags: Tags associated with the product.
 - attributes: Attributes of the product.
 - galleryImages: Gallery images for the product.
 - related: Related products with details like id, name, slug, price, and featured image.
 - price: Price of the product (based on type).
 - featuredImage: Featured image of the product (based on type).
*/

export const GRAPHQL_QUERY_GET_SINGLE_PRODUCT_BY_SLUG = `
 query GetSingleProductBySlug($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    id
    databaseId
    name
    slug
    sku
    shortDescription
    description
    averageRating
    reviewCount
    onSale
    totalSales
    dateOnSaleFrom
    dateOnSaleTo
    status
    catalogVisibility
    categories
    productTags {
      nodes {
        name
        slug
      }
    }
    attributes {
      nodes {
        name
        options
      }
    }
    galleryImages {
      nodes {
        sourceUrl
      }
    }
    related {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
        ... on VariableProduct {
          price
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
        ... on ExternalProduct {
          price
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
        ... on GroupProduct {
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
    ... on SimpleProduct {
      price
      featuredImage {
        node {
          sourceUrl
        }
      }
      productCategories {
        nodes {
          name
        }
      }
    }
    ... on VariableProduct {
      price
      featuredImage {
        node {
          sourceUrl
        }
      }
      productCategories {
        nodes {
          name
        }
      }
    }
    ... on ExternalProduct {
      price
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
    ... on GroupProduct {
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}
`;
