import { Product, RelatedProduct } from "@/types/product";

/**
 * Fetch Paginated Products [FROM CLIENT SIDE]
 *
 * This function fetches a paginated list of published products from the
 * custom API route (`/api/get-all-products`). The API route handles
 * communication with the WooCommerce REST API, simplifying client-side fetching.
 *
 * @param {number} page - The current page to fetch.
 * @param {number} perPage - The number of products to fetch per page.
 * @returns {Promise<{ products: Product[]; totalProducts: number }>} An object containing:
 *   - products: Array of product objects.
 *   - totalProducts: Total number of products available.
 * @throws {Error} If the request fails or the response is invalid.
 *
 * Note:
 * - The API route manages headers and authentication for WooCommerce REST API calls.
 * - Simplifies client-side code while maintaining security.
 */
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

export const fetchPaginatedProducts = async (
  page: number = 1,
  perPage: number = 12
): Promise<{ products: Product[]; totalProducts: number }> => {
  const url = `${BASE_URL}/api/get-all-products?page=${page}&perPage=${perPage}`;

  // console.log("Fetching products from API route:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();

  // console.log("[productServices] - data", data);

  // Destructure products and totalProducts from the API response
  const { products, totalProducts } = data;

  return { products, totalProducts };
};

// --------------------------- FETCH PAGINATED PRODUCTS CLIENT SIDE ENDS ----------------------------------------

// --------------------------- FETCH INITIAL PRODUCTS START ----------------------------------------

/**
 *
 * Fetch Initial Products (SSR-Compatible)
 *
 * This function fetches the first page of published products directly from the
 * WooCommerce REST API, ensuring compatibility with SSR and SSG. It bypasses
 * the local API route to prevent build-time errors.
 *
 * @param {number} page - The page number to fetch (default is 1).
 * @param {number} perPage - The number of products per page (default is 12).
 * @returns {Promise<{ products: Product[]; totalProducts: number }>} An object containing the fetched products and the total product count.
 * @throws {Error} If the request fails or the response is invalid.
 *
 * Note:
 * - Intended for server-side fetching during SSR or SSG.
 * - Uses environment variables for WooCommerce API credentials.
 */

import {
  WOOCOM_REST_GET_ALL_PRODUCTS,
  WOOCOM_REST_GET_PRODUCT_BY_ID,
} from "@/rest-api/products";

export const fetchInitialProducts = async (
  page: number = 1,
  perPage: number = 12
): Promise<{ products: Product[]; totalProducts: number }> => {
  // Construct the URL for the current page
  const url = WOOCOM_REST_GET_ALL_PRODUCTS(page, perPage);

  try {
    // Fetch data from the WooCommerce REST API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache the response for 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[fetchInitialProducts] WooCommerce API Error:", errorData);
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    // Parse the response JSON
    const products = await response.json();

    // Extract the total product count from response headers
    const totalProducts = parseInt(
      response.headers.get("X-WP-Total") || "0",
      10
    );

    // console.log("[fetchInitialProducts] Total products:", totalProducts);

    return { products, totalProducts };
  } catch (error) {
    console.error("[fetchInitialProducts] Error fetching products:", error);
    throw error;
  }
};

// --------------------------- FETCH INITIAL PRODUCTS ENDS ----------------------------------------

// --------------------------- FETCH  ALL PRODUCT SLUGS STARTS ----------------------------------------

/**
 * Fetch All Product Slugs
 *
 * This function fetches all product slugs from the WooCommerce REST API in batches.
 * It extracts only the `slug` field from the response and returns an array of slugs.
 *
 * @param {number} page - The starting page number for pagination (default is 1).
 * @param {number} perPage - The number of products to fetch per batch (default is 100).
 * @returns {Promise<string[]>} An array of product slugs.
 * @throws {Error} If the request fails or the response is invalid.
 *
 * Note:
 * - Designed for use in `generateStaticParams` to fetch slugs for SSG/ISR.
 * - Combines results from multiple pages until all slugs are fetched.
 */

import { WOOCOM_REST_GET_ALL_PRODUCT_SLUGS } from "@/rest-api/products";

export const fetchAllProductSlugs = async (
  page: number = 1,
  perPage: number = 100
): Promise<string[]> => {
  let allSlugs: string[] = [];
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      // Construct the URL for the current page
      const url = WOOCOM_REST_GET_ALL_PRODUCT_SLUGS(page, perPage);

      // console.log(`[fetchAllProductSlugs] Fetching slugs from: ${url}`);

      // Fetch data from the WooCommerce REST API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "[fetchAllProductSlugs] WooCommerce API Error:",
          errorData
        );
        throw new Error(
          `Failed to fetch product slugs: ${response.statusText}`
        );
      }

      // Parse the response JSON
      const products: Product[] = await response.json();

      // Extract slugs and add them to the allSlugs array
      const slugs = products.map((product) => product.slug);
      allSlugs = [...allSlugs, ...slugs];

      // console.log(`[fetchAllProductSlugs] Page ${page} fetched:`, slugs);

      // Check if there are more pages (based on the number of results returned)
      hasNextPage = products.length === perPage;
      page += 1; // Increment the page number for the next fetch
    }

    // console.log("[fetchAllProductSlugs] Total slugs fetched:", allSlugs.length);

    return allSlugs;
  } catch (error) {
    console.error("[fetchAllProductSlugs] Error fetching slugs:", error);
    throw error;
  }
};

