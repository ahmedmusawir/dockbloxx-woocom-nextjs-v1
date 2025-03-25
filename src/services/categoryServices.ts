import { Category } from "@/types/category";
import { Product } from "@/types/product";

const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL; // API URL

const WOOCOM_REST_API_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

/**
 * Fetches all product categories from WooCommerce.
 * Used for building dynamic category filters and static paths.
 */
export async function getAllCategories(): Promise<Category[]> {
  if (!WOOCOM_REST_API_URL || !WOOCOM_CONSUMER_KEY || !WOOCOM_CONSUMER_SECRET) {
    throw new Error("Missing WooCommerce API credentials.");
  }

  const url = `${WOOCOM_REST_API_URL}/products/categories?per_page=100&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();
  return data;
}

/**
 * Fetches paginated products for a specific category slug.
 * Used in category-based shop pages.
 *
 * @param {string} categorySlug - The WooCommerce category slug
 * @param {number} page - Page number
 * @param {number} perPage - Products per page
 * @returns {Promise<{ products: Product[]; totalProducts: number }>} - Product list and total count
 */
export async function fetchCategoryProductsPaginated(
  categorySlug: string,
  page: number,
  perPage: number
): Promise<{ products: Product[]; totalProducts: number }> {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/products-by-category?category=${categorySlug}&page=${page}&perPage=${perPage}`;

    const response = await fetch(url, {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products for ${categorySlug}`);
    }

    const data = await response.json();
    return {
      products: data.products || [],
      totalProducts: data.total || data.products?.length || 0,
    };
  } catch (error) {
    console.error(
      `[Service] Error fetching products for category ${categorySlug}:`,
      error
    );
    return {
      products: [],
      totalProducts: 0,
    };
  }
}

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
