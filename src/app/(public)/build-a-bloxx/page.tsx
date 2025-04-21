import BuildABloxxPageContent from "./BuildABloxxPageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Next.js will execute this on the server and
 * inject the returned metadata into <head>.
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("build-a-bloxx"); // WP slug
  return mapYoastToMetadata(yoast);
}

export default async function BuildABloxxPage() {
  const yoast = await fetchYoastSEOJson("build-a-bloxx");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-build-a-bloxx"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <BuildABloxxPageContent />
    </>
  );
}
