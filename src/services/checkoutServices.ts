/**
 * Fetches the WooCommerce shipping options from ACF.
 * This includes flat rate thresholds and local pickup zip codes.
 *
 * Returns:
 * - `flat_rates`: Array of flat rate shipping costs based on subtotal thresholds.
 * - `local_pickup_zipcodes`: Array of zip codes eligible for local pickup.
 *
 * Example Response:
 * ```
 * {
 *   "flat_rates": [
 *     { "subtotal_threshold": 100, "shipping_cost": 10 },
 *     { "subtotal_threshold": 250, "shipping_cost": 20 },
 *     { "subtotal_threshold": 500, "shipping_cost": 35 }
 *   ],
 *   "local_pickup_zipcodes": ["30501", "30507", "30503", "30566", "30506"]
 * }
 * ```
 */
import { WOOCOM_REST_GET_SHIPPING_OPTIONS } from "@/rest-api/checkout";

export const fetchShippingOptions = async (): Promise<any> => {
  try {
    const response = await fetch(WOOCOM_REST_GET_SHIPPING_OPTIONS || "");
    if (!response.ok) throw new Error("Failed to fetch shipping options");

    const result = await response.json();
    const data = result.acf;

    // console.log("ACF data [checkoutServices.ts]", data);

    return {
      flat_rates: [
        {
          subtotal_threshold: Number(data.flat_rate_1_threshold),
          shipping_cost: Number(data.flat_rate_1_cost),
        },
        {
          subtotal_threshold: Number(data.flat_rate_2_threshold_max),
          shipping_cost: Number(data.flat_rate_2_cost),
        },
        {
          subtotal_threshold: Number(data.flat_rate_3_threshold),
          shipping_cost: Number(data.flat_rate_3_cost),
        },
      ],
      local_pickup_zipcodes: data.local_pickup_zipcodes.map(
        (item: { zip_code: string }) => item.zip_code
      ),
      is_free_shipping_for_local: data.is_free_shipping_for_local_pickup,
    };
    // return result.acf;
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    return null;
  }
};

/**
 * Fetches all available WooCommerce coupons via the REST API.
 *
 * This function retrieves the full list of coupons from WooCommerce and transforms
 * the raw API response into a structured `Coupon` format for easy use within the application.
 *
 * - Performs a `fetch` request to the WooCommerce REST API endpoint for coupons.
 * - Ensures the response is valid and throws an error if the request fails.
 * - Maps and transforms the API response into a standardized `Coupon` object structure.
 * - Parses discount values as floats to ensure numerical operations are possible.
 * - Extracts relevant coupon properties, including:
 *   - `id`: Unique identifier for the coupon.
 *   - `code`: The coupon code entered by users.
 *   - `description`: A brief explanation of the coupon.
 *   - `discount_type`: Defines how the discount is applied (`fixed_cart`, `percent`, `fixed_product`).
 *   - `discount_value`: The discount amount parsed as a number.
 *   - `free_shipping`: Boolean indicating if the coupon enables free shipping.
 *   - `min_spend` & `max_spend`: Minimum and maximum cart values required for the coupon.
 *   - `products_included` & `products_excluded`: Specific product IDs that the coupon applies to or excludes.
 *   - `categories_included` & `categories_excluded`: Categories that are eligible or restricted.
 *   - `usage_limit`: Total number of times the coupon can be used.
 *   - `usage_limit_per_user`: Number of times a single user can use the coupon.
 *   - `expires_on`: Expiration date of the coupon.
 *
 * @returns {Promise<Coupon[]>} A promise resolving to an array of structured coupon objects.
 * @throws {Error} Logs an error if the API request fails and returns an empty array.
 */
import { WOOCOM_REST_GET_ALL_COUPONS } from "@/rest-api/checkout";

export const fetchAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const response = await fetch(WOOCOM_REST_GET_ALL_COUPONS);
    if (!response.ok) throw new Error("Failed to fetch coupons");

    const coupons = await response.json();

    // Transforming coupon data into a structured format
    return coupons.map((coupon: any) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.amount),
      free_shipping: coupon.free_shipping,
      min_spend: coupon.minimum_amount,
      max_spend: coupon.maximum_amount,
      products_included: coupon.product_ids || [],
      products_excluded: coupon.excluded_product_ids || [],
      categories_included: coupon.product_categories || [],
      categories_excluded: coupon.excluded_product_categories || [],
      usage_limit: coupon.usage_limit,
      usage_limit_per_user: coupon.usage_limit_per_user,
      expires_on: coupon.date_expires,
    }));
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

