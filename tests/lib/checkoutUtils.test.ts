/**
 * Unit tests for checkoutUtils.ts
 * Tests the checkout totals calculation, shipping logic, and discount application.
 */

import { updateCheckoutTotals } from "@/lib/checkoutUtils";
import { CheckoutData } from "@/types/checkout";
import { Coupon } from "@/types/coupon";
import { CartItem } from "@/types/cart";

// Helper function to create a minimal cart item
function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 123,
    name: "Test Product",
    slug: "test-product",
    price: 70,
    quantity: 1,
    image: "test.jpg",
    categories: [],
    basePrice: 70,
    variations: [],
    ...overrides,
  };
}

// Helper function to create minimal checkout data
function createCheckoutData(overrides: Partial<CheckoutData> = {}): CheckoutData {
  return {
    billing: {
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "US",
      email: "",
      phone: "",
    },
    shipping: {
      first_name: "",
      last_name: "",
      address_1: "123 street",
      address_2: "",
      city: "atlanta",
      state: "GA",
      postcode: "30004",
      country: "US",
      email: "",
      phone: "",
    },
    paymentMethod: "stripe",
    shippingMethod: "flat_rate",
    shippingCost: 0,
    cartItems: [createCartItem()],
    coupon: null,
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    total: 0,
    customerNote: "",
    ...overrides,
  };
}

describe("updateCheckoutTotals - Shipping Calculation", () => {
  test("subtotal < $100 gets $10 flat rate", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 70, quantity: 1 })],
      shippingMethod: "flat_rate",
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(70);
    expect(result.shippingMethod).toBe("flat_rate");
    expect(result.shippingCost).toBe(10);
    expect(result.total).toBe(80); // 70 + 10
  });

  test("subtotal $100-$249 gets $20 flat rate", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 150, quantity: 1 })],
      shippingMethod: "flat_rate",
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(150);
    expect(result.shippingMethod).toBe("flat_rate");
    expect(result.shippingCost).toBe(20);
    expect(result.total).toBe(170); // 150 + 20
  });

  test("subtotal $250-$299 gets $20 flat rate", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 275, quantity: 1 })],
      shippingMethod: "flat_rate",
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(275);
    expect(result.shippingMethod).toBe("flat_rate");
    expect(result.shippingCost).toBe(20);
    expect(result.total).toBe(295); // 275 + 20
  });

  test("subtotal >= $300 gets $35 flat rate", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 350, quantity: 1 })],
      shippingMethod: "flat_rate",
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(350);
    expect(result.shippingMethod).toBe("flat_rate");
    expect(result.shippingCost).toBe(35);
    expect(result.total).toBe(385); // 350 + 35
  });
});

describe("updateCheckoutTotals - Free Shipping Coupon", () => {
  test("coupon with free_shipping sets shipping to $0", () => {
    const coupon: Coupon = {
      id: 1,
      code: "FREESHIP",
      description: "Free shipping",
      discount_type: "fixed_cart",
      discount_value: 0,
      free_shipping: true, // ← This is the key!
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

    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 70, quantity: 1 })],
      shippingMethod: "flat_rate",
      coupon,
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.shippingMethod).toBe("free_shipping");
    expect(result.shippingCost).toBe(0);
    expect(result.total).toBe(70); // 70 + 0 shipping
  });

  test("removing free shipping coupon restores flat rate", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 70, quantity: 1 })],
      shippingMethod: "free_shipping", // Was free
      coupon: null, // Coupon removed
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.shippingMethod).toBe("flat_rate");
    expect(result.shippingCost).toBe(10);
    expect(result.total).toBe(80); // 70 + 10
  });
});

describe("updateCheckoutTotals - Local Pickup Preservation", () => {
  test("local_pickup is preserved when no coupon", () => {
    const checkoutData = createCheckoutData({
      cartItems: [createCartItem({ basePrice: 70, quantity: 1 })],
      shippingMethod: "local_pickup",
      coupon: null,
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.shippingMethod).toBe("local_pickup");
    expect(result.shippingCost).toBe(0);
    expect(result.total).toBe(70); // 70 + 0 shipping
  });
});

describe("updateCheckoutTotals - Per-Product Percentage Discount", () => {
  test("90% discount on single product calculates correctly", () => {
    const coupon: Coupon = {
      id: 2,
      code: "MOOSE10",
      description: "90% off Dog Bloxx",
      discount_type: "fixed_product",
      discount_value: 0,
      free_shipping: true,
      min_spend: "0",
      max_spend: "0",
      products_included: [2733], // Dog Bloxx ID
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

    const checkoutData = createCheckoutData({
      cartItems: [
        createCartItem({
          id: 2733,
          basePrice: 119,
          quantity: 1,
          discountApplied: 0,
        }),
      ],
      coupon,
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(119);
    expect(result.discountTotal).toBeCloseTo(107.1, 1); // 90% of 119
    expect(result.shippingCost).toBe(0); // Free shipping
    expect(result.total).toBeCloseTo(11.9, 1); // 119 - 107.1 + 0
  });

  test("discount only applies to included products", () => {
    const coupon: Coupon = {
      id: 3,
      code: "MOOSE10",
      description: "90% off Dog Bloxx only",
      discount_type: "fixed_product",
      discount_value: 0,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [2733], // Only Dog Bloxx
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

    const checkoutData = createCheckoutData({
      cartItems: [
        createCartItem({
          id: 2733,
          name: "Dog Bloxx",
          basePrice: 119,
          quantity: 1,
        }),
        createCartItem({
          id: 9999,
          name: "Other Product",
          basePrice: 50,
          quantity: 1,
        }),
      ],
      coupon,
    });

    const result = updateCheckoutTotals(checkoutData);

    expect(result.subtotal).toBe(169); // 119 + 50
    expect(result.discountTotal).toBeCloseTo(107.1, 1); // Only 90% of 119
    expect(result.shippingCost).toBe(20); // $169 subtotal gets $20 shipping
    expect(result.total).toBeCloseTo(81.9, 1); // 169 - 107.1 + 20 shipping
  });
});
