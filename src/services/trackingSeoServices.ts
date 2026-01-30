// src/services/trackingSeoServices.ts

import { ACF_REST_OPTIONS } from "@/constants/apiEndpoints";

export async function fetchTrackingScripts() {
  try {
    const res = await fetch(ACF_REST_OPTIONS, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch tracking scripts: ${res.status}`);
    }

    const json = await res.json();

    const header = json.acf.tracking_scripts_header ?? null;
    const body = json.acf.tracking_scripts_body ?? null;
    const footer = json.acf.coach_attribution_scripts_footer ?? null;

    // console.log("[TRACKING SCRIPTS SERVICE - HEADER]", header);
    // console.log("[TRACKING SCRIPTS SERVICE - BODY]", body);
    // console.log("[TRACKING SCRIPTS SERVICE - FOOTER (ATTRIBUTION)]", footer);

    return {
      header,
      body,
      footer,
    };
  } catch (error) {
    console.error("[fetchTrackingScripts] Error:", error);
    return {
      header: null,
      body: null,
      footer: null,
    };
  }
}