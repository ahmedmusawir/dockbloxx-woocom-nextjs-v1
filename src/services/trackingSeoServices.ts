// --------------------------------------------
// /services/trackingSeoServices.ts
// --------------------------------------------

import { ACF_REST_OPTIONS } from "@/constants/apiEndpoints";

/**
 * Fetch tracking scripts from the ACF Options API.
 * Used globally in the layout.tsx file to inject
 * marketing and analytics snippets.
 *
 * ISR: Cache for 60 seconds
 */
export async function fetchTrackingScripts() {
  try {
    const res = await fetch(ACF_REST_OPTIONS, {
      next: { revalidate: 60 }, // ISR cache: 60s
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch tracking scripts: ${res.status}`);
    }

    const json = await res.json();

    // console.log("[TRACKING SCRIPTS SERVICE]", json.acf);

    return {
      header: json.acf.tracking_scripts_header ?? null,
      body: json.acf.tracking_scripts_body ?? null,
    };
  } catch (error) {
    console.error("[fetchTrackingScripts] Error:", error);
    return {
      header: null,
      body: null,
    };
  }
}
