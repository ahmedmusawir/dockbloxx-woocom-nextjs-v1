// --------------------------------------------
// WARRANTY POLICY: app/warranty-policy/page.tsx
// --------------------------------------------
import WarrantyPolicyContent from "./WarrantyRegistrationContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";
import WarrantyRegistrationContent from "./WarrantyRegistrationContent";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("warranty-policy");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Warranty Policy page content and embeds the Yoast JSON‑LD schema.
 */
export default async function WarrantyPolicyPage() {
  const yoast = await fetchYoastSEOJson("warranty-policy");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-warranty-policy"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <WarrantyRegistrationContent />
    </>
  );
}
