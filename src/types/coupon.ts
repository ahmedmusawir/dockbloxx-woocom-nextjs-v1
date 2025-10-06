type DiscountType = "fixed_cart" | "percent" | "fixed_product";

// NEW: Define the shape of a single meta data object
export interface CouponMetaData {
  id: number;
  key: string;
  value: any; // 'value' can be a string, array, or other types
}
export interface CouponMeta {
  percentPerProduct?: number;
  allowedEmails?: string[];
  expiryTime?: string;      // NEW: HH:MM format (e.g., "23:59")
  expiryTimezone?: string;  // NEW: IANA timezone (e.g., "America/New_York")
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number; // Note: This is the default value, not our custom one
  free_shipping: boolean;
  min_spend: string;
  max_spend: string;
  products_included: number[];
  products_excluded: number[];
  categories_included: number[];
  categories_excluded: number[];
  usage_limit: number | null;
  usage_count: number | null;
  usage_limit_per_user: number | null;
  used_by: string[];
  expires_on: string;
  // UPDATED: meta_data is an array of CouponMetaData objects
  meta_data: CouponMetaData[];
}
