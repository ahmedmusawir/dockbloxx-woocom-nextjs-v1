/**
 * Recalculates all checkout totals (subtotal, discount, shipping, total).
 * - Keeps the original coupon data intact (if present).
 * - Applies free shipping if coupon.free_shipping is true.
 */

import { CheckoutData } from "@/types/checkout";
import { calculateCouponDiscount, parseCouponMeta } from "./couponUtils"; // Import our new parser
import { CartItem } from "@/types/cart";

/**
 * Recalculates all checkout totals (subtotal, discount, shipping, total).
 */
export function updateCheckoutTotals(checkoutData: CheckoutData): CheckoutData {
  const { coupon, shipping } = checkoutData;
  const initialShippingMethod = checkoutData.shippingMethod;

  // 1) Calculate new subtotal
  const subtotal = checkoutData.cartItems.reduce(
    (sum: number, item: CartItem) => {
      return sum + item.basePrice * item.quantity;
    },
    0
  );

  // Initialize variables
  let discountTotal = 0;
  // Create a mutable copy of cartItems to add our 'isFree' flag
  let updatedCartItems = [...checkoutData.cartItems].map((item) => ({
    ...item,
    isFree: false,
  }));

  // --- START: NEW LOGIC BLOCK FOR PHASE 3 ---

  if (coupon) {
    const meta = parseCouponMeta(coupon);

    // High-priority check for our custom per-product percentage discount
    // if (meta.percentPerProduct && coupon.products_included.length > 0) {
    // High-priority check for our custom per-product percentage discount
    if (
      typeof meta.percentPerProduct === "number" &&
      coupon.products_included.length > 0
    ) {
      // --- START: THE FIX ---
      // Create a new constant. TypeScript knows this is a 'number', not 'number | undefined'.
      const discountPercent = meta.percentPerProduct;
      // --- END: THE FIX ---

      discountTotal = updatedCartItems.reduce((acc, item) => {
        // Check if the current item is one of the coupon's designated products
        if (coupon.products_included.includes(item.id)) {
          const itemTotal = item.basePrice * item.quantity;

          // Use our new, guaranteed-to-be-a-number constant for the calculation
          const itemDiscount = (itemTotal * discountPercent) / 100;

          // Add the discount amount to the item itself
          item.discountApplied = itemDiscount;

          // If discount is 100%, flag the item as free for the UI
          if (discountPercent === 100) {
            item.isFree = true;
          }

          return acc + itemDiscount;
        }
        return acc;
      }, 0);
    } else {
      // Fallback to the original logic for all standard coupon types
      discountTotal = calculateCouponDiscount(
        coupon,
        updatedCartItems,
        subtotal
      );
    }
  }

  // --- END: NEW LOGIC BLOCK ---

  // 2.5) If no shipping address yet, force zero
  const hasAddress = Boolean(shipping.address_1 || shipping.postcode);
  if (!hasAddress) {
    return {
      ...checkoutData,
      cartItems: updatedCartItems, // Pass updated items through
      subtotal,
      discountTotal,
      shippingMethod: initialShippingMethod,
      shippingCost: 0,
      total: subtotal - discountTotal,
    };
  }

  // 3) Determine shipping cost & method (This logic remains untouched)
  let shippingCost = 0;
  let shippingMethod = checkoutData.shippingMethod;

  if (coupon?.free_shipping) {
    shippingMethod = "free_shipping";
    shippingCost = 0;
  } else if (checkoutData.shippingMethod === "local_pickup") {
    shippingMethod = "local_pickup";
    shippingCost = 0;
  } else if (checkoutData.shippingMethod === "free_shipping") {
    shippingMethod = "free_shipping";
    shippingCost = 0;
  } else {
    if (subtotal < 100) {
      shippingMethod = "flat_rate";
      shippingCost = 10;
    } else if (subtotal < 250) {
      shippingMethod = "flat_rate";
      shippingCost = 20;
    } else if (subtotal < 300) {
      shippingMethod = "flat_rate";
      shippingCost = 20;
    } else {
      shippingMethod = "flat_rate";
      shippingCost = 35;
    }
  }

  // 4) Compute final total
  const total = subtotal + shippingCost - discountTotal;

  // 5) Return the updated CheckoutData object
  return {
    ...checkoutData,
    cartItems: updatedCartItems, // IMPORTANT: Return the array with the 'isFree' flag
    subtotal,
    discountTotal,
    shippingMethod,
    shippingCost,
    total,
  };
}
