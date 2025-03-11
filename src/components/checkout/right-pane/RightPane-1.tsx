"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import Spinner from "@/components/common/Spinner";
import CheckoutCartItems from "./CheckoutCartItems";
import ApplyCoupon from "./ApplyCoupon";
import { useRouter } from "next/navigation";

const RightPane = () => {
  const {
    cartItems,
    subtotal: cartSubtotal,
    isLoading,
    setIsCartOpen,
  } = useCartStore();

  const { checkoutData, setCartItems, calculateTotals } = useCheckoutStore();
  const router = useRouter();

  // Hide any side-cart on mount
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // IMPORTANT: Keep the checkout store always in sync with the cart store
  useEffect(() => {
    setCartItems(cartItems); // Overwrite checkoutData.cartItems with cartItems
    calculateTotals(); // Recalculate totals
  }, [cartItems, setCartItems, calculateTotals]);

  // ------------- MAIN LOGIC FOR SUBTOTAL CHECK -------------
  const [couponMessage, setCouponMessage] = useState("");
  const prevSubtotalRef = useRef(checkoutData.subtotal);

  useEffect(() => {
    const oldSubtotal = prevSubtotalRef.current;
    const newSubtotal = checkoutData.subtotal;

    console.log("RightPane effect -> old:", oldSubtotal, " new:", newSubtotal);

    // If a coupon is applied & the subtotal changed, show a message
    if (checkoutData.coupon && newSubtotal !== oldSubtotal) {
      console.log("Subtotal changed, showing coupon message");
      setCouponMessage(
        "Your cart changed, you may need to re-apply the coupon."
      );
    } else {
      // If no coupon or the subtotal didn't change, clear the message
      console.log("Subtotal not changed or no coupon, clearing message");
      setCouponMessage("");
    }

    // Update the ref
    prevSubtotalRef.current = newSubtotal;
  }, [checkoutData.coupon, checkoutData.subtotal]);

  // ---------------------------------------------------------

  const shipping = checkoutData.shippingCost || 0;
  const total = checkoutData.total;

  // Redirect to shop if cart is empty
  const editInCart = () => {
    router.push("/cart");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="mt-10 lg:mt-0">
      <div className="mt-4 rounded-none border border-gray-300 bg-white shadow-lg">
        <dl className="space-y-6 border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="text-2xl text-gray-900">Order summary</h2>
          <div className="ml-4 flow-root shrink-0 -mt-10">
            <button
              type="button"
              className="-mt-5 flex items-center justify-center bg-white px-5 py-2.5 text-gray-400 hover:text-gray-500 border-2 "
              onClick={editInCart}
            >
              <span className="sr-only">Remove</span>
              Edit Cart
            </button>
          </div>
        </dl>
        <dl className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-6">
          <CheckoutCartItems cartData={checkoutData.cartItems} />
        </dl>
        <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <dt className="text-lg font-bold">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">
              ${cartSubtotal().toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-lg">Shipping</dt>
            <dd className="text-lg font-medium text-gray-900">
              ${shipping.toFixed(2)}
            </dd>
          </div>

          {checkoutData.coupon && (
            <div className="flex flex-col text-green-600">
              <div className="flex items-center justify-between">
                <dt className="text-sm">
                  Coupon Applied ({checkoutData.coupon.code}):
                </dt>
                <dd className="text-sm font-medium">
                  -${checkoutData.discountTotal.toFixed(2)}
                </dd>
              </div>
              {checkoutData.coupon.description && (
                <p className="text-xs text-gray-500">
                  {checkoutData.coupon.description}
                </p>
              )}
            </div>
          )}

          {/* The coupon input block */}
          <ApplyCoupon />

          {/* If the subtotal changed while a coupon was active, show our message */}
          {couponMessage && (
            <p className="mt-1 text-sm font-bold text-red-600">
              {couponMessage}
            </p>
          )}
        </dl>
        <dl className="space-y-2 border-t border-gray-200 px-4 py-6 sm:px-4">
          <div className="flex items-center justify-between border-gray-200 pt-4">
            <dt className="text-xl font-medium">Total</dt>
            <dd className="text-3xl font-medium text-gray-900">
              ${total.toFixed(2)}
            </dd>
          </div>
        </dl>
        <dl className="space-y-2 border-t border-gray-200 px-4 py-4 sm:px-6"></dl>
      </div>
    </div>
  );
};

export default RightPane;
