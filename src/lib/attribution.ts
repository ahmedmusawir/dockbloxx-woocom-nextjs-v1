/**
 * Attribution Utility
 * Reads attribution data from sessionStorage (Coach's script)
 */

export interface AttributionData {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_keyword?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  coupon?: string | null;
  landing_page?: string | null;
  attribution_captured_at?: string | null;
}

/**
 * Reads attribution from sessionStorage.
 * Coach's script uses keys WITHOUT the 'dbx_' prefix.
 */
export function getAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    utm_source: sessionStorage.getItem('utm_source'),
    utm_medium: sessionStorage.getItem('utm_medium'),
    utm_campaign: sessionStorage.getItem('utm_campaign'),
    utm_content: sessionStorage.getItem('utm_content'),
    utm_keyword: sessionStorage.getItem('utm_keyword') || sessionStorage.getItem('utm_term'),
    gclid: sessionStorage.getItem('_cltk'), // Coach's script uses _cltk for click tracking
    fbclid: sessionStorage.getItem('fbclid'),
    coupon: sessionStorage.getItem('coupon'),
    landing_page: sessionStorage.getItem('landing_page'),
    attribution_captured_at: new Date().toISOString(), // Capture timestamp when read
  };
}

/**
 * Filters out null/undefined values from attribution object
 */
export function cleanAttribution(attribution: AttributionData): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attribution).filter(([_, v]) => v != null && v !== '')
  ) as Record<string, string>;
}