import { Product, RelatedProduct } from "@/types/product";
import { WC_REST_URL } from "@/constants/apiEndpoints";
import { wooCommerceLimit as limit, sleep, RetryOptions } from "@/lib/utils";

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

  // Inject isDeal flag manually (same as other services)
  const products: Product[] = data.products.map((p: any) => ({
    ...p,
    isDeal: p.categories?.some((cat: any) => cat.slug === "deals") || false,
  }));

  return {
    products,
    totalProducts: data.totalProducts,
  };
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
      next: { revalidate: 60 }, // Cache the response for 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[fetchInitialProducts] WooCommerce API Error:", errorData);
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    // Parse the response JSON
    const rawProducts = (await response.json()) as any[];

    // inject our deal flag based on the “deals” slug
    const products: Product[] = rawProducts.map((p) => ({
      ...p,
      isDeal: p.categories.some((cat: Category) => cat.slug === "deals"),
    }));

    // Extract the total product count from response headers
    const totalProducts = parseInt(
      response.headers.get("X-WP-Total") || "0",
      10
    );

    // console.log("[fetchInitialProducts] Total products:", totalProducts);
    // console.log("[fetchInitialProducts] isDeal products:", products);

    return { products, totalProducts };
  } catch (error) {
    console.error("[fetchInitialProducts] Error fetching products:", error);
    throw error;
  }
};

// --------------------------- FETCH INITIAL PRODUCTS ENDS ----------------------------------------

// --------------------------- FETCH  ALL PRODUCT SLUGS STARTS ----------------------------------------

import { WOOCOM_REST_GET_ALL_PRODUCT_SLUGS } from "@/rest-api/products";

/**
 * 🎯 BULLETPROOF PRODUCT SLUGS FETCHER
 *
 * Fetches ALL WooCommerce product slugs with:
 * - p-limit concurrency control (prevents API overload)
 * - Exponential backoff retry logic per page
 * - Comprehensive error handling
 * - Build-safe failure modes
 *
 * Used for: generateStaticParams() - CRITICAL for SSG
 * Build Impact: CATASTROPHIC if this fails - NO PAGES GET GENERATED
 *
 * @param page - Starting page number (default: 1)
 * @param perPage - Products per page (default: 100)
 * @param options - Retry configuration options
 * @returns Promise<string[]> - Array of all product slugs
 */
