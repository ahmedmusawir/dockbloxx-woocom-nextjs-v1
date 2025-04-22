import { getApiUrl } from "@/lib/utils";

export const WC_REST_URL = getApiUrl("/wp-json/wc/v3");
export const ACF_REST_OPTIONS = getApiUrl("/wp-json/acf/v3/options/options");
export const WP_REST_PAGES = getApiUrl("/wp-json/wp/v2/pages");
export const WP_REST_POSTS = getApiUrl("/wp-json/wp/v2/posts");
export const WP_REST_PRODUCT_CATS = getApiUrl("/wp-json/wp/v2/product_cat");
export const DEALER_REST_COUPONS = getApiUrl("/wp-json/wp/v2/dealer_coupon");
export const GRAPHQL_ENDPOINT = getApiUrl("/graphql");
export const HOW_TO_BLOXX_REST_URL = getApiUrl(
  "/wp-json/dockbloxx/v1/product-videos"
);
