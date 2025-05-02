"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import OrderDetailsDesktop from "./OrderDetailsDesktop";
import OrderDetailsMobile from "./OrderDetailsMobile";
import { Dialog } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Spinner from "@/components/common/Spinner";

const RightPane = () => {
  const {
    cartItems,
    subtotal: cartSubtotal,
    isLoading,
    setIsCartOpen,
  } = useCartStore();

  const {
    checkoutData,
    setCartItems,
    calculateTotals,
    setShippingMethod,
    setCoupon,
    isHydrated,
  } = useCheckoutStore();
  const router = useRouter();

  // console.log("shipping cost [RightPane.tsx]", checkoutData.shippingCost);

  // Hide any side-cart on mount
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // IMPORTANT: Keep the checkout store always in sync with the cart store
  useEffect(() => {
    setCartItems(cartItems); // Overwrite checkoutData.cartItems with cartItems
    calculateTotals(); // Recalculate totals
  }, [cartItems, setCartItems, calculateTotals]);

  // IMPORTANT: This keeps applied coupon data discounts, freeshipping intact at page refresh
  useEffect(() => {
    if (!checkoutData.coupon) return;

    // 1) If the coupon has free_shipping, set shipping method & cost to 0
    if (checkoutData.coupon.free_shipping) {
      setShippingMethod("free_shipping", 0);
    }

    // 2) Re-trigger the discount logic so it's accurate
    //    We'll just call setCoupon again, which re-sets the discountTotal
    setCoupon(checkoutData.coupon);
  }, []);

  const shipping = checkoutData.shippingCost || 0;
  const total = checkoutData.total;

  // console.log("shipping [RightPane.tsx]", shipping);

  // Redirect to shop if cart is empty
  const editInCart = () => {
    router.push("/cart");
  };

  if (isLoading) {
    return <Spinner />;
  }

  // console.log("[Right Pane] Checkout Data", checkoutData);

  return (
    <div className="mt-10 lg:mt-0">
      {/* Desktop Order Summary */}
      <div className="hidden lg:block">
        <OrderDetailsDesktop
          checkoutData={checkoutData}
          cartSubtotal={cartSubtotal}
          shipping={shipping}
          total={total}
          editInCart={editInCart}
        />
      </div>

      {/* Mobile Order Summary - Dialog */}
      <Dialog>
        <OrderDetailsMobile
          checkoutData={checkoutData}
          cartSubtotal={cartSubtotal}
          shipping={shipping}
          total={total}
          editInCart={editInCart}
        />
      </Dialog>
    </div>
  );
};

export default RightPane;