export const fetchAllProductSlugs = async (
  page: number = 1,
  perPage: number = 100,
  options: RetryOptions = {}
): Promise<string[]> => {
  const { maxRetries = 3, timeoutMs = 30000, baseDelay = 1000 } = options;

  let allSlugs: string[] = [];
  let currentPage = page;
  let hasNextPage = true;

  console.log(
    `[fetchAllProductSlugs] 🎯 Starting to fetch ALL product slugs with p-limit protection`
  );

  try {
    while (hasNextPage) {
      // 🚦 Each page fetch is wrapped with p-limit + retry logic
      const pageResults = await limit(async () => {
        const totalAttempts = maxRetries + 1;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= totalAttempts; attempt++) {
          let timeoutId: NodeJS.Timeout | undefined;

          try {
            console.log(
              `[fetchAllProductSlugs] Page ${currentPage} - Attempt ${attempt}/${totalAttempts}`
            );

            const url = WOOCOM_REST_GET_ALL_PRODUCT_SLUGS(currentPage, perPage);

            // Create AbortController for timeout
            const controller = new AbortController();
            timeoutId = setTimeout(() => {
              console.warn(
                `[fetchAllProductSlugs] Request timeout after ${timeoutMs}ms for page ${currentPage}`
              );
              controller.abort();
            }, timeoutMs);

            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": "NextJS-App/1.0",
              },
              signal: controller.signal,
            });

            // Check if response is ok
            if (!response.ok) {
              let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

              try {
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                  const errorData = await response.json();
                  console.error(
                    `[fetchAllProductSlugs] WooCommerce API Error for page ${currentPage}:`,
                    errorData
                  );
                  errorMessage += ` - ${JSON.stringify(errorData)}`;
                } else {
                  const errorText = await response.text();
                  console.error(
                    `[fetchAllProductSlugs] Non-JSON response for page ${currentPage}:`,
                    errorText.substring(0, 200)
                  );
                  errorMessage +=
                    " - Received non-JSON response (likely HTML error page)";
                }
              } catch (parseError) {
                console.error(
                  `[fetchAllProductSlugs] Error parsing error response for page ${currentPage}:`,
                  parseError
                );
                errorMessage += " - Could not parse error response";
              }

              throw new Error(errorMessage);
            }

            // Validate content type before attempting to parse
            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
              const responseText = await response.text();
              console.error(
                `[fetchAllProductSlugs] Expected JSON but got for page ${currentPage}:`,
                contentType
              );
              console.error(
                `[fetchAllProductSlugs] Response preview:`,
                responseText.substring(0, 200)
              );
              throw new Error(
                `Expected JSON response but got: ${contentType}. This usually means WooCommerce returned an error page.`
              );
            }

            // Parse the response JSON with detailed error handling
            const responseText = await response.text();
            let products: Product[];

            try {
              products = JSON.parse(responseText);
            } catch (parseError) {
              console.error(
                `[fetchAllProductSlugs] JSON Parse Error for page ${currentPage}:`,
                parseError
              );
              console.error(
                `[fetchAllProductSlugs] Response that failed to parse:`,
                responseText.substring(0, 500)
              );
              throw new Error(
                `Failed to parse JSON response for page ${currentPage}: ${
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError)
                }`
              );
            }

            // Extract slugs from products
            const slugs = products.map((product) => product.slug);

            console.log(
              `[fetchAllProductSlugs] ✅ SUCCESS: Page ${currentPage} fetched ${slugs.length} slugs`
            );

            return { slugs, hasMore: products.length === perPage };
          } catch (error) {
            lastError =
              error instanceof Error ? error : new Error(String(error));

            console.error(
              `[fetchAllProductSlugs] ❌ Page ${currentPage} - Attempt ${attempt}/${totalAttempts} failed:`,
              lastError.message
            );

            // If this is NOT the last attempt, wait before retrying
            if (attempt < totalAttempts) {
              const delay =
                baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
              console.log(
                `[fetchAllProductSlugs] ⏳ Retrying page ${currentPage} in ${Math.round(
                  delay
                )}ms...`
              );
              await sleep(delay);
            }
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
        }

        // 🚨 ALL ATTEMPTS FAILED FOR THIS PAGE
        console.error(
          `[fetchAllProductSlugs] 🚨 CATASTROPHIC FAILURE: All ${totalAttempts} attempts failed for page ${currentPage}`
        );

        throw new Error(
          `CATASTROPHIC BUILD FAILURE: Failed to fetch product slugs page ${currentPage} after ${totalAttempts} attempts. generateStaticParams() cannot continue.`,
          { cause: lastError }
        );
      });

      // Add this page's slugs to the total
      allSlugs = [...allSlugs, ...pageResults.slugs];
      hasNextPage = pageResults.hasMore;
      currentPage += 1;
    }

    console.log(
      `[fetchAllProductSlugs] 🎉 COMPLETE SUCCESS: ${
        allSlugs.length
      } total slugs fetched across ${currentPage - 1} pages`
    );
    return allSlugs;
  } catch (error) {
    console.error(
      `[fetchAllProductSlugs] 🚨 CATASTROPHIC BUILD FAILURE: Failed to fetch product slugs`
    );
    console.error(
      `[fetchAllProductSlugs] 🚨 generateStaticParams() CANNOT CONTINUE - NO PAGES WILL BE GENERATED!`
    );
    throw error;
  }
};

// 🚀 BUILD-OPTIMIZED VERSION with more aggressive retries
export const fetchAllProductSlugsForBuild = async (
  page: number = 1,
  perPage: number = 100
): Promise<string[]> => {
  return fetchAllProductSlugs(page, perPage, {
    maxRetries: 5, // 6 total attempts per page
    timeoutMs: 45000, // 45 second timeout per page
    baseDelay: 2000, // 2 second base delay
  });
};

