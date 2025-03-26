"use client";

import React, { useEffect } from "react";
import ApplyCoupon from "./ApplyCoupon";
import CheckoutCartItems from "./CheckoutCartItems";
import { CheckoutData } from "@/types/checkout";
import { useCheckoutStore } from "@/store/useCheckoutStore";

interface OrderDetailsProps {
  checkoutData: CheckoutData;
  cartSubtotal: () => number;
  shipping: number;
  total: number;
  editInCart: () => void;
  couponMessage?: string;
}

const OrderDetailsDesktop = ({
  checkoutData,
  cartSubtotal,
  shipping,
  total,
  editInCart,
  couponMessage,
}: OrderDetailsProps) => {
  return (
    <div className="mt-10 lg:mt-0">
      <div className="mt-4 border border-gray-300 bg-white shadow-lg">
        <dl className="space-y-6 border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="text-2xl text-gray-900">Order summary</h2>
          <div className="ml-4 flow-root shrink-0 -mt-10">
            <button
              type="button"
              className="-mt-5 flex items-center justify-center bg-white px-5 py-2.5 text-gray-400 hover:text-gray-500 border-2"
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
      </div>
    </div>
  );
};

export default OrderDetailsDesktop;
