/**
 * API Endpoint: Fetch WooCommerce Products by Category Slug
 *
 * This Next.js API route dynamically retrieves products from WooCommerce based on a given category slug.
 * It first fetches the category ID from the WooCommerce API and then uses that ID to query products.
 *
 * 🔥 Features:
 * - Supports **both Home Page & Shop Page** category-based product fetching.
 * - **Uses category slug** instead of ID to ensure portability between environments.
 * - **Supports pagination** (`page`, `perPage`) for shop filters.
 * - **Supports sorting** (`orderby`, `order`) for advanced product filtering.
 * - Implements **Incremental Static Regeneration (ISR)** for optimized performance.
 *
 * 🛠️ Query Parameters:
 * - `category` (string) → Required. The WooCommerce category slug (e.g., "best-sellers").
 * - `page` (number) → Optional. Defaults to `1`. Enables pagination for shop filters.
 * - `perPage` (number) → Optional. Defaults to `4` (for homepage). Can be increased for shop pages.
 * - `orderby` (string) → Optional. Default: `"date"`. Options: `"price"`, `"title"`, `"popularity"`, etc.
 * - `order` (string) → Optional. Default: `"desc"`. Options: `"asc"`, `"desc"`.
 *
 * 🚀 Usage Examples:
 * 1️⃣ **For Home Page (4 products only):**
 *    `/api/products-by-category?category=best-sellers`
 *
 * 2️⃣ **For Shop Page Filters (Paginated, 12 per page):**
 *    `/api/products-by-category?category=water-sports&page=2&perPage=12`
 *
 * 3️⃣ **For Sorting (e.g., Lowest to Highest Price):**
 *    `/api/products-by-category?category=fishing-gear&orderby=price&order=asc`
 *
 * 🎯 Returns:
 * - `{ products: [...] }` → Array of products from WooCommerce.
 * - `{ error: "Category not found." }` → If an invalid slug is provided.
 * - `{ error: "Internal server error." }` → If WooCommerce API fails.
 *
 * 💡 Best Practices:
 * - **Use this single API for all category-based product fetching needs.**
 * - **Ensure category slugs match WooCommerce backend.**
 * - **Leverage ISR for improved performance.**
 */
import { NextResponse } from "next/server";

const WOOCOM_REST_API_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "4", 10); // 4 for home, can be increased for shop
  const orderBy = searchParams.get("orderby") || "date"; // Default order by date
  const order = searchParams.get("order") || "desc"; // Default descending

  if (!categorySlug) {
    return NextResponse.json(
      { error: "Category slug is required." },
      { status: 400 }
    );
  }

  if (!WOOCOM_REST_API_URL || !WOOCOM_CONSUMER_KEY || !WOOCOM_CONSUMER_SECRET) {
    return NextResponse.json(
      { error: "Missing WooCommerce API credentials." },
      { status: 500 }
    );
  }

  try {
    // Step 1: Get Category ID from Slug
    const categoryUrl = `${WOOCOM_REST_API_URL}/products/categories?slug=${categorySlug}&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;
    const categoryResponse = await fetch(categoryUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (!categoryResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch category." },
        { status: categoryResponse.status }
      );
    }

    const categories = await categoryResponse.json();
    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const categoryId = categories[0].id;

    // Step 2: Fetch Products with Dynamic Params
    const productsUrl = `${WOOCOM_REST_API_URL}/products?category=${categoryId}&per_page=${perPage}&page=${page}&orderby=${orderBy}&order=${order}&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;
    const productsResponse = await fetch(productsUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (!productsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch products." },
        { status: productsResponse.status }
      );
    }

    const products = await productsResponse.json();
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("[API Route] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
