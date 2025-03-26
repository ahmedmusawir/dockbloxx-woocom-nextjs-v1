import { CheckoutData } from "@/types/checkout";
import { calculateCouponDiscount } from "./couponUtils";
import { CartItem } from "@/types/cart";

/**
 * Recalculates all checkout totals (subtotal, discount, shipping, total).
 * - Keeps the original coupon data intact (if present).
 * - Applies free shipping if coupon.free_shipping is true.
 */

export function updateCheckoutTotals(checkoutData: CheckoutData): CheckoutData {
  const { cartItems, coupon } = checkoutData;

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

  // 3) Determine shipping cost & method
  let shippingCost = 0;
  let shippingMethod = checkoutData.shippingMethod; // current fallback

  if (coupon?.free_shipping) {
    shippingMethod = "free_shipping";
    shippingCost = 0;
  } else {
    // your custom logic
    if (subtotal < 100) {
      shippingMethod = "flat_rate";
      shippingCost = 10;
    } else if (subtotal < 250) {
      shippingMethod = "flat_rate";
      shippingCost = 20;
    } else {
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
