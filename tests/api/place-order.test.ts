/**
 * Unit tests for place-order API route
 * Tests the transformation of checkout data into WooCommerce order format.
 * Specifically tests the custom coupon logic (coupon_lines vs fee_lines).
 */

import { CheckoutData } from "@/types/checkout";
import { Coupon } from "@/types/coupon";
import { CartItem } from "@/types/cart";

// Helper to create a minimal cart item
function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 2733,
    name: "Dog Bloxx",
    slug: "dog-bloxx",
    price: 119,
    quantity: 1,
    image: "dog-bloxx.jpg",
    categories: [],
    basePrice: 119,
    variations: [],
    discountApplied: 0,
    ...overrides,
  };
}

// Helper to create checkout data
function createCheckoutData(overrides: Partial<CheckoutData> = {}): CheckoutData {
  return {
    billing: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 street",
      address_2: "",
      city: "atlanta",
      state: "GA",
      postcode: "30004",
      country: "US",
      email: "test@example.com",
      phone: "4042181998",
    },
    shipping: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 street",
      address_2: "",
      city: "atlanta",
      state: "GA",
      postcode: "30004",
      country: "US",
      email: "test@example.com",
      phone: "4042181998",
    },
    paymentMethod: "stripe",
    shippingMethod: "flat_rate",
    shippingCost: 10,
    cartItems: [createCartItem()],
    coupon: null,
    subtotal: 119,
    discountTotal: 0,
    taxTotal: 0,
    total: 129,
    customerNote: "",
    ...overrides,
  };
}

// This function mimics the transformation logic in place-order/route.ts
function buildOrderData(checkoutData: CheckoutData) {
  const { parseCouponMeta } = require("@/lib/couponUtils");
  
  // Check if coupon is a custom per-product percentage type
  const isCustomCoupon = checkoutData.coupon 
    ? parseCouponMeta(checkoutData.coupon).percentPerProduct !== undefined
    : false;

  return {
    payment_method: checkoutData.paymentMethod,
    payment_method_title: "Online Payment",
    billing: checkoutData.billing,
    shipping: checkoutData.shipping,
    customer_note: checkoutData.customerNote,
    line_items: checkoutData.cartItems.map((item: any) => ({
      product_id: item.id,
      quantity: item.quantity,
      variation_id: item.variation_id || 0,
      meta_data: [
        {
          key: "variations",
          value: item.variations || [],
        },
        {
          key: "metadata",
          value: item.metadata || {},
        },
      ],
    })),
    shipping_lines: [
      {
        method_id: checkoutData.shippingMethod,
        method_title:
          checkoutData.shippingMethod === "free_shipping"
            ? "Free Shipping"
            : checkoutData.shippingMethod === "local_pickup"
            ? "Local Pickup"
            : "Flat Rate",
        total: checkoutData.shippingCost.toFixed(2),
      },
    ],
    // Only send coupon to WooCommerce if it's a STANDARD coupon type
    coupon_lines: checkoutData.coupon && !isCustomCoupon
      ? [
          {
            code: checkoutData.coupon.code,
            used_by: checkoutData.billing.email,
          },
        ]
      : [],
    // For custom coupons, add discount as a negative fee line
    fee_lines: checkoutData.coupon && isCustomCoupon && checkoutData.discountTotal > 0
      ? [
          {
            name: `Coupon: ${checkoutData.coupon.code}`,
            total: `-${checkoutData.discountTotal.toFixed(2)}`,
            tax_status: "none",
          },
        ]
      : [],
  };
}

describe("place-order API - Standard Coupon (QUICK10)", () => {
  test("standard cart discount goes to coupon_lines", () => {
    const coupon: Coupon = {
      id: 1,
      code: "QUICK10",
      description: "10% off cart",
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
      meta_data: [], // No custom meta = standard coupon
    };

    const checkoutData = createCheckoutData({
      coupon,
      discountTotal: 11.9,
      total: 117.1, // 119 - 11.9 + 10 shipping
    });

    const orderData = buildOrderData(checkoutData);

    // Standard coupon should go to coupon_lines
    expect(orderData.coupon_lines).toHaveLength(1);
    expect(orderData.coupon_lines[0].code).toBe("QUICK10");
    expect(orderData.coupon_lines[0].used_by).toBe("test@example.com");

    // Should NOT have fee_lines
    expect(orderData.fee_lines).toHaveLength(0);
  });
});