// 🛡️ ULTRA-SAFE BUILD VERSION
export const fetchAllProductSlugsUltraSafe = async (
  page: number = 1,
  perPage: number = 100
): Promise<string[]> => {
  return fetchAllProductSlugs(page, perPage, {
    maxRetries: 8, // 9 total attempts per page
    timeoutMs: 60000, // 1 minute timeout per page
    baseDelay: 3000, // 3 second base delay
  });
};

// --------------------------- FETCH  ALL PRODUCT SLUGS ENDS ------------------------------------------

// --------------------------- FETCH PRODUCT BY SLUG STARTS ------------------------------------------

/**
 * Fetch Product by Slug with Bulletproof Retry Logic
 *
 * This function retrieves a single product from the WooCommerce REST API
 * based on its slug with built-in retry mechanism and bulletproof error handling.
 *
 * CRITICAL: This function will NEVER skip products - it either succeeds or throws
 * an error that will fail the build. This ensures no products go missing.
 *
 * @param {string} slug - The slug of the product to fetch.
 * @param {number} maxRetries - Maximum number of RETRIES after first attempt (default: 3)
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns {Promise<Product | null>} A single product object or null if legitimately not found.
 * @throws {Error} If all attempts fail - WILL HALT BUILD to prevent missing products.
 */

import pLimit from "p-limit";
import { WOOCOM_REST_GET_PRODUCT_BY_SLUG } from "@/rest-api/products";

export const fetchProductBySlug = async (
  slug: string,
  options: RetryOptions = {}
): Promise<Product | null> => {
  // 🎯 THE MAGIC - Wrap your proven code with p-limit
  return limit(async () => {
    const {
      maxRetries = 3, // 3 retries = 4 total attempts
      timeoutMs = 30000, // 30 seconds
      baseDelay = 1000, // 1 second base delay
    } = options;

    const totalAttempts = maxRetries + 1; // Be crystal clear about total attempts
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      let timeoutId: NodeJS.Timeout | undefined;

      try {
        console.log(
          `[fetchProductBySlug] Attempt ${attempt}/${totalAttempts} for slug: ${slug}`
        );

        const url = WOOCOM_REST_GET_PRODUCT_BY_SLUG(slug);

        // Create AbortController for timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          console.warn(
            `[fetchProductBySlug] Request timeout after ${timeoutMs}ms for slug: ${slug}`
          );
          controller.abort();
        }, timeoutMs);

        // Fetch data from the WooCommerce REST API
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Add user agent to avoid potential blocking
            "User-Agent": "NextJS-App/1.0",
          },
          signal: controller.signal,
          next: { revalidate: 60 },
        });

        // Check if response is ok
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            // Try to get error details from response
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const errorData = await response.json();
              console.error(
                "[fetchProductBySlug] WooCommerce API Error:",
                errorData
              );
              errorMessage += ` - ${JSON.stringify(errorData)}`;
            } else {
              // If it's not JSON, get text (might be HTML error page)
              const errorText = await response.text();
              console.error(
                "[fetchProductBySlug] Non-JSON response:",
                errorText.substring(0, 200)
              );
              errorMessage +=
                " - Received non-JSON response (likely HTML error page)";
            }
          } catch (parseError) {
            console.error(
              "[fetchProductBySlug] Error parsing error response:",
              parseError
            );
            errorMessage += " - Could not parse error response";
          }

          throw new Error(errorMessage);
        }

        // Validate content type before attempting to parse
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const responseText = await response.text();
          console.error(
            "[fetchProductBySlug] Expected JSON but got:",
            contentType
          );
          console.error(
            "[fetchProductBySlug] Response preview:",
            responseText.substring(0, 200)
          );
          throw new Error(
            `Expected JSON response but got: ${contentType}. This usually means WooCommerce returned an error page.`
          );
        }

        // Parse the response JSON with detailed error handling
        const responseText = await response.text();
        let products;

        try {
          products = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[fetchProductBySlug] JSON Parse Error:", parseError);
          console.error(
            "[fetchProductBySlug] Response that failed to parse:",
            responseText.substring(0, 500)
          );
          throw new Error(
            `Failed to parse JSON response: ${
              parseError instanceof Error
                ? parseError.message
                : String(parseError)
            }`
          );
        }

        // WooCommerce returns an array even for a single slug, so we take the first item
        const product =
          Array.isArray(products) && products.length > 0 ? products[0] : null;

        if (product) {
          console.log(
            `[fetchProductBySlug] ✅ SUCCESS: Product fetched for slug: ${slug}`
          );
          return product;
        } else {
          console.warn(
            `[fetchProductBySlug] ⚠️ No product found for slug: ${slug} - this might be legitimate (product doesn't exist)`
          );
          return null; // This is OK - product genuinely doesn't exist
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.error(
          `[fetchProductBySlug] ❌ Attempt ${attempt}/${totalAttempts} failed for slug "${slug}":`,
          lastError.message
        );

        // If this is NOT the last attempt, wait before retrying
        if (attempt < totalAttempts) {
          // Exponential backoff with jitter to avoid thundering herd
          const delay =
            baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(
            `[fetchProductBySlug] ⏳ Retrying in ${Math.round(delay)}ms...`
          );
          await sleep(delay);
        }
      } finally {
        // Always clear the timeout, whether we succeeded or failed
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }

    // 🚨 ALL ATTEMPTS FAILED - THIS IS CRITICAL 🚨
    console.error(
      `[fetchProductBySlug] 🚨 CRITICAL FAILURE: All ${totalAttempts} attempts failed for slug: "${slug}"`
    );
    console.error(
      `[fetchProductBySlug] 🚨 BUILD WILL FAIL to prevent missing products!`
    );

    // Preserve the full error chain with cause - this is GOLD for debugging
    throw new Error(
      `CRITICAL BUILD FAILURE: Failed to fetch product "${slug}" after ${totalAttempts} attempts. This build cannot continue with missing products.`,
      { cause: lastError } // 🎯 This preserves the original error with full stack trace
    );
  });
};

