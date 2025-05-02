import { CheckoutData } from "@/types/checkout";
import { calculateCouponDiscount } from "./couponUtils";
import { CartItem } from "@/types/cart";

/**
 * Recalculates all checkout totals (subtotal, discount, shipping, total).
 * - Keeps the original coupon data intact (if present).
 * - Applies free shipping if coupon.free_shipping is true.
 */

export function updateCheckoutTotals(checkoutData: CheckoutData): CheckoutData {
  const { cartItems, coupon, shipping } = checkoutData;
  // Grab the initial method into its own variable
  const initialShippingMethod = checkoutData.shippingMethod;

  // 1) Calculate new subtotal
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
    return sum + item.basePrice * item.quantity;
    // Or item.price * item.quantity (depending on your code)
  }, 0);

  // 2) Calculate discount
  let discountTotal = 0;
  if (coupon) {
    discountTotal = calculateCouponDiscount(coupon, cartItems, subtotal);
  }

  // 2.5) If no shipping address yet, force zero
  const hasAddress = Boolean(shipping.address_1 || shipping.postcode);
  if (!hasAddress) {
    return {
      ...checkoutData,
      subtotal,
      discountTotal,
      shippingMethod: initialShippingMethod,
      shippingCost: 0, // override cost to zero
      total: subtotal - discountTotal,
    };
  }

  // 3) Determine shipping cost & method
  // 3) Determine shipping cost & method
  let shippingCost = 0;
  let shippingMethod = checkoutData.shippingMethod; // current fallback

  if (coupon?.free_shipping) {
    shippingMethod = "free_shipping";
    shippingCost = 0;
  } else if (checkoutData.shippingMethod === "local_pickup") {
    // honors Local Pickup selection
    shippingMethod = "local_pickup";
    shippingCost = 0;
  } else if (checkoutData.shippingMethod === "free_shipping") {
    shippingMethod = "free_shipping";
    shippingCost = 0;
  } else {
    // ─── tiered flat-rate logic ─────────────────────────
    if (subtotal < 100) {
      shippingMethod = "flat_rate";
      shippingCost = 10;
    } else if (subtotal < 250) {
      shippingMethod = "flat_rate";
      shippingCost = 20;
    } else if (subtotal < 300) {
      // keep using $20 for 250-299
      shippingMethod = "flat_rate";
      shippingCost = 20;
    } else {
      // ≥ 300 gets $35
      shippingMethod = "flat_rate";
      shippingCost = 35;
    }
  }

  // 4) Compute final total
  const total = subtotal + shippingCost - discountTotal;

  console.log("[updateCheckoutTotals] => returning:", {
    shippingMethod,
    shippingCost,
    total,
  });

  // 5) Return the updated CheckoutData object
  return {
    ...checkoutData,
    subtotal,
    discountTotal,
    shippingMethod,
    shippingCost,
    total,
  };
}
