/**
 * Unit tests for useCheckoutStore.ts
 * Tests the Zustand checkout store logic: applying coupons, calculating totals, managing shipping.
 */

import { useCheckoutStore } from "@/store/useCheckoutStore";
import { CartItem } from "@/types/cart";
import { Coupon } from "@/types/coupon";

// Helper to create a test cart item
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
    ...overrides,
  };
}

// Helper to create a test coupon
function createCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    code: "TEST10",
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
    meta_data: [],
    ...overrides,
  };
}

// Reset store before each test
beforeEach(() => {
  useCheckoutStore.setState({
    checkoutData: {
      billing: {
        first_name: "Test",
        last_name: "User",
        address_1: "123 street",
        address_2: "",
        city: "atlanta",
        state: "GA",
        postcode: "30004",
        country: "US",
        email: "test@example.com", // ← Required for coupon validation!
        phone: "4042181998",
      },
      shipping: {
        first_name: "Test",
        last_name: "User",
        address_1: "123 street",
        address_2: "",
        city: "atlanta",
        state: "GA",
        postcode: "30004", // ← Required for coupon validation!
        country: "US",
        email: "test@example.com",
        phone: "4042181998",
      },
      paymentMethod: "stripe",
      shippingMethod: "flat_rate",
      shippingCost: 0,
      cartItems: [],
      coupon: null,
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      total: 0,
      customerNote: "",
    },
    enableRegistration: false,
  });
});

describe("useCheckoutStore - Basic Operations", () => {
  test("initial state has empty cart", () => {
    const { checkoutData } = useCheckoutStore.getState();

    expect(checkoutData.cartItems).toEqual([]);
    expect(checkoutData.coupon).toBeNull();
  });

  test("setCartItems updates checkout cart", () => {
    const items = [createCartItem({ id: 1 }), createCartItem({ id: 2 })];

    useCheckoutStore.getState().setCartItems(items);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.cartItems).toHaveLength(2);
  });

  test("setShippingMethod updates shipping method", () => {
    useCheckoutStore.getState().setShippingMethod("local_pickup", 0);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.shippingMethod).toBe("local_pickup");
  });
});

