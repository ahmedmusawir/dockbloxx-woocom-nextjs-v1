import { CheckoutData } from "@/types/checkout";
import { calculateCouponDiscount } from "./couponUtils";

/**
 * Recalculates all checkout totals (subtotal, discount, shipping, total).
 * - Keeps the original coupon data intact (if present).
 * - Applies free shipping if coupon.free_shipping is true.
 */
export function updateCheckoutTotals(checkoutData: CheckoutData): CheckoutData {
  const { cartItems, coupon } = checkoutData;

  // 1. Calculate new subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.basePrice * item.quantity;
    // Or item.price * item.quantity,
    // depending on your code's usage of "price" vs "basePrice"
  }, 0);

  // 2. Calculate discount (if a coupon is present)
  let discountTotal = 0;
  if (coupon) {
    discountTotal = calculateCouponDiscount(coupon, cartItems, subtotal);
  }

  // 3. Determine shipping cost
  //    If the coupon includes free shipping, shippingCost=0
  //    Otherwise, your custom logic based on subtotal
  let shippingCost = 0;
  if (coupon?.free_shipping) {
    shippingCost = 0;
  } else {
    // your custom logic
    if (subtotal < 100) {
      shippingCost = 10;
    } else if (subtotal < 250) {
      shippingCost = 20;
    } else {
      shippingCost = 35;
    }
  }

  // 4. Compute final total
  const total = subtotal + shippingCost - discountTotal;

  // 5. Return an updated CheckoutData object
  return {
    ...checkoutData,
    subtotal,
    discountTotal,
    shippingCost,
    total,
  };
}
