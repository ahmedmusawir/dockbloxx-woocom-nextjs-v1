/**
 * Fetches home page data from the WordPress REST API using the Advanced Custom Fields (ACF) plugin.
 *
 * This function retrieves the ACF data for a specific page (ID: 12163) and extracts only the `acf` object
 * to be used in the Next.js frontend. The data includes structured content blocks such as titles, subtitles,
 * images, and rich text content.
 *
 * Environment Variables:
 * - `NEXT_PUBLIC_WP_PAGES_REST_URL`: The base URL for fetching WordPress pages via REST API.
 *
 * Returns:
 * - `Promise<object | null>`: A promise that resolves to the ACF data object if successful, or `null` if an error occurs.
 *
 * Error Handling:
 * - Logs an error message if the fetch request fails or returns a non-OK response.
 * - Returns `null` if the API call is unsuccessful to prevent breaking the frontend.
 *
 * Usage Example:
 * ```ts
 * const homeData = await fetchHomePageData();
 * console.log(homeData);
 * ```
 */

import { Product } from "@/types/product";

const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL; // API URL

export async function fetchTestPageData(
  categorySlug: string
): Promise<Product[]> {
  try {
    const response = await fetch(
      `${NEXT_APP_URL}/api/products-by-category?category=${categorySlug}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch home page data");
    }

    const data = await response.json();
    return data.products; // Extracting only the ACF fields
  } catch (error) {
    console.error("[fetchCategoryPageData] Error:", error);
    return [];
  }
}
