/**
 * Unit tests for couponUtils.ts
 * Tests the coupon validation and parsing logic we fixed yesterday.
 */

import {
  parseCouponMeta,
  isCouponExpiredByTimezone,
  validateCoupon,
} from "@/lib/couponUtils";
import { Coupon, CouponMeta } from "@/types/coupon";
import { CheckoutData } from "@/types/checkout";

describe("parseCouponMeta", () => {
  test("extracts percentPerProduct from meta_data", () => {
    const coupon: Coupon = {
      id: 1,
      code: "MOOSE10",
      description: "Test coupon",
      discount_type: "fixed_product",
      discount_value: 0,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [123],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "",
      meta_data: [
        { id: 1, key: "_dockbloxx_discount_percent_per_product", value: 90 },
      ],
    };

    const meta = parseCouponMeta(coupon);

    expect(meta.percentPerProduct).toBe(90);
  });

  test("extracts timezone from bracketed format", () => {
    const coupon: Coupon = {
      id: 2,
      code: "TEST",
      description: "Test coupon",
      discount_type: "percent",
      discount_value: 10,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "",
      meta_data: [
        { id: 2, key: "_expiry_timezone", value: "[UTC-05:00] America/New_York" },
      ],
    };

    const meta = parseCouponMeta(coupon);

    expect(meta.expiryTimezone).toBe("America/New_York");
  });

  test("returns empty object if meta_data is missing", () => {
    const coupon: Coupon = {
      id: 3,
      code: "NOMETA",
      description: "Test coupon",
      discount_type: "fixed_cart",
      discount_value: 5,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "",
      meta_data: [],
    };

    const meta = parseCouponMeta(coupon);

    expect(meta).toEqual({});
  });
});

describe("isCouponExpiredByTimezone", () => {
  test("returns false if no expiry date is set", () => {
    const coupon: Coupon = {
      id: 4,
      code: "NOEXPIRY",
      description: "Test coupon",
      discount_type: "percent",
      discount_value: 10,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "", // No expiry
      meta_data: [],
    };
    const meta: CouponMeta = {
      expiryTimezone: "America/New_York",
    };

    const isExpired = isCouponExpiredByTimezone(coupon, meta);

    expect(isExpired).toBe(false);
  });

  test("returns false if today is the expiry date (valid until end of day)", () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const coupon: Coupon = {
      id: 5,
      code: "TODAYEXPIRY",
      description: "Test coupon",
      discount_type: "percent",
      discount_value: 10,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: today, // Expires today
      meta_data: [],
    };
    const meta: CouponMeta = {
      expiryTime: "23:59", // End of day
      expiryTimezone: "America/New_York",
    };

    const isExpired = isCouponExpiredByTimezone(coupon, meta);

    expect(isExpired).toBe(false); // Still valid until end of day
  });

  test("returns true if expiry date is in the past", () => {
    const coupon: Coupon = {
      id: 6,
      code: "EXPIRED",
      description: "Test coupon",
      discount_type: "percent",
      discount_value: 10,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "2020-01-01", // Way in the past
      meta_data: [],
    };
    const meta: CouponMeta = {
      expiryTime: "23:59",
      expiryTimezone: "America/New_York",
    };

    const isExpired = isCouponExpiredByTimezone(coupon, meta);

    expect(isExpired).toBe(true);
  });
});
