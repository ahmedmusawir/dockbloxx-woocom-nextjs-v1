type DiscountType = "fixed_cart" | "percent" | "fixed_product";

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  free_shipping: boolean;
  min_spend: string;
  max_spend: string;
  products_included: number[];
  products_excluded: number[];
  categories_included: number[];
  categories_excluded: number[];
  usage_limit: number | null; // NEW: Max times this coupon can be used
  usage_count: number | null; // NEW: Track how many times it's been used
  usage_limit_per_user: number | null; // NEW: Max times a single user can use it
  used_by: string[]; // NEW: Track which users have used the coupon
  expires_on: string;
}