// Helper function for build-time usage with MORE AGGRESSIVE retries
export const fetchProductBySlugForBuild = async (
  slug: string
): Promise<Product | null> => {
  return fetchProductBySlug(slug, {
    maxRetries: 5, // 6 total attempts for build stability
    timeoutMs: 45000, // 45 second timeout for build
    baseDelay: 2000, // 2 second base delay for build
  });
};

// 🛡️ ULTRA-SAFE BUILD VERSION - Use this if you're paranoid about build failures
export const fetchProductBySlugUltraSafe = async (
  slug: string
): Promise<Product | null> => {
  return fetchProductBySlug(slug, {
    maxRetries: 8, // 9 total attempts - very aggressive
    timeoutMs: 60000, // 1 minute timeout
    baseDelay: 3000, // 3 second base delay
  });
};

// 🚀 BONUS: Multiple products fetcher (useful for generateStaticParams)
export const fetchMultipleProducts = async (
  slugs: string[]
): Promise<(Product | null)[]> => {
  console.log(
    `[fetchMultipleProducts] 🎯 Fetching ${slugs.length} products with p-limit concurrency control`
  );

  // p-limit will automatically queue and run these one at a time
  const promises = slugs.map((slug) => fetchProductBySlugForBuild(slug));

  try {
    const results = await Promise.all(promises);
    const successCount = results.filter((r) => r !== null).length;
    console.log(
      `[fetchMultipleProducts] ✅ Success: ${successCount}/${slugs.length} products fetched`
    );
    return results;
  } catch (error) {
    console.error(
      `[fetchMultipleProducts] 🚨 FAILED - Build will halt to prevent missing products`
    );
    throw error;
  }
};

// --------------------------- FETCH PRODUCT BY SLUG ENDS ----------------------------------------------------------------

// --------------------------- FETCH PRODUCT VARIATIONS BY VARIATION IDs STARTS ------------------------------------------

import { WOOCOM_REST_GET_VARIATION_BY_ID } from "@/rest-api/products";
import { ProductVariation } from "@/types/product";
import { ACF_REST_OPTIONS } from "@/constants/apiEndpoints";

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

