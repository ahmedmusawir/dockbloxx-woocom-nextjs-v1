import {
  WP_REST_PAGES,
  WP_REST_PRODUCT_CATS,
  WP_REST_POSTS,
} from "@/constants/apiEndpoints";

/**
 * Utility to fetch Yoast SEO meta from WordPress REST API by page slug.
 * Compatible with Next.js 15 App Router via generateMetadata().
 */

/**
 * Fetch Yoast SEO JSON (yoast_head_json) for a given page slug.
 * Returns structured data, not raw HTML.
 */
export async function fetchYoastSEOJson(slug: string) {
  try {
    const url = `${WP_REST_PAGES}?slug=${slug}&per_page=1&_fields=yoast_head_json`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // 1 minit
    });

    if (!res.ok) {
      throw new Error(`Yoast fetch failed for slug "${slug}": ${res.status}`);
    }

    const [page] = await res.json();
    return page?.yoast_head_json ?? null;
  } catch (err) {
    console.error("[YoastSEO JSON] ", err);
    return null;
  }
}

// --------------------------------------------
// services/seoService.ts
// --------------------------------------------

import { WC_REST_URL } from "@/constants/apiEndpoints";

// WooCommerce REST API credentials and endpoint
const WOOCOM_REST_API_URL = WC_REST_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

/**
 * Fetch Yoast SEO JSON for a single product by its slug.
 *
 * This function hits the WooCommerce REST API with basic authentication
 * and retrieves only the `yoast_head_json` field for the product.
 * It returns the schema or null if not found.
 *
 * @param slug - The WooCommerce product slug
 * @returns Parsed Yoast SEO JSON or null
 */
export async function fetchProductSEOBySlug(slug: string) {
  try {
    const response = await fetch(
      `${WOOCOM_REST_API_URL}/products?slug=${slug}&_fields=yoast_head_json`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${WOOCOM_CONSUMER_KEY}:${WOOCOM_CONSUMER_SECRET}`
            ).toString("base64"),
        },
        // Enable Incremental Static Regeneration — 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch SEO for product slug: ${slug}`);
    }

    const [product] = await response.json();
    return product?.yoast_head_json ?? null;
  } catch (error) {
    console.error("[fetchProductSEOBySlug] Error:", error);
    return null;
  }
}

/**
 * Fetches the Yoast SEO JSON data for a single blog post
 * using the WordPress REST API and post slug.
 *
 * @param slug - The slug of the WordPress blog post
 * @returns Parsed Yoast SEO JSON or null if not found
 */
export async function fetchPostSEOBySlug(slug: string) {
  try {
    const response = await fetch(
      `${WP_REST_POSTS}?slug=${slug}&_fields=yoast_head_json`,
      {
        next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Yoast SEO for blog post: ${slug}`);
    }

    const [post] = await response.json();
    return post?.yoast_head_json ?? null;
  } catch (error) {
    console.error("[YoastSEO BlogPost] Error:", error);
    return null;
  }
}

/**
 * Fetches Yoast SEO data (yoast_head_json) for a given WooCommerce product category.
 * Uses the category slug to query the WordPress REST API.
 *
 * Typically used for dynamic category pages like /shop/accessories, /shop/deals, etc.
 *
 * @param slug - The category slug to query (e.g. "accessories", "deals")
 * @returns Parsed yoast_head_json object or null if unavailable
 */
export async function fetchYoastCategorySEOJson(slug: string) {
  try {
    const url = `${WP_REST_PRODUCT_CATS}?slug=${slug}&per_page=1&_fields=yoast_head_json`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // 1‑hour ISR cache
    });

    if (!res.ok) {
      throw new Error(
        `Yoast category fetch failed for slug "${slug}": ${res.status}`
      );
    }

    const [term] = await res.json();
    return term?.yoast_head_json ?? null;
  } catch (err) {
    console.error("[YoastSEO Category JSON] ", err);
    return null;
  }
}

// Fixes URL to the production url https://dockbloxx.com
export function fixUrl(url: string): string {
  if (!url) return "";

  // Utility to dynamically fix Yoast URLs based on backend
  const BACKEND_URLS = [
    "https://dockbloxx.mystagingwebsite.com",
    "https://dbp.dockbloxx.com",
  ];

  // Our public frontend URL
  const FRONTEND_URL = "https://dockbloxx.com";

  let fixedUrl = url;
  BACKEND_URLS.forEach((backendUrl) => {
    fixedUrl = fixedUrl.replaceAll(backendUrl, FRONTEND_URL);
  });
  return fixedUrl;
}
