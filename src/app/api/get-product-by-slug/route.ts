/**
 * ## API Endpoint: Get Product by Slug
 * This endpoint retrieves a single WooCommerce product based on its slug.
 * The slug is used as the unique identifier for products, which is SEO-friendly
 * and commonly used in URLs for product pages.
 *
 * ## GraphQL Query Used
 * The query fetches the following fields:
 * - **id**: Global unique ID for the product.
 * - **name**: The product's name.
 * - **slug**: SEO-friendly identifier for the product.
 * - **sku**: Stock Keeping Unit for inventory tracking.
 * - **price**: Price of the product (both for simple and variable products).
 * - **productCategories**: List of categories the product belongs to.
 * - **image**: URL of the product's featured image.
 *
 * ## Parameters
 * - **slug** (Required): The slug of the product you want to fetch.
 *
 * ## Response
 * - **Success (200)**: Returns product data in JSON format.
 * - **Error (500)**: Returns an error message if the product is not found or if there's a query issue.
 *
 * ## Usage
 * Example request:
 * ```
 * GET https://my-app.com/api/get-product-by-slug?slug=table-bloxx
 * ```
 * Replace `table-bloxx` with the slug of the product you want to retrieve.
 */

import { NextResponse } from "next/server";

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const GRAPHQL_QUERY = `
    query GetSingleProductBySlug($slug: ID!) {
      product(id: $slug, idType: SLUG) {
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
  `;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Product slug is required as a query parameter." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(WORDPRESS_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { slug },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch product data. Status: ${response.status}`
      );
    }

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
    }

    if (!data.product) {
      return NextResponse.json(
        { error: "Product not found with the provided slug." },
        { status: 404 }
      );
    }

    return NextResponse.json(data.product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the product." },
      { status: 500 }
    );
  }
}
