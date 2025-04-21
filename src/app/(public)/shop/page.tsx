// --------------------------------------------
// SHOP: app/shop/page.tsx
// --------------------------------------------
import ShopPageContent from "./ShopPageContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Next.js will execute this on the server and
 * inject the returned metadata into <head>.
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("shop"); // WP slug for the shop page
  return mapYoastToMetadata(yoast);
}

export default async function Shop() {
  // Fetch once more to pull the schema object
  const yoast = await fetchYoastSEOJson("shop");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema); // fix URLs inside the schema
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-shop"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <ShopPageContent />
    </>
  );
}
