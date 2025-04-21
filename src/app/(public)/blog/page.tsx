// --------------------------------------------
// BLOG: app/blog/page.tsx
// --------------------------------------------
import BlogPageContent from "./BlogPageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("blog");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Blog page content and embeds the Yoast JSON‑LD schema.
 */
export default async function BlogPage() {
  const yoast = await fetchYoastSEOJson("blog");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-blog"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <BlogPageContent />
    </>
  );
}