// --------------------------- FETCH  ALL PRODUCT SLUGS ENDS ------------------------------------------

// --------------------------- FETCH PRODUCT BY SLUG STARTS ------------------------------------------

/**
 * Fetch Product by Slug
 *
 * This function retrieves a single product from the WooCommerce REST API
 * based on its slug. It uses the `WOOCOM_REST_GET_PRODUCT_BY_SLUG` endpoint
 * to fetch the product data.
 *
 * @param {string} slug - The slug of the product to fetch.
 * @returns {Promise<Product | null>} A single product object or null if not found.
 * @throws {Error} If the request fails or the response is invalid.
 *
 * Note:
 * - The slug is a unique identifier for a product, often derived from its name.
 * - The response is filtered to return only the first matching product, if any.
 * - Use this function to fetch data for product detail pages.
 */

import { WOOCOM_REST_GET_PRODUCT_BY_SLUG } from "@/rest-api/products";

export const fetchProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  try {
    // Construct the request URL for fetching the product by slug
    const url = WOOCOM_REST_GET_PRODUCT_BY_SLUG(slug);

    // console.log("[fetchProductBySlug] Fetching product from:", url);

    // Fetch data from the WooCommerce REST API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache the response for 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[fetchProductBySlug] WooCommerce API Error:", errorData);
      throw new Error(
        `Failed to fetch product by slug: ${response.statusText}`
      );
    }

    // Parse the response JSON
    const products = await response.json();

    // WooCommerce returns an array even for a single slug, so we take the first item
    const product = products.length > 0 ? products[0] : null;

    // console.log("[fetchProductBySlug] Product fetched successfully:", product);

    return product;
  } catch (error) {
    console.error(
      "[fetchProductBySlug] Error fetching product by slug:",
      error
    );
    throw error;
  }
};

// --------------------------- FETCH PRODUCT BY SLUG ENDS ----------------------------------------------------------------

// --------------------------- FETCH PRODUCT VARIATIONS BY VARIATION IDs STARTS ------------------------------------------

import { WOOCOM_REST_GET_VARIATION_BY_ID } from "@/rest-api/products";
import { ProductVariation } from "@/types/product";

/**
 * Fetch Product Variations by IDs
 *
 * This function takes an array of WooCommerce variation IDs and fetches
 * the details for each variation by calling the WooCommerce REST API.
 * It processes the data and returns an array of variation objects with
 * the necessary details for further use (e.g., pricing, attributes, stock).
 *
 * @param {number[]} variationIds - An array of WooCommerce variation IDs.
 * @returns {Promise<Variation[]>} A promise that resolves to an array of variations.
 * @throws {Error} If the fetch fails for any variation.
 *
 * Note:
 * - Each variation ID is fetched independently to ensure modularity.
 * - The function uses the REST endpoint for fetching individual variations.
 */

export const fetchProductVariationsById = async (
  productId: number,
  variationIds: number[]
): Promise<ProductVariation[]> => {
  try {
    // Fetch all variations concurrently using Promise.all
    const variations = await Promise.all(
      variationIds.map(async (variationId) => {
        const response = await fetch(
          WOOCOM_REST_GET_VARIATION_BY_ID(productId, variationId),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            next: { revalidate: 300 }, // Cache the response for 60 seconds
          }
        );

        if (!response.ok) {
          console.error(
            `[fetchProductVariationsById] Failed to fetch variation ${variationId}:`,
            await response.json()
          );
          throw new Error(`Failed to fetch variation ${variationId}`);
        }

        const variation = await response.json();
        return {
          id: variation.id,
          price: variation.price,
          sale_price: variation.sale_price,
          regular_price: variation.regular_price,
          attributes: variation.attributes, // Array of attributes (e.g., color, size)
          stock_status: variation.stock_status,
          sku: variation.sku,
        };
      })
    );

    // console.log(
    //   "[fetchProductVariationsById] Variations fetched successfully:",
    //   variations
    // );
    return variations;
  } catch (error) {
    console.error(
      "[fetchProductVariationsById] Error fetching variations:",
      error
    );
    throw error;
  }
};

// --------------------------- FETCH PRODUCT VARIATIONS BY VARIATION IDs ENDS --------------------------------------------

// --------------------------- FETCH RELATED PRODUCT IDs STARTS ----------------------------------------------------------

