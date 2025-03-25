"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ApplyCoupon from "./ApplyCoupon";
import CheckoutCartItems from "./CheckoutCartItems";

interface OrderDetailsProps {
  checkoutData: any; // Adjust with proper types if available
  cartSubtotal: () => number;
  shipping: number;
  total: number;
  editInCart: () => void;
  couponMessage?: string;
}

const OrderDetailsMobile = ({
  checkoutData,
  cartSubtotal,
  shipping,
  total,
  editInCart,
  couponMessage,
}: OrderDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        className="lg:hidden fixed bottom-0 left-0 w-full bg-blue-600 text-white py-3 text-center text-lg font-medium cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Order Details
      </button>
      <DialogContent className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">Order Summary</DialogTitle>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <CheckoutCartItems cartData={checkoutData.cartItems} />
        <dl className="space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm font-bold">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">
              ${cartSubtotal().toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm">Shipping</dt>
            <dd className="text-sm font-medium text-gray-900">
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
          <ApplyCoupon />
          {couponMessage && (
            <p className="mt-1 text-sm font-bold text-red-600">
              {couponMessage}
            </p>
          )}
        </dl>
        <dl className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <dt className="text-lg font-medium">Total</dt>
            <dd className="text-2xl font-medium text-gray-900">
              ${total.toFixed(2)}
            </dd>
          </div>
        </dl>
        <DialogClose asChild>
          <button
            className="mt-4 w-full bg-gray-900 text-white py-2 text-center text-lg font-medium rounded sticky bottom-0"
            onClick={() => setIsOpen(false)}
          >
            Return to Checkout
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsMobile;