describe("place-order API - Custom Coupon (MOOSE10)", () => {
  test("custom per-product percentage goes to fee_lines", () => {
    const coupon: Coupon = {
      id: 2,
      code: "MOOSE10",
      description: "90% off Dog Bloxx",
      discount_type: "fixed_product",
      discount_value: 0,
      free_shipping: true,
      min_spend: "0",
      max_spend: "0",
      products_included: [2733],
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
      coupon,
      discountTotal: 107.1, // 90% of 119
      shippingCost: 0, // Free shipping
      total: 11.9, // 119 - 107.1 + 0
    });

    const orderData = buildOrderData(checkoutData);

    // Custom coupon should NOT go to coupon_lines
    expect(orderData.coupon_lines).toHaveLength(0);

    // Should have fee_lines with negative discount
    expect(orderData.fee_lines).toHaveLength(1);
    expect(orderData.fee_lines[0].name).toBe("Coupon: MOOSE10");
    expect(orderData.fee_lines[0].total).toBe("-107.10");
    expect(orderData.fee_lines[0].tax_status).toBe("none");
  });

  test("custom coupon with zero discount has no fee_lines", () => {
    const coupon: Coupon = {
      id: 3,
      code: "MOOSE10",
      description: "90% off Dog Bloxx",
      discount_type: "fixed_product",
      discount_value: 0,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [9999], // Different product, no discount
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
      coupon,
      discountTotal: 0, // No discount applied
      total: 129, // 119 + 10 shipping
    });

    const orderData = buildOrderData(checkoutData);

    // No coupon_lines
    expect(orderData.coupon_lines).toHaveLength(0);

    // No fee_lines (discount is 0)
    expect(orderData.fee_lines).toHaveLength(0);
  });
});

describe("place-order API - No Coupon", () => {
  test("no coupon means empty coupon_lines and fee_lines", () => {
    const checkoutData = createCheckoutData({
      coupon: null,
      discountTotal: 0,
      total: 129, // 119 + 10 shipping
    });

    const orderData = buildOrderData(checkoutData);

    expect(orderData.coupon_lines).toHaveLength(0);
    expect(orderData.fee_lines).toHaveLength(0);
  });
});

describe("place-order API - Fixed Product Discount (15BANJO)", () => {
  test("fixed_product discount goes to coupon_lines (WooCommerce native)", () => {
    const coupon: Coupon = {
      id: 4,
      code: "15BANJO",
      description: "$15 off Banjo Bloxx",
      discount_type: "fixed_product",
      discount_value: 15,
      free_shipping: true,
      min_spend: "0",
      max_spend: "0",
      products_included: [2733],
      products_excluded: [],
      categories_included: [],
      categories_excluded: [],
      usage_limit: null,
      usage_count: null,
      usage_limit_per_user: null,
      used_by: [],
      expires_on: "",
      meta_data: [], // No custom percentage
    };

    const checkoutData = createCheckoutData({
      cartItems: [
        createCartItem({
          id: 2733,
          name: "Banjo Bloxx",
          basePrice: 189,
          quantity: 1,
          discountApplied: 15,
        }),
      ],
      coupon,
      subtotal: 189,
      discountTotal: 15,
      shippingCost: 0, // Free shipping
      total: 174, // 189 - 15
    });

    const orderData = buildOrderData(checkoutData);

    // Should use coupon_lines (WooCommerce native)
    expect(orderData.coupon_lines).toHaveLength(1);
    expect(orderData.coupon_lines[0].code).toBe("15BANJO");
    expect(orderData.coupon_lines[0].used_by).toBe("test@example.com");

    // Should NOT use fee_lines
    expect(orderData.fee_lines).toHaveLength(0);
  });

  test("fixed_product with multiple items goes to coupon_lines", () => {
    const coupon: Coupon = {
      id: 4,
      code: "15BANJO",
      description: "$15 off Banjo Bloxx",
      discount_type: "fixed_product",
      discount_value: 15,
      free_shipping: false,
      min_spend: "0",
      max_spend: "0",
      products_included: [2733],
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
      cartItems: [
        createCartItem({
          id: 2733,
          name: "Banjo Bloxx",
          basePrice: 189,
          quantity: 2,
          discountApplied: 30, // $15 * 2
        }),
      ],
      coupon,
      subtotal: 378, // 189 * 2
      discountTotal: 30,
      shippingCost: 35,
      total: 383, // 378 - 30 + 35
    });

    const orderData = buildOrderData(checkoutData);

    expect(orderData.coupon_lines).toHaveLength(1);
    expect(orderData.coupon_lines[0].code).toBe("15BANJO");
    expect(orderData.fee_lines).toHaveLength(0);
  });
});
