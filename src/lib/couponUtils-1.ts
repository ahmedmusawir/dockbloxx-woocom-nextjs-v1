/**
 * Utility functions for coupon validation and application in the checkout flow.
 * - Ensures valid coupon usage (expiry, conditions, restrictions).
 * - Applies discount based on coupon type.
 * - Adjusts shipping cost if free shipping is included.
 * - Recalculates cart totals after discount application.
 */

import { CheckoutData } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { Coupon } from "@/types/coupon";

/**
 * Validates a coupon based on expiry date, min/max spend, and product/category restrictions.
 * @param coupon - The coupon object from the available coupon list.
 * @param checkoutData - Current checkout state (cart, subtotal, shipping, etc.).
 * @returns {boolean} - Returns true if the coupon is valid, otherwise false.
 */
export const validateCoupon = (
  coupon: Coupon,
  checkoutData: CheckoutData
): { isValid: boolean; message: string } => {
  const now = new Date();
  const expiryDate = new Date(coupon.expires_on);

  // 1. Check if coupon is expired
  if (now > expiryDate) {
    console.warn("Coupon expired:", coupon.code);
    return { isValid: false, message: "This coupon has expired." };
  }

  // 2. Validate min/max spend requirements
  const subtotal = checkoutData.subtotal;
  const minSpend = parseFloat(coupon.min_spend);
  const maxSpend = parseFloat(coupon.max_spend);

  if (minSpend > 0 && subtotal < minSpend) {
    console.warn("Minimum spend not met for coupon:", coupon.code);
    return {
      isValid: false,
      message: `Your order must be at least $${minSpend.toFixed(
        2
      )} to use this coupon.`,
    };
  }
  if (maxSpend > 0 && subtotal > maxSpend) {
    console.warn("Maximum spend exceeded for coupon:", coupon.code);
    return {
      isValid: false,
      message: `This coupon can only be used on orders up to $${maxSpend.toFixed(
        2
      )}.`,
    };
  }

  // 3. Validate product/category restrictions
  const cartProductIds = checkoutData.cartItems.map((item) => item.id);
  const cartCategoryIds = checkoutData.cartItems.flatMap(
    (item) => item.categories
  );
  const cartCategoryIdsOnly = cartCategoryIds.map((category) => category.id);

  if (
    coupon.products_included.length > 0 &&
    !cartProductIds.some((id) => coupon.products_included.includes(id))
  ) {
    console.warn("Coupon not applicable to any cart items:", coupon.code);
    return {
      isValid: false,
      message: "This coupon is not valid for any items in your cart.",
    };
  }

  if (
    coupon.products_excluded.length > 0 &&
    cartProductIds.some((id) => coupon.products_excluded.includes(id))
  ) {
    console.warn("Coupon applies to excluded products:", coupon.code);
    return {
      isValid: false,
      message: "This coupon cannot be used with some items in your cart.",
    };
  }

  if (
    coupon.categories_included.length > 0 &&
    !cartCategoryIdsOnly.some((id) => coupon.categories_included.includes(id))
  ) {
    console.warn("Coupon not applicable to any cart categories:", coupon.code);
    return {
      isValid: false,
      message: "This coupon is not valid for your selected product categories.",
    };
  }

  if (
    coupon.categories_excluded.length > 0 &&
    cartCategoryIdsOnly.some((id) => coupon.categories_excluded.includes(id))
  ) {
    console.warn("Coupon applies to excluded categories:", coupon.code);
    return {
      isValid: false,
      message: "This coupon cannot be used with some categories in your cart.",
    };
  }

  // 4. Validate global usage limit
  if (
    coupon.usage_count &&
    coupon.usage_limit &&
    coupon?.usage_count >= coupon.usage_limit
  ) {
    console.warn("Coupon has reached its maximum usage limit:", coupon.code);
    return {
      isValid: false,
      message: "This coupon has reached its maximum usage limit.",
    };
  }

  // 5. Validate per-user usage limit
  const userEmail = checkoutData.billing.email.trim().toLowerCase();
  const userUsageCount = coupon.used_by.filter(
    (email) => email.toLowerCase() === userEmail
  ).length;

  if (
    coupon.usage_limit_per_user &&
    userUsageCount >= coupon.usage_limit_per_user
  ) {
    console.warn(
      "User has reached the max usage limit for this coupon:",
      coupon.code
    );
    return {
      isValid: false,
      message: `You have already used this coupon the maximum number of times (${coupon.usage_limit_per_user}).`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Applies a valid coupon to the checkout process.
 * - Adjusts the subtotal based on discount type.
 * - Enables free shipping if applicable.
 * - Returns updated checkout state.
 * @param coupon - The validated coupon object.
 * @param checkoutData - Current checkout state.
 * @returns {CheckoutData} - Updated checkout state with applied discount.
 */

export const applyCoupon = (
  coupon: Coupon,
  checkoutData: CheckoutData
): CheckoutData => {
  let discountAmount = 0;
  let updatedShippingCost = checkoutData.shippingCost;

  switch (coupon.discount_type) {
    case "fixed_cart":
      discountAmount = coupon.discount_value;
      break;
    case "percent":
      // Iterate over each item in the cart
      checkoutData.cartItems.forEach((item) => {
        // Calculate the total price for the current item
        const itemLineTotal = item.price * item.quantity;

        // Compute the discount for the current item
        let itemDiscount = (itemLineTotal * coupon.discount_value) / 100;

        // Round the item's discount to two decimal places
        itemDiscount = parseFloat(itemDiscount.toFixed(2));

        // Add the rounded discount of the current item to the total discount amount
        discountAmount += itemDiscount;
      });

      break;
    case "fixed_product":
      discountAmount = checkoutData.cartItems.reduce((total, item) => {
        if (coupon.products_included.includes(item.id)) {
          return (
            total + (item.price * item.quantity * coupon.discount_value) / 100
          );
        }
        return total;
      }, 0);
      break;
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, checkoutData.subtotal);

  // Apply free shipping if coupon allows it
  if (coupon.free_shipping) {
    updatedShippingCost = 0;
  }

  return {
    ...checkoutData,
    discountTotal: discountAmount,
    total: checkoutData.subtotal + updatedShippingCost - discountAmount,
    shippingCost: updatedShippingCost,
    coupon: {
      ...coupon,
      code: coupon.code,
      description: coupon.description,
      discount_value: discountAmount, // Ensuring this is set correctly
      free_shipping: coupon.free_shipping,
    },
  };
};

/**
 * Removes the applied coupon and resets totals.
 * @param checkoutData - The checkout state before coupon application.
 * @returns {CheckoutData} - Checkout state with coupon removed.
 */
export const removeCoupon = (checkoutData: CheckoutData): CheckoutData => {
  return {
    ...checkoutData,
    discountTotal: 0,
    total: checkoutData.subtotal + checkoutData.shippingCost,
    coupon: null,
  };
};

/**
 * Utility functions for handling coupon logic in the checkout process.
 * - Applies various types of discounts (fixed, percentage, product-specific)
 * - Ensures compliance with coupon restrictions (expiration, min/max spend, exclusions)
 * - Prevents discounts from making the total negative
 */
/**
 * Calculates the dollar discount for a given coupon & cart.
 * - Does NOT mutate the `coupon` object.
 * - Returns a numeric discount in dollars.
 */
export function calculateCouponDiscount(
  coupon: Coupon,
  cartItems: CartItem[],
  subtotal: number
): number {
  const now = new Date();
  const expiryDate = new Date(coupon.expires_on);
  if (now > expiryDate) {
    console.warn(`Coupon ${coupon.code} is expired.`);
    return 0;
  }

  const minSpend = parseFloat(coupon.min_spend || "0");
  const maxSpend = parseFloat(coupon.max_spend || "0");
  if (subtotal < minSpend) return 0;
  if (maxSpend > 0 && subtotal > maxSpend) return 0;

  let discount = 0;
  switch (coupon.discount_type) {
    case "fixed_cart":
      discount = Number(coupon.discount_value);
      break;
    case "percent":
      discount = (Number(coupon.discount_value) / 100) * subtotal;
      break;
    case "fixed_product":
      discount = cartItems.reduce((acc, item) => {
        if (coupon.products_included.includes(item.id)) {
          return acc + Number(coupon.discount_value) * item.quantity;
        }
        return acc;
      }, 0);
      break;
  }

  return Math.min(discount, subtotal);
}

/**
 * Retrieves the embedded coupon data from the checkout page.
 * - Extracts the JSON stored in the <script> tag (id="coupon-data").
 * - Parses the JSON and returns an array of available coupons.
 * - If no data is found, returns an empty array.
 */
export const getCouponsFromStorage = (): Coupon[] => {
  const script = document.getElementById("coupon-data");
  if (!script) {
    console.warn("Coupon data script not found in DOM.");
    return [];
  }

  try {
    const coupons: Coupon[] = JSON.parse(script.textContent || "[]");
    // console.log("coupons from json [couponUtils]", coupons);
    return coupons;
  } catch (error) {
    console.error("Error parsing coupon data:", error);
    return [];
  }
};
