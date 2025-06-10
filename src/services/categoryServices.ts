import { WC_REST_URL } from "@/constants/apiEndpoints";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

const WOOCOM_REST_API_URL = WC_REST_URL;
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
 * Fetches paginated products directly from WooCommerce for a specific category slug.
 * FOR CLIENT SIDE PAGINATION ITEM
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
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch products for ${categorySlug}`);
    }

    const data = await response.json();

    // map in the isDeal flag here
    const products: Product[] = (data.products || []).map((p: any) => ({
      ...p,
      isDeal: Array.isArray(p.categories)
        ? p.categories.some((cat: any) => cat.slug === "deals")
        : false,
    }));

    return {
      products,
      totalProducts: data.total || products.length,
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
export async function fetchCategoryProductsForHomePage(
  categorySlug: string
): Promise<Product[]> {
  try {
    if (
      !WOOCOM_REST_API_URL ||
      !WOOCOM_CONSUMER_KEY ||
      !WOOCOM_CONSUMER_SECRET
    ) {
      throw new Error("Missing WooCommerce API credentials.");
    }

    // Step 1: get category data
    const catUrl = `${WOOCOM_REST_API_URL}/products/categories?slug=${categorySlug}&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;
    const catResponse = await fetch(catUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // enabled ISR
    });

    if (!catResponse.ok) {
      throw new Error(`Failed to fetch category: ${categorySlug}`);
    }

    const categories: Category[] = await catResponse.json();
    if (!categories.length) {
      // Category doesn't exist
      return [];
    }

    const categoryId = categories[0].id;

    // Step 2: fetch products in that category BY MENU ORDER
    const productUrl = `${WOOCOM_REST_API_URL}/products?category=${categoryId}&per_page=4&orderby=menu_order&order=asc&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;

    // const productUrl = `${WOOCOM_REST_API_URL}/products?category=${categoryId}&per_page=4&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;

    const prodResponse = await fetch(productUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // enabled ISR
    });

    if (!prodResponse.ok) {
      throw new Error(`Failed to fetch products for category: ${categorySlug}`);
    }

    const products = await prodResponse.json();
    return products;
  } catch (error) {
    console.error("[fetchCategoryProductsForHomePage] Error:", error);
    return [];
  }
}