/**
 * 🎯 BULLETPROOF PRODUCT VARIATIONS FETCHER
 *
 * Fetches WooCommerce product variations by their IDs with:
 * - p-limit concurrency control (prevents API overload)
 * - Exponential backoff retry logic per variation
 * - Comprehensive error handling
 * - Build-safe failure modes
 *
 * Used for: Every single product page - variations data
 * Build Impact: CRITICAL - Product pages need variation data for pricing/options
 *
 * @param productId - WooCommerce product ID
 * @param variationIds - Array of variation IDs for this product
 * @param options - Retry configuration options
 * @returns Promise<ProductVariation[]> - Formatted variation data for UI
 */
export const fetchProductVariationsById = async (
  productId: number,
  variationIds: number[],
  options: RetryOptions = {}
): Promise<ProductVariation[]> => {
  const { maxRetries = 3, timeoutMs = 30000, baseDelay = 1000 } = options;

  console.log(
    `[fetchProductVariationsById] 🎯 Fetching ${variationIds.length} variations for product ${productId} with p-limit protection`
  );

  try {
    // 🚦 Each variation fetch is wrapped with p-limit + retry logic
    const variations = await Promise.all(
      variationIds.map(async (variationId) => {
        return limit(async () => {
          const totalAttempts = maxRetries + 1;
          let lastError: Error | null = null;

          for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            let timeoutId: NodeJS.Timeout | undefined;

            try {
              console.log(
                `[fetchProductVariationsById] Product ${productId} - Variation ${variationId} - Attempt ${attempt}/${totalAttempts}`
              );

              const url = WOOCOM_REST_GET_VARIATION_BY_ID(
                productId,
                variationId
              );

              // Create AbortController for timeout
              const controller = new AbortController();
              timeoutId = setTimeout(() => {
                console.warn(
                  `[fetchProductVariationsById] Request timeout after ${timeoutMs}ms for variation ${variationId}`
                );
                controller.abort();
              }, timeoutMs);

              const response = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "User-Agent": "NextJS-App/1.0",
                },
                signal: controller.signal,
                next: { revalidate: 60 },
              });

              // Check if response is ok
              if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                  const contentType = response.headers.get("content-type");
                  if (contentType?.includes("application/json")) {
                    const errorData = await response.json();
                    console.error(
                      `[fetchProductVariationsById] WooCommerce API Error for variation ${variationId}:`,
                      errorData
                    );
                    errorMessage += ` - ${JSON.stringify(errorData)}`;
                  } else {
                    const errorText = await response.text();
                    console.error(
                      `[fetchProductVariationsById] Non-JSON response for variation ${variationId}:`,
                      errorText.substring(0, 200)
                    );
                    errorMessage +=
                      " - Received non-JSON response (likely HTML error page)";
                  }
                } catch (parseError) {
                  console.error(
                    `[fetchProductVariationsById] Error parsing error response for variation ${variationId}:`,
                    parseError
                  );
                  errorMessage += " - Could not parse error response";
                }

                throw new Error(errorMessage);
              }

              // Validate content type before attempting to parse
              const contentType = response.headers.get("content-type");
              if (!contentType?.includes("application/json")) {
                const responseText = await response.text();
                console.error(
                  `[fetchProductVariationsById] Expected JSON but got for variation ${variationId}:`,
                  contentType
                );
                console.error(
                  `[fetchProductVariationsById] Response preview:`,
                  responseText.substring(0, 200)
                );
                throw new Error(
                  `Expected JSON response but got: ${contentType}. This usually means WooCommerce returned an error page.`
                );
              }

              // Parse the response JSON with detailed error handling
              const responseText = await response.text();
              let variation;

              try {
                variation = JSON.parse(responseText);
              } catch (parseError) {
                console.error(
                  `[fetchProductVariationsById] JSON Parse Error for variation ${variationId}:`,
                  parseError
                );
                console.error(
                  `[fetchProductVariationsById] Response that failed to parse:`,
                  responseText.substring(0, 500)
                );
                throw new Error(
                  `Failed to parse JSON response for variation ${variationId}: ${
                    parseError instanceof Error
                      ? parseError.message
                      : String(parseError)
                  }`
                );
              }

              // Format the variation data
              const formattedVariation: ProductVariation = {
                id: variation.id,
                price: variation.price,
                sale_price: variation.sale_price,
                regular_price: variation.regular_price,
                attributes: variation.attributes,
                stock_status: variation.stock_status,
                sku: variation.sku,
              };

              console.log(
                `[fetchProductVariationsById] ✅ SUCCESS: Variation ${variationId} fetched for product ${productId}`
              );

              return formattedVariation;
            } catch (error) {
              lastError =
                error instanceof Error ? error : new Error(String(error));

              console.error(
                `[fetchProductVariationsById] ❌ Product ${productId} - Variation ${variationId} - Attempt ${attempt}/${totalAttempts} failed:`,
                lastError.message
              );

              // If this is NOT the last attempt, wait before retrying
              if (attempt < totalAttempts) {
                const delay =
                  baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.log(
                  `[fetchProductVariationsById] ⏳ Retrying variation ${variationId} in ${Math.round(
                    delay
                  )}ms...`
                );
                await sleep(delay);
              }
            } finally {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
            }
          }

          // 🚨 ALL ATTEMPTS FAILED FOR THIS VARIATION
          console.error(
            `[fetchProductVariationsById] 🚨 CRITICAL FAILURE: All ${totalAttempts} attempts failed for variation ${variationId} of product ${productId}`
          );

          throw new Error(
            `CRITICAL BUILD FAILURE: Failed to fetch variation "${variationId}" for product "${productId}" after ${totalAttempts} attempts.`,
            { cause: lastError }
          );
        });
      })
    );

    const successCount = variations.length;
    console.log(
      `[fetchProductVariationsById] ✅ SUCCESS: ${successCount}/${variationIds.length} variations fetched for product ${productId}`
    );

    return variations;
  } catch (error) {
    console.error(
      `[fetchProductVariationsById] 🚨 CRITICAL BUILD FAILURE: Failed to fetch variations for product ${productId}`
    );
    console.error(
      `[fetchProductVariationsById] 🚨 BUILD WILL HALT to prevent missing variation data!`
    );
    throw error;
  }
};

