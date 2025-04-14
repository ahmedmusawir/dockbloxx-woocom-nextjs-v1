/**
 * Fetches home page data from the WordPress REST API using the Advanced Custom Fields (ACF) plugin.
 *
 * This function retrieves the ACF data for a specific page (ID: 12163) and extracts only the `acf` object
 * to be used in the Next.js frontend. The data includes structured content blocks such as titles, subtitles,
 * images, and rich text content.
 *
 * Environment Variables:
 * - `WP_REST_PAGES`: The base URL for fetching WordPress pages via REST API.
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

import { WP_REST_PAGES } from "@/constants/apiEndpoints";

export async function fetchHomePageData() {
  try {
    const response = await fetch(`${WP_REST_PAGES}?slug=app-home-page`, {
      next: { revalidate: 60 }, // Enables ISR, regenerates every 1 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch home page data");
    }

    const data = await response.json();
    // console.log("home page data", data[0].acf);
    return data[0].acf; // Extracting only the ACF fields
  } catch (error) {
    console.error("[fetchHomePageData] Error:", error);
    return null;
  }
}
