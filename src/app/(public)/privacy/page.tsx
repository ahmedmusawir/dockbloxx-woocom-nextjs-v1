// --------------------------------------------
// PRIVACY POLICY: app/privacy-policy/page.tsx
// --------------------------------------------
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("privacy-policy");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Privacy Policy page content and embeds the Yoast JSON‑LD schema.
 */
export default async function Privacy() {
  const yoast = await fetchYoastSEOJson("privacy-policy");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-privacy-policy"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <PrivacyPolicyContent />
    </>
  );
}
