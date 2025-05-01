// --------------------------------------------
// HOME: app/page.tsx
// --------------------------------------------
import HomePageContent from "./HomePageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Next.js will execute this on the server and
 * inject the returned metadata into <head>.
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("app-home-page"); // WP slug for homepage
  return mapYoastToMetadata(yoast);
}

export default async function Home() {
  // Fetch once more to pull the schema object
  const yoast = await fetchYoastSEOJson("home");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema); // fix URLs inside the schema
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-moose"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive" // ensures it lands early in HTML
        />
      )}
      <HomePageContent />
    </>
  );
}
