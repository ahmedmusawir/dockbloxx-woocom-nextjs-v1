/**
 * Utility functions for coupon validation and application in the checkout flow.
 * - Ensures valid coupon usage (expiry, conditions, restrictions).
 * - Applies discount based on coupon type.
 * - Adjusts shipping cost if free shipping is included.
 * - Recalculates cart totals after discount application.
 */

import { CheckoutData } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { Coupon, CouponMeta } from "@/types/coupon";

// --- START: NEW CODE FOR PHASE 1 ---

/**
 * Parses the raw meta_data from a Coupon object into a clean, typed object.
 * This acts as an anti-corruption layer to protect our app from API changes.
 * @param coupon - The raw coupon object from the API.
 * @returns {CouponMeta} A structured object with our custom coupon properties.
 */
export function parseCouponMeta(coupon: Coupon): CouponMeta {
  const meta: CouponMeta = {};

  // Ensure meta_data exists and is an array before iterating
  if (!Array.isArray(coupon.meta_data)) {
    return meta;
  }

  coupon.meta_data.forEach(({ key, value }) => {
    if (key === "_dockbloxx_discount_percent_per_product") {
      const percentValue = Number(value);
      if (!isNaN(percentValue)) {
        meta.percentPerProduct = percentValue;
      }
    }

    if (key === "_dockbloxx_allowed_emails") {
      // Handle both array (from our plugin) and comma-separated string (manual entry)
      const emails = Array.isArray(value)
        ? value
        : String(value)
            .split(",")
            .map((v) => v.trim());

      // Filter out any empty strings and convert to lowercase
      meta.allowedEmails = emails
        .filter((email) => email)
        .map((email) => email.toLowerCase());
    }

    // NEW: Extract expiry time (HH:MM format)
    if (key === "_expiry_time") {
      meta.expiryTime = String(value).trim();
    }

    // NEW: Extract expiry timezone (IANA timezone string)
    // if (key === "_expiry_timezone") {
    //   meta.expiryTimezone = String(value).trim();
    // }

    // NEW: Extract expiry timezone (IANA timezone string)
    if (key === "_expiry_timezone") {
      // Handle format: "[UTC+08:00] Asia/Kuala_Lumpur" or just "Asia/Kuala_Lumpur"
      const rawTimezone = String(value).trim();

      // Extract just the IANA timezone part (after the ] if it exists)
      const match = rawTimezone.match(/\]\s*(.+)$/);
      meta.expiryTimezone = match ? match[1].trim() : rawTimezone;
    }
  });

  return meta;
}

/**
 * DEBUG ONLY: Comprehensive timezone debugging
 * Shows all timezone-related information in one place
 */
export function debugTimezoneInfo(coupon: Coupon, meta: CouponMeta): void {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 TIMEZONE DEBUG REPORT - " + coupon.code);
  console.log("=".repeat(80));

  // 1. What the API gave us
  console.log("\n📦 RAW DATA FROM API:");
  console.log("  - expires_on:", coupon.expires_on);
  console.log("  - meta_data:", coupon.meta_data);

  // 2. What we parsed
  console.log("\n🔧 PARSED META:");
  console.log("  - expiryTime:", meta.expiryTime);
  console.log("  - expiryTimezone:", meta.expiryTimezone);

  // 3. Current time in different formats
  const now = new Date();
  console.log("\n⏰ CURRENT TIME (Browser):");
  console.log("  - Browser local time:", now.toString());
  console.log("  - UTC time:", now.toUTCString());
  console.log("  - ISO string:", now.toISOString());

  // 4. Current time in the coupon's timezone
  if (meta.expiryTimezone) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: meta.expiryTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "short",
      });

      const timeInCouponTZ = formatter.format(now);
      console.log(
        "\n🌍 CURRENT TIME IN COUPON TIMEZONE (" + meta.expiryTimezone + "):"
      );
      console.log("  - Formatted:", timeInCouponTZ);

      // Get individual parts
      const parts = formatter.formatToParts(now);
      const year = parts.find((p) => p.type === "year")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const day = parts.find((p) => p.type === "day")?.value;
      const hour = parts.find((p) => p.type === "hour")?.value;
      const minute = parts.find((p) => p.type === "minute")?.value;
      const second = parts.find((p) => p.type === "second")?.value;

      console.log("  - Year:", year);
      console.log("  - Month:", month);
      console.log("  - Day:", day);
      console.log("  - Hour:", hour);
      console.log("  - Minute:", minute);
      console.log("  - Second:", second);
    } catch (error) {
      console.log("  ❌ Error formatting time in timezone:", error);
    }
  }

  // 5. Expiry time breakdown
  console.log("\n📅 COUPON EXPIRY:");
  console.log("  - Date:", coupon.expires_on);
  console.log("  - Time:", meta.expiryTime || "NOT SET");
  console.log("  - Timezone:", meta.expiryTimezone || "NOT SET");
  console.log(
    "  - Combined:",
    `${coupon.expires_on}T${meta.expiryTime || "00:00"}:00`
  );

  // 6. Server location (if we can detect it)
  console.log("\n🖥️ BROWSER INFO:");
  console.log("  - Timezone offset (minutes):", now.getTimezoneOffset());
  console.log(
    "  - Detected timezone:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  console.log("\n" + "=".repeat(80) + "\n");
}
// --- END: NEW CODE FOR PHASE 1 ---

/**
 * Checks if a coupon is expired using timezone-aware validation.
 * Combines date + time + timezone to perform accurate UTC-based comparison.
 *
 * @param coupon - The coupon object with expires_on date
 * @param meta - Parsed meta data containing expiryTime and expiryTimezone
 * @returns {boolean} - true if expired, false if still valid
 */
