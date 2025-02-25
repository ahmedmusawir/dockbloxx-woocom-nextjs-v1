const BASE_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

// Perform the check only on the server side
if (typeof window === "undefined") {
  if (!BASE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "Missing WooCommerce REST API credentials in environment variables."
    );
  }
}

export const WOOCOM_REST_GET_SHIPPING_OPTIONS =
  process.env.NEXT_PUBLIC_ACF_OPTIONS_REST_URL;

export const WOOCOM_REST_GET_ALL_COUPONS = `${BASE_URL}/coupons?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

export const WOOCOM_REST_GET_COUPON_BY_CODE = (couponCode: string) =>
  `${BASE_URL}/coupons?code=${couponCode}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

export const WOOCOM_REST_GET_SHIPPING_ZONES = `${BASE_URL}/shipping/zones?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

export const WOOCOM_REST_GET_SHIPPING_ZONE_LOCATIONS = (zoneId: number) =>
  `${BASE_URL}/shipping/zones/${zoneId}/locations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

export const WOOCOM_REST_GET_SHIPPING_METHODS_BY_ZONE = (zoneId: number) =>
  `${BASE_URL}/shipping/zones/${zoneId}/methods?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