// 🚀 BUILD-OPTIMIZED VERSION with more aggressive retries
export const fetchProductVariationsByIdForBuild = async (
  productId: number,
  variationIds: number[]
): Promise<ProductVariation[]> => {
  return fetchProductVariationsById(productId, variationIds, {
    maxRetries: 5, // 6 total attempts for build stability
    timeoutMs: 45000, // 45 second timeout
    baseDelay: 2000, // 2 second base delay
  });
};

// 🛡️ ULTRA-SAFE BUILD VERSION
export const fetchProductVariationsByIdUltraSafe = async (
  productId: number,
  variationIds: number[]
): Promise<ProductVariation[]> => {
  return fetchProductVariationsById(productId, variationIds, {
    maxRetries: 8, // 9 total attempts
    timeoutMs: 60000, // 1 minute timeout
    baseDelay: 3000, // 3 second base delay
  });
};

// --------------------------- FETCH PRODUCT VARIATIONS BY VARIATION IDs ENDS --------------------------------------------

// --------------------------- FETCH RELATED PRODUCT IDs STARTS ----------------------------------------------------------

/**
 * 🎯 BULLETPROOF RELATED PRODUCTS FETCHER
 *
 * Fetches multiple WooCommerce products by their IDs with:
 * - p-limit concurrency control (prevents API overload)
 * - Exponential backoff retry logic
 * - Comprehensive error handling
 * - Build-safe failure modes
 *
 * Used for: Related products, cross-sells, upsells
 * Build Impact: CRITICAL - Build fails if this fails (by design)
 *
 * @param productIds - Array of WooCommerce product IDs
 * @param options - Retry configuration options
 * @returns Promise<RelatedProduct[]> - Formatted product data for UI
 */