/**
 * Fetches a WooCommerce coupon by its code.
 * Makes a real-time API request to check if the coupon is valid.
 *
 * @param {string} couponCode - The coupon code entered by the user.
 * @returns {Promise<Coupon | null>} - Returns the formatted coupon data if found, otherwise null.
 */
const NEXT_API_URL = process.env.NEXT_PUBLIC_APP_URL;

export const fetchCouponByCode = async (
  couponCode: string
): Promise<Coupon | null> => {
  try {
    if (!NEXT_API_URL) {
      console.error("Missing NEXT_PUBLIC_APP_URL in environment variables");
      return null;
    }

    const response = await fetch(
      `${NEXT_API_URL}/api/get-coupon-by-code?code=${couponCode}`
    );

    if (!response.ok) {
      console.warn(`Coupon not found or invalid: ${couponCode}`);
      return null;
    }

    const rawCoupon = await response.json();
    const coupon = rawCoupon[0];
    console.log("coupon [checkoutServices.ts]", coupon);

    if (!coupon) return null;

    // Transform data into structured format
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.amount),
      free_shipping: coupon.free_shipping,
      min_spend: coupon.minimum_amount,
      max_spend: coupon.maximum_amount,
      products_included: coupon.product_ids || [],
      products_excluded: coupon.excluded_product_ids || [],
      categories_included: coupon.product_categories || [],
      categories_excluded: coupon.excluded_product_categories || [],
      usage_limit: coupon.usage_limit,
      usage_count: coupon.usage_count, // NEW: Track how many times the coupon has been used
      usage_limit_per_user: coupon.usage_limit_per_user,
      used_by: coupon.used_by || [], // NEW: Track which users have used the coupon
      expires_on: coupon.date_expires,
    };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return null;
  }
};

/**
 * Fetches all WooCommerce shipping zones.
 *
 * Shipping zones determine available shipping methods based on customer location.
 *
 * Returns:
 * - Array of shipping zones, each containing:
 *   - `id`: Unique identifier for the zone.
 *   - `name`: Zone name (e.g., "Local", "Free Shipping Promo").
 *   - `order`: Priority order of the zone.
 *
 * Example Response:
 * ```
 * [
 *   { "id": 1, "name": "Local", "order": 0 },
 *   { "id": 2, "name": "Free Shipping Promo", "order": 0 }
 * ]
 * ```
 */
import { WOOCOM_REST_GET_SHIPPING_ZONES } from "@/rest-api/checkout";

export const fetchShippingZones = async (): Promise<any[]> => {
  try {
    const response = await fetch(WOOCOM_REST_GET_SHIPPING_ZONES);
    if (!response.ok) throw new Error("Failed to fetch shipping zones");

    const data = await response.json();
    return data.map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      order: zone.order,
    }));
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return [];
  }
};

/**
 * Fetches shipping methods for a given WooCommerce shipping zone.
 *
 * Shipping methods define how orders are delivered within a zone.
 *
 * Parameters:
 * - `zoneId`: The ID of the shipping zone (e.g., Local, Free Shipping Promo).
 *
 * Returns:
 * - Array of shipping methods, each containing:
 *   - `id`: Unique method ID.
 *   - `instance_id`: Instance of the method.
 *   - `title`: Display name of the method.
 *   - `method_id`: Identifier (e.g., "flat_rate", "free_shipping").
 *   - `cost`: (If applicable) Cost of this shipping method.
 *
 * Example Response:
 * ```
 * [
 *   {
 *     "id": 6,
 *     "instance_id": 6,
 *     "title": "Free Shipping",
 *     "method_id": "free_shipping",
 *     "cost": "0.00"
 *   },
 *   {
 *     "id": 7,
 *     "instance_id": 7,
 *     "title": "Flat Rate",
 *     "method_id": "flat_rate",
 *     "cost": "9.99"
 *   }
 * ]
 * ```
 */
import { WOOCOM_REST_GET_SHIPPING_METHODS_BY_ZONE } from "@/rest-api/checkout";
import { CheckoutData } from "@/types/checkout";
import { Coupon } from "@/types/coupon";

export const fetchShippingMethodsByZone = async (
  zoneId: number
): Promise<any[]> => {
  try {
    const response = await fetch(
      WOOCOM_REST_GET_SHIPPING_METHODS_BY_ZONE(zoneId)
    );
    if (!response.ok)
      throw new Error(`Failed to fetch shipping methods for zone ${zoneId}`);

    const data = await response.json();
    return data.map((method: any) => ({
      id: method.id,
      instance_id: method.instance_id,
      title: method.title,
      method_id: method.method_id,
      cost: method.settings?.cost?.value || "0.00",
    }));
  } catch (error) {
    console.error(`Error fetching shipping methods for zone ${zoneId}:`, error);
    return [];
  }
};
