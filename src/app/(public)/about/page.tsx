// --------------------------------------------
// ABOUT: app/about/page.tsx
// --------------------------------------------
import AboutPageContent from "./AboutPageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("about");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the About page content and embeds the Yoast JSON‑LD schema.
 */
export default async function AboutPage() {
  const yoast = await fetchYoastSEOJson("about");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-about"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <AboutPageContent />
    </>
  );
}