export const fetchRelatedProductsById = async (
  productIds: number[],
  options: RetryOptions = {}
): Promise<RelatedProduct[]> => {
  const { maxRetries = 3, timeoutMs = 30000, baseDelay = 1000 } = options;

  console.log(
    `[fetchRelatedProductsById] 🎯 Fetching ${productIds.length} related products with p-limit protection`
  );

  try {
    // 🚦 Each product fetch is wrapped with p-limit + retry logic
    const relatedProducts = await Promise.all(
      productIds.map(async (productId) => {
        return limit(async () => {
          const totalAttempts = maxRetries + 1;
          let lastError: Error | null = null;

          for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            let timeoutId: NodeJS.Timeout | undefined;

            try {
              console.log(
                `[fetchRelatedProductsById] Attempt ${attempt}/${totalAttempts} for product ID: ${productId}`
              );

              const url = WOOCOM_REST_GET_PRODUCT_BY_ID(productId);

              // Create AbortController for timeout
              const controller = new AbortController();
              timeoutId = setTimeout(() => {
                console.warn(
                  `[fetchRelatedProductsById] Request timeout after ${timeoutMs}ms for product ID: ${productId}`
                );
                controller.abort();
              }, timeoutMs);

              const response = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "User-Agent": "NextJS-App/1.0",
                },
                signal: controller.signal,
                next: { revalidate: 60 },
              });

              // Check if response is ok
              if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                  const contentType = response.headers.get("content-type");
                  if (contentType?.includes("application/json")) {
                    const errorData = await response.json();
                    console.error(
                      `[fetchRelatedProductsById] WooCommerce API Error for product ${productId}:`,
                      errorData
                    );
                    errorMessage += ` - ${JSON.stringify(errorData)}`;
                  } else {
                    const errorText = await response.text();
                    console.error(
                      `[fetchRelatedProductsById] Non-JSON response for product ${productId}:`,
                      errorText.substring(0, 200)
                    );
                    errorMessage +=
                      " - Received non-JSON response (likely HTML error page)";
                  }
                } catch (parseError) {
                  console.error(
                    `[fetchRelatedProductsById] Error parsing error response for product ${productId}:`,
                    parseError
                  );
                  errorMessage += " - Could not parse error response";
                }

                throw new Error(errorMessage);
              }

              // Validate content type before attempting to parse
              const contentType = response.headers.get("content-type");
              if (!contentType?.includes("application/json")) {
                const responseText = await response.text();
                console.error(
                  `[fetchRelatedProductsById] Expected JSON but got for product ${productId}:`,
                  contentType
                );
                console.error(
                  `[fetchRelatedProductsById] Response preview:`,
                  responseText.substring(0, 200)
                );
                throw new Error(
                  `Expected JSON response but got: ${contentType}. This usually means WooCommerce returned an error page.`
                );
              }

              // Parse the response JSON with detailed error handling
              const responseText = await response.text();
              let product;

              try {
                product = JSON.parse(responseText);
              } catch (parseError) {
                console.error(
                  `[fetchRelatedProductsById] JSON Parse Error for product ${productId}:`,
                  parseError
                );
                console.error(
                  `[fetchRelatedProductsById] Response that failed to parse:`,
                  responseText.substring(0, 500)
                );
                throw new Error(
                  `Failed to parse JSON response for product ${productId}: ${
                    parseError instanceof Error
                      ? parseError.message
                      : String(parseError)
                  }`
                );
              }

              // Format the data to return only necessary fields
              const relatedProduct: RelatedProduct = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price_html: product.price_html,
                image:
                  product.images[0]?.type === "video"
                    ? product.images[1]?.src
                    : product.images[0]?.src || "",
              };

              console.log(
                `[fetchRelatedProductsById] ✅ SUCCESS: Related product fetched for ID: ${productId}`
              );

              return relatedProduct;
            } catch (error) {
              lastError =
                error instanceof Error ? error : new Error(String(error));

              console.error(
                `[fetchRelatedProductsById] ❌ Attempt ${attempt}/${totalAttempts} failed for product ID ${productId}:`,
                lastError.message
              );

              // If this is NOT the last attempt, wait before retrying
              if (attempt < totalAttempts) {
                const delay =
                  baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.log(
                  `[fetchRelatedProductsById] ⏳ Retrying in ${Math.round(
                    delay
                  )}ms...`
                );
                await sleep(delay);
              }
            } finally {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
            }
          }

          // 🚨 ALL ATTEMPTS FAILED FOR THIS PRODUCT
          console.error(
            `[fetchRelatedProductsById] 🚨 CRITICAL FAILURE: All ${totalAttempts} attempts failed for product ID: ${productId}`
          );

          throw new Error(
            `CRITICAL BUILD FAILURE: Failed to fetch related product ID "${productId}" after ${totalAttempts} attempts.`,
            { cause: lastError }
          );
        });
      })
    );

    const successCount = relatedProducts.length;
    console.log(
      `[fetchRelatedProductsById] ✅ SUCCESS: ${successCount}/${productIds.length} related products fetched`
    );

    return relatedProducts;
  } catch (error) {
    console.error(
      `[fetchRelatedProductsById] 🚨 CRITICAL BUILD FAILURE: Failed to fetch related products`
    );
    console.error(
      `[fetchRelatedProductsById] 🚨 BUILD WILL HALT to prevent missing related products!`
    );
    throw error;
  }
};

