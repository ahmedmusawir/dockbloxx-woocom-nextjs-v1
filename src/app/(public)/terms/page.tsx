// --------------------------------------------
// TERMS: app/terms/page.tsx
// --------------------------------------------
import TermsPolicyContent from "./TermsPolicyContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("terms");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Terms page content and embeds the Yoast JSON‑LD schema.
 */
export default async function Terms() {
  const yoast = await fetchYoastSEOJson("terms");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-terms"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <TermsPolicyContent />
    </>
  );
}
