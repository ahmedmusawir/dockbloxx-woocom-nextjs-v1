// --------------------------------------------
// REFUNDS & RETURNS: app/refund-returns/page.tsx
// --------------------------------------------
import RefundsPolicyContent from "./RefundsPolicyContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("refund-returns");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Refund & Returns policy page and embeds the Yoast JSON‑LD schema.
 */
export default async function RefundReturns() {
  const yoast = await fetchYoastSEOJson("refund-returns");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-refund-returns"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <RefundsPolicyContent />
    </>
  );
}
