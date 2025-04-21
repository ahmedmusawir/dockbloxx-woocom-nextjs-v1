/**
 * Utility to fetch Yoast SEO meta from WordPress REST API by page slug.
 * Compatible with Next.js 15 App Router via generateMetadata().
 */

// lib/seoUtils.ts

import { WP_REST_PAGES, WP_REST_PRODUCT_CATS } from "@/constants/apiEndpoints";

/**
 * Fetch Yoast SEO JSON (yoast_head_json) for a given page slug.
 * Returns structured data, not raw HTML.
 */
export async function fetchYoastSEOJson(slug: string) {
  try {
    const url = `${WP_REST_PAGES}?slug=${slug}&per_page=1&_fields=yoast_head_json`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1‑hour ISR cache
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
      next: { revalidate: 3600 }, // 1‑hour ISR cache
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

// export async function fetchYoastSEOHead(slug: string) {
//   try {
//     const url = `${WP_BASE_URL}?slug=${slug}&_fields=yoast_head`;
//     const response = await fetch(url, {
//       // Server-only fetch config
//       cache: "force-cache", // static unless revalidated
//       next: { revalidate: 3600 }, // optional revalidation
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Yoast fetch failed for slug "${slug}": ${response.status}`
//       );
//     }

//     const data = await response.json();
//     const seo = data?.[0]?.yoast_head || null;

//     return seo;
//   } catch (error) {
//     console.error("[YoastSEO] Error:", error);
//     return null;
//   }
// }
