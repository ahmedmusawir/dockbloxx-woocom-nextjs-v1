import { Product } from "@/types/product";

const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL; // API URL

/**
 * Fetches products for a given category.
 * Used for category sections on the homepage.
 *
 * @param {string} categorySlug - The category slug (e.g., "best-sellers")
 * @returns {Promise<Product[]>} - Returns an array of products.
 */

export async function fetchCategoryProducts(
  categorySlug: string
): Promise<Product[]> {
  try {
    const url = `${NEXT_APP_URL}/api/products-by-category?category=${categorySlug}`;
    // console.log("[Service] Fetching URL:", url); // Log the actual request

    const response = await fetch(url, {
      next: { revalidate: 600 }, // <-- ISR caching here
    });

    const data = await response.json(); // Read response as text first

    // console.log("[Service] Raw Response:", response.json()); // Log raw response

    if (!response.ok) {
      throw new Error(`Failed to fetch products for ${categorySlug}`);
    }

    return data.products || [];
  } catch (error) {
    console.error(`[Service] Error fetching ${categorySlug} products:`, error);
    return [];
  }
}