/**
 * Checks if a coupon is expired using timezone-aware validation.
 * Combines date + time + timezone to perform accurate UTC-based comparison.
 *
 * @param coupon - The coupon object with expires_on date
 * @param meta - Parsed meta data containing expiryTime and expiryTimezone
 * @returns {boolean} - true if expired, false if still valid
 */

/**
 * Checks if a coupon is expired using timezone-aware validation.
 * Combines date + time + timezone to perform accurate UTC-based comparison.
 *
 * @param coupon - The coupon object with expires_on date
 * @param meta - Parsed meta data containing expiryTime and expiryTimezone
 * @returns {boolean} - true if expired, false if still valid
 */
export function isCouponExpiredByTimezone(
  coupon: Coupon,
  meta: CouponMeta
): boolean {
  // If no expiry date is set, coupon never expires
  if (!coupon.expires_on) {
    return false;
  }

  // If timezone data is missing, fall back to date-only check
  if (!meta.expiryTime || !meta.expiryTimezone) {
    console.warn(
      `[Coupon ${coupon.code}] Missing timezone data. Falling back to date-only check.`
    );
    return new Date() > new Date(coupon.expires_on);
  }

  try {
    const expiryDate = coupon.expires_on; // "2025-10-06"
    const timezone = meta.expiryTimezone; // "Asia/Kuala_Lumpur"

    // DATE-ONLY VALIDATION (Timezone-Aware)
    // Strategy: Check what "today's date" is in the coupon's timezone
    
    // Get current date in the coupon's timezone
    const nowInTZ = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }); // Returns "YYYY-MM-DD" format
    
    // Compare dates as strings (both in YYYY-MM-DD format)
    // Coupon expires at END of the expiry date in its timezone
    const isExpired = nowInTZ > expiryDate;

    console.log(`[Coupon Expiry Check - ${coupon.code}]`, {
      timezone,
      expiryDate,
      nowInTZ,
      isExpired,
      explanation: isExpired 
        ? `Today (${nowInTZ}) is after expiry date (${expiryDate})` 
        : `Coupon valid until end of ${expiryDate} (${timezone})`,
    });

    return isExpired;
  } catch (error) {
    console.error(
      `[Coupon ${coupon.code}] Error parsing timezone data:`,
      error
    );
    // Fall back to date-only check on error
    return new Date() > new Date(coupon.expires_on);
  }
}

/**
 * Validates a coupon based on expiry date, min/max spend, and product/category restrictions.
 * ... (rest of the file remains the same for now) ...
 */

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
  const meta = parseCouponMeta(coupon);
  const userEmail = checkoutData.billing.email?.trim().toLowerCase();
  const userZipCode = checkoutData.shipping.postcode?.trim();

  console.log("--- [COUPON VALIDATION TRACE] ---");
  console.log("Coupon Code:", coupon.code);
  console.log("User Email:", userEmail);
  console.log("User Zip Code:", userZipCode);
  console.log("Allowed Emails from Meta:", meta.allowedEmails);

  // 0. REQUIRE EMAIL (Security Check)
  if (!userEmail) {
    console.log("Validation FAILED: No email provided.");
    return {
      isValid: false,
      message: "Please enter your email address to apply a coupon.",
    };
  }

  // 0.1 REQUIRE ZIP CODE (Shipping Check)
  if (!userZipCode) {
    console.log("Validation FAILED: No zip code provided.");
    return {
      isValid: false,
      message: "Please enter your shipping zip code to apply a coupon.",
    };
  }

  // 1. Email Restriction Check (If coupon has specific allowed emails)
  if (meta.allowedEmails && meta.allowedEmails.length > 0) {
    const isMatch = meta.allowedEmails.includes(userEmail);
    console.log("Email check result - Is Match:", isMatch);

    if (!isMatch) {
      console.log("Validation FAILED: Email not on allowed list.");
      return {
        isValid: false,
        message: "This coupon is restricted to specific users.",
      };
    }
  }

  // --- START: UPGRADED LOGIC FOR QUANTITY LIMIT ---

  // 2. If it's a 100% "FREE" coupon, check the TOTAL quantity of eligible items.
  if (meta.percentPerProduct === 100) {
    // Find all items in the cart that are eligible for this coupon
    const eligibleItems = checkoutData.cartItems.filter((item) =>
      coupon.products_included.includes(item.id)
    );

    // Calculate the total quantity of these eligible items
    const totalEligibleQuantity = eligibleItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalEligibleQuantity > 1) {
      console.warn(
        `Coupon ${coupon.code} cannot be applied. Total quantity of eligible free items is ${totalEligibleQuantity}.`
      );
      return {
        isValid: false,
        message: "Free item coupons are limited to a total quantity of one.",
      };
    }
  }

  // --- END: UPGRADED LOGIC ---

  // 2.2 Expiration Check (Timezone-Aware)
  if (isCouponExpiredByTimezone(coupon, meta)) {
    console.log("Validation FAILED: Coupon is expired (timezone-aware check).");
    return { isValid: false, message: "This coupon has expired." };
  }

  // 3. Validate min/max spend requirements
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

  // 4. Validate product/category restrictions
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

  // 5. Validate global usage limit
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

  // 6. Validate per-user usage limit
  // const userEmail = checkoutData.billing.email.trim().toLowerCase();
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
  // Parse meta data for timezone-aware expiry check
  const meta = parseCouponMeta(coupon);

  // Use timezone-aware expiry check
  if (isCouponExpiredByTimezone(coupon, meta)) {
    console.warn(`Coupon ${coupon.code} is expired (timezone-aware check).`);
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
