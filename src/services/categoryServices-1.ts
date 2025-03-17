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
    const response = await fetch(
      `${NEXT_APP_URL}/api/product-by-category?category=${categorySlug}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products for ${categorySlug}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`[Service] Error fetching ${categorySlug} products:`, error);
    return [];
  }
}