describe("useCheckoutStore - Apply Coupon", () => {
  test("applyCoupon updates checkout with coupon", () => {
    const coupon = createCoupon({ code: "SAVE10", free_shipping: true });
    const items = [createCartItem({ basePrice: 119, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().applyCoupon(coupon);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.coupon).not.toBeNull();
    expect(checkoutData.coupon?.code).toBe("SAVE10");
    expect(checkoutData.shippingMethod).toBe("free_shipping");
    expect(checkoutData.shippingCost).toBe(0);
  });

  test("applyCoupon with free_shipping sets shipping to free", () => {
    const coupon = createCoupon({ free_shipping: true });
    const items = [createCartItem({ basePrice: 70, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().applyCoupon(coupon);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.shippingMethod).toBe("free_shipping");
    expect(checkoutData.shippingCost).toBe(0);
  });

  test("applyCoupon with per-product discount calculates correctly", () => {
    const coupon = createCoupon({
      code: "MOOSE10",
      products_included: [2733],
      free_shipping: true,
      meta_data: [
        { id: 1, key: "_dockbloxx_discount_percent_per_product", value: 90 },
      ],
    });
    const items = [createCartItem({ id: 2733, basePrice: 119, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().applyCoupon(coupon);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.discountTotal).toBeCloseTo(107.1, 1); // 90% of 119
    expect(checkoutData.total).toBeCloseTo(11.9, 1); // 119 - 107.1 + 0 shipping
  });
});

describe("useCheckoutStore - Remove Coupon", () => {
  test("removeCoupon clears coupon and restores shipping", () => {
    const coupon = createCoupon({ free_shipping: true });
    const items = [createCartItem({ basePrice: 70, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().applyCoupon(coupon);
    
    // Verify coupon is applied
    expect(useCheckoutStore.getState().checkoutData.coupon).not.toBeNull();
    expect(useCheckoutStore.getState().checkoutData.shippingMethod).toBe("free_shipping");
    
    // Remove coupon
    useCheckoutStore.getState().removeCoupon();

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.coupon).toBeNull();
    expect(checkoutData.shippingMethod).toBe("flat_rate");
    expect(checkoutData.shippingCost).toBe(10); // $70 subtotal gets $10 shipping
    expect(checkoutData.discountTotal).toBe(0);
  });

  test("removeCoupon recalculates shipping (does not preserve previous method)", () => {
    const coupon = createCoupon({ free_shipping: true });
    const items = [createCartItem({ basePrice: 70, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().setShippingMethod("local_pickup", 0);
    useCheckoutStore.getState().applyCoupon(coupon);
    
    // Coupon should override to free_shipping
    expect(useCheckoutStore.getState().checkoutData.shippingMethod).toBe("free_shipping");
    
    // Remove coupon
    useCheckoutStore.getState().removeCoupon();

    const { checkoutData } = useCheckoutStore.getState();
    // After removing coupon, shipping recalculates based on subtotal
    // $70 subtotal → $10 flat_rate (not local_pickup)
    expect(checkoutData.shippingMethod).toBe("flat_rate");
    expect(checkoutData.shippingCost).toBe(10);
  });
});

describe("useCheckoutStore - Calculate Totals", () => {
  test("calculateTotals recalculates shipping based on subtotal", () => {
    const items = [createCartItem({ basePrice: 150, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().calculateTotals();

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.subtotal).toBe(150);
    expect(checkoutData.shippingCost).toBe(20); // $150 gets $20 shipping
    expect(checkoutData.total).toBe(170); // 150 + 20
  });

  test("calculateTotals with coupon applies discount", () => {
    const coupon = createCoupon({
      code: "MOOSE10",
      products_included: [2733],
      free_shipping: true,
      meta_data: [
        { id: 1, key: "_dockbloxx_discount_percent_per_product", value: 90 },
      ],
    });
    const items = [createCartItem({ id: 2733, basePrice: 119, quantity: 1 })];
    
    useCheckoutStore.getState().setCartItems(items);
    useCheckoutStore.getState().applyCoupon(coupon);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.subtotal).toBe(119);
    expect(checkoutData.discountTotal).toBeCloseTo(107.1, 1);
    expect(checkoutData.shippingCost).toBe(0); // Free shipping
    expect(checkoutData.total).toBeCloseTo(11.9, 1);
  });
});

describe("useCheckoutStore - Shipping Method Preservation", () => {
  test("flat_rate shipping calculates based on subtotal tiers", () => {
    // Test $10 tier (< $100)
    useCheckoutStore.getState().setCartItems([createCartItem({ basePrice: 70, quantity: 1 })]);
    expect(useCheckoutStore.getState().checkoutData.shippingCost).toBe(10);

    // Test $20 tier ($100-$249)
    useCheckoutStore.getState().setCartItems([createCartItem({ basePrice: 150, quantity: 1 })]);
    expect(useCheckoutStore.getState().checkoutData.shippingCost).toBe(20);

    // Test $35 tier (>= $300)
    useCheckoutStore.getState().setCartItems([createCartItem({ basePrice: 350, quantity: 1 })]);
    expect(useCheckoutStore.getState().checkoutData.shippingCost).toBe(35);
  });

  test("local_pickup always has $0 shipping", () => {
    useCheckoutStore.getState().setCartItems([createCartItem({ basePrice: 150, quantity: 1 })]);
    useCheckoutStore.getState().setShippingMethod("local_pickup", 0);

    const { checkoutData } = useCheckoutStore.getState();
    expect(checkoutData.shippingMethod).toBe("local_pickup");
    expect(checkoutData.shippingCost).toBe(0);
  });
});