/**
 * Fetch Related Products by IDs
 *
 * This function retrieves the details of related products based on their IDs
 * from the WooCommerce REST API. It is optimized for fetching only the minimal
 * data required for the related products section.
 *
 * @param {number[]} productIds - Array of related product IDs.
 * @returns {Promise<RelatedProduct[]>} - Array of formatted related product objects.
 * @throws {Error} If fetching any product fails.
 */
export const fetchRelatedProductsById = async (
  productIds: number[]
): Promise<RelatedProduct[]> => {
  try {
    // Fetch all related products concurrently using Promise.all
    const relatedProducts = await Promise.all(
      productIds.map(async (productId) => {
        const response = await fetch(
          WOOCOM_REST_GET_PRODUCT_BY_ID(productId), // Use the ID to fetch product details
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            next: { revalidate: 300 }, // Cache the response for 60 seconds
          }
        );

        if (!response.ok) {
          console.error(
            `[fetchRelatedProductsById] Failed to fetch product ${productId}:`,
            await response.json()
          );
          throw new Error(`Failed to fetch related product ${productId}`);
        }

        const product = await response.json();

        // Format the data to return only necessary fields
        // Since some product images gallery has a video instead of an image as the first item
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price_html: product.price_html,
          image:
            product.images[0].type === "video"
              ? product.images[1].src
              : product.images[0].src || "", // Use the first image as the featured image
        };
      })
    );

    // console.log(
    //   "[fetchRelatedProductsById] Related products fetched successfully:",
    //   relatedProducts
    // );

    return relatedProducts;
  } catch (error) {
    console.error(
      "[fetchRelatedProductsById] Error fetching related products:",
      error
    );
    throw error;
  }
};

// --------------------------- FETCH RELATED PRODUCT IDs ENDS ------------------------------------------------------------

// --------------------------- FETCH POLE SHAPE STYLES FROM ACF STARTS ------------------------------------------------------------
/**
 * Fetches pole shape styles from the ACF Options API.
 *
 * This function queries the WordPress ACF REST API for globally defined pole shape styles.
 * The data includes image URLs for different pole shapes (e.g., round, square, octagon).
 * The API response is cached for 60 seconds to reduce server load and improve performance.
 *
 * @returns {Promise<Record<string, string>>} A promise resolving to an object containing pole shape styles
 *                                            mapped to their respective image URLs. If the request fails,
 *                                            an empty object is returned.
 *
 * Example Response:
 * {
 *   round: "https://example.com/uploads/round.png",
 *   round_octagon: "https://example.com/uploads/round_octagon.png",
 *   square: "https://example.com/uploads/square.png",
 *   square_octagon: "https://example.com/uploads/square_octagon.png"
 * }
 *
 * Usage:
 * ```ts
 * const poleShapeStyles = await fetchPoleShapeStyles();
 * console.log(poleShapeStyles.square); // Outputs the URL for the square pole shape
 * ```
 *
 * @throws {Error} Throws an error if the API response is invalid or missing necessary data.
 */

export const fetchPoleShapeStyles = async (): Promise<
  Record<string, string>
> => {
  const url = process.env.NEXT_PUBLIC_ACF_OPTIONS_REST_URL;
  // console.log("acf url [productServices]", url);
  if (!url) {
    throw new Error("ACF Options REST URL is not defined in the environment.");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache the response for 60 seconds
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pole shape styles: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data?.acf) {
      throw new Error("No ACF data found in the response.");
    }

    return {
      round: data.acf.round || "",
      round_octagon: data.acf.round_octagon || "",
      square: data.acf.square || "",
      square_octagon: data.acf.square_octagon || "",
    };
  } catch (error) {
    console.error("Error fetching pole shape styles:", error);
    return {}; // Return an empty object to avoid breaking the app
  }
};

// --------------------------- FETCH POLE SHAPE STYLES FROM ACF ENDS ------------------------------------------------------------

// --------------------------- FEATURED PRODUCTS FROM WOOCOM PRODUCTS STARTS ------------------------------------------------------------
/**
 * Fetches the featured products from the Next.js API route.
 * This function is used to retrieve products marked as "featured"
 * in the WooCommerce backend.
 *
 * @returns {Promise<{ products: any[] }>} A promise that resolves to an object containing an array of featured products.
 * If the request fails, an empty array is returned.
 *
 * - Uses `fetch` to call the `/api/featured-products` endpoint.
 * - Throws an error if the API response is not successful.
 * - Logs any errors encountered during the request.
 *
 * This function is designed for use in server-side components (SSR)
 * to ensure featured products are preloaded before rendering.
 */

export async function fetchFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/featured-products`
    );
    if (!res.ok) throw new Error("Failed to fetch featured products");
    return await res.json();
  } catch (error) {
    console.error("[Service] Error fetching featured products:", error);
    return { products: [] };
  }
}

// --------------------------- FEATURED PRODUCTS FROM WOOCOM PRODUCTS ENDS ------------------------------------------------------------
