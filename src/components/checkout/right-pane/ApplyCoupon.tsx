"use client";

import { useState } from "react";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { validateCoupon } from "@/lib/couponUtils";
import { fetchCouponByCode } from "@/services/checkoutServices";
import { useCouponTracking } from "@/hooks/useCouponTracking";

const ApplyCoupon = () => {
  const { checkoutData, applyCoupon, removeCoupon } = useCheckoutStore();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { trackApplyCoupon } = useCouponTracking();

  // Handle applying coupon
  const handleApply = async () => {
    setError(""); // Reset error message

    if (!couponCode.trim()) {
      setError("Please enter a coupon code.");
      return;
    }

    setIsLoading(true);

    try {
      const coupon = await fetchCouponByCode(couponCode);

      // console.log("coupon [ApplyCoupon.tsx]", coupon);

      if (!coupon) {
        setError("Invalid or expired coupon.");
        return;
      }

      const validation = validateCoupon(coupon, checkoutData);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }

      applyCoupon(coupon);
      trackApplyCoupon(coupon); // GTM track
      setCouponCode(""); // Clear input field
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Error applying coupon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing coupon
  const handleRemove = () => {
    removeCoupon();
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700">
        Coupon/Gift Certificate
      </h3>

      {/* If a coupon is applied, show the applied coupon */}
      {checkoutData.coupon ? (
        <div className="mt-2 flex items-center justify-between border border-lime-300 p-5 rounded-none bg-lime-300">
          <span className="text-sm font-medium text-gray-900">
            Coupon Applied: {checkoutData.coupon.code}
          </span>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:underline rounded-none"
          >
            Remove
          </button>
        </div>
      ) : (
        // Otherwise, show the input field to enter a coupon
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            className="flex-1 block w-full rounded-none border border-gray-300 px-3 py-3 text-sm"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            onClick={handleApply}
            disabled={isLoading}
            className={` bg-blue-600 text-white py-2 px-4 rounded-none ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Applying..." : "Apply"}
          </button>
        </div>
      )}

      {/* Show error message if coupon is invalid */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ApplyCoupon;
