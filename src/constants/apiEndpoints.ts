import { getApiUrl } from "@/lib/utils";

export const WC_REST_URL = getApiUrl("/wp-json/wc/v3");
export const ACF_REST_OPTIONS = getApiUrl("/wp-json/acf/v3/options/options");
export const WP_REST_PAGES = getApiUrl("/wp-json/wp/v2/pages");
export const DEALER_REST_COUPONS = getApiUrl("/wp-json/wp/v2/dealer_coupon");
export const GRAPHQL_ENDPOINT = getApiUrl("/graphql");
