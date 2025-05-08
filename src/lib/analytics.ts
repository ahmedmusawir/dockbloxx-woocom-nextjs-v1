/**
 * /lib/analytics.ts
 *
 * Core tracking utility for GTM-based dataLayer events.
 * This file is responsible for pushing runtime events into
 * the `window.dataLayer` array, which is watched by Google Tag Manager.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent({ event: 'view_item', ... });
 */

export type DataLayerEvent = {
  event:
    | "view_item"
    | "add_to_cart"
    | "remove_from_cart"
    | "begin_checkout"
    | "purchase"
    | "user_signup"
    | "page_view"
    | string; // fallback for custom events
  [key: string]: any;
};

/**
 * Pushes a custom event to the GTM dataLayer
 * This only works in the browser and is ignored server-side.
 */
export const pushToDataLayer = (data: DataLayerEvent): void => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(data);
    console.debug("[GTM] dataLayer push:", data);
  } else {
    console.warn(
      "[GTM] Tried to push to dataLayer on the server. Ignored.",
      data
    );
  }
};

/**
 * Alias for pushToDataLayer — used for consistent event naming across hooks
 */
export const trackEvent = pushToDataLayer;