// 🚀 BUILD-OPTIMIZED VERSION with more aggressive retries
export const fetchRelatedProductsByIdForBuild = async (
  productIds: number[]
): Promise<RelatedProduct[]> => {
  return fetchRelatedProductsById(productIds, {
    maxRetries: 5, // 6 total attempts for build stability
    timeoutMs: 45000, // 45 second timeout
    baseDelay: 2000, // 2 second base delay
  });
};

// 🛡️ ULTRA-SAFE BUILD VERSION
export const fetchRelatedProductsByIdUltraSafe = async (
  productIds: number[]
): Promise<RelatedProduct[]> => {
  return fetchRelatedProductsById(productIds, {
    maxRetries: 8, // 9 total attempts
    timeoutMs: 60000, // 1 minute timeout
    baseDelay: 3000, // 3 second base delay
  });
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
  const url = ACF_REST_OPTIONS;
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
      next: { revalidate: 60 }, // Cache the response for 60 seconds
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

const WOOCOM_REST_API_URL = WC_REST_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

/**
 * Fetches featured products from WooCommerce.
 * Used for the homepage featured section (e.g., "Top Picks").
 *
 * @returns {Promise<Product[]>} - Returns an array of featured products.
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    if (
      !WOOCOM_REST_API_URL ||
      !WOOCOM_CONSUMER_KEY ||
      !WOOCOM_CONSUMER_SECRET
    ) {
      throw new Error("Missing WooCommerce API credentials.");
    }

    // Build the request URL for featured products
    const url = `${WOOCOM_REST_API_URL}/products?featured=true&per_page=4&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;

    // Fetch featured products using ISR (revalidate every 60 sec)
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch featured products");
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("[fetchFeaturedProducts] Error:", error);
    return [];
  }
}

// --------------------------- FEATURED PRODUCTS FROM WOOCOM PRODUCTS ENDS ------------------------------------------------------------

// --------------------------- FETCH ALL PRODUCTS FOR HOW TO BLOXX PAGE STARTS ------------------------------------------------------------
/**
 * Fetches all products from WooCommerce by paginating through the API.
 * This function is used in the How-To page to collect all product video IDs
 * from the image gallery (where type === 'video') during the server-side render.
 * Uses ISR to keep the data fresh while avoiding runtime fetch delays.
 */

/**
 * Fetches all how-to video product data from the custom WP REST API endpoint.
 * This is used for the video selector on the How-To page and returns only name, slug, and videoId.
 */
import { HOW_TO_BLOXX_REST_URL } from "@/constants/apiEndpoints";
import { VideoOption } from "@/types/videos";
import { Category } from "@/types/category";

export async function fetchAllVideos(): Promise<VideoOption[]> {
  const res = await fetch(HOW_TO_BLOXX_REST_URL, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }, // Enable ISR
  });

  if (!res.ok) {
    throw new Error("Failed to fetch how-to product videos");
  }

  const data: VideoOption[] = await res.json();
  return data;
}

// --------------------------- FETCH ALL PRODUCTS FOR HOW TO BLOXX PAGE ENDS ------------------------------------------------------------
