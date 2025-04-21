// --------------------------------------------
// CONTACT: app/contact/page.tsx
// --------------------------------------------
import ContactUsContent from "./ContactUsContent";
import { fetchYoastSEOJson, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";
import Script from "next/script";

/**
 * Injects Yoast metadata from WordPress into <head>
 */
export async function generateMetadata() {
  const yoast = await fetchYoastSEOJson("contact");
  return mapYoastToMetadata(yoast);
}

/**
 * Loads the Contact page content and embeds the Yoast JSON‑LD schema.
 */
export default async function Contact() {
  const yoast = await fetchYoastSEOJson("contact");
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  return (
    <>
      {schema && (
        <Script
          id="yoast-schema-contact"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          strategy="beforeInteractive"
        />
      )}
      <ContactUsContent />
    </>
  );
}
