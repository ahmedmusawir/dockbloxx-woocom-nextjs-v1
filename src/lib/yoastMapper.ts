// --------------------------------------------
// lib/yoastMapper.ts
// --------------------------------------------
import type { Metadata } from "next";
import { fixUrl } from "@/lib/seoUtils";

/**
 * Convert Yoast JSON (yoast_head_json) into a Next.js Metadata object.
 */
export function mapYoastToMetadata(yoast: any): Metadata {
  if (!yoast) return {};

  /* -------------------------------------------------
   * Build the “other” bucket (article:, video:, etc.)
   * ------------------------------------------------*/
  const extra: Record<string, string | number | (string | number)[]> = {};

  for (const [key, value] of Object.entries(yoast)) {
    if (/^(article|video|music|twitter):/i.test(key)) {
      extra[key] = Array.isArray(value)
        ? value.map(String)
        : typeof value === "number"
        ? value
        : String(value);
    }
  }

  /* --------------------------------------------
   * Return fully‑typed Metadata object
   * -------------------------------------------*/
  return {
    /* Core */
    title: yoast.title,
    description: yoast.description ?? yoast.og_description,

    /* Canonical & robots */
    alternates: { canonical: fixUrl(yoast.canonical) }, // fixed URL
    robots: {
      index: yoast.robots?.noindex !== "noindex",
      follow: yoast.robots?.nofollow !== "nofollow",
    },

    /* Open Graph */
    openGraph: {
      title: yoast.og_title,
      description: yoast.og_description,
      url: fixUrl(yoast.og_url), // fixed URL
      siteName: yoast.og_site_name,
      type: yoast.og_type,
      images: yoast.og_image?.map((i: any) => fixUrl(i.url)) ?? [], // fixed URL
      modifiedTime: yoast.article_modified_time,
    },

    /* Twitter */
    twitter: {
      card: yoast.twitter_card,
      title: yoast.twitter_title,
      description: yoast.twitter_description,
      images: yoast.twitter_image ? [fixUrl(yoast.twitter_image)] : undefined, // fixed URL
    },

    /* Everything else */
    other: extra,
  };
}
