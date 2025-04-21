// --------------------------------------------
// HOW‑TO: app/how-to/page.tsx
// --------------------------------------------
import HowToPageContent from "./HowToPageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("how-to");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the How-To page content and embeds the Yoast JSON‑LD schema.
 */
export default async function HowToPage() {
  const yoast = await fetchYoastSEOJson("how-to");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-how-to"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <HowToPageContent />
    </>
  );
}
