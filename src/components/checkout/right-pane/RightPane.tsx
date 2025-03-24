"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import OrderDetailsDesktop from "./OrderDetailsDesktop";
import OrderDetailsMobile from "./OrderDetailsMobile";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Spinner from "@/components/common/Spinner";
import { Coupon } from "@/types/coupon";

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

  console.log("shipping cost [RightPane.tsx]", checkoutData.shippingCost);

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

  // ------------- MAIN LOGIC FOR SUBTOTAL CHECK -------------
  const [couponMessage, setCouponMessage] = useState("");
  const prevSubtotalRef = useRef(checkoutData.subtotal);

  // useEffect(() => {
  //   const oldSubtotal = prevSubtotalRef.current;
  //   const newSubtotal = checkoutData.subtotal;

  //   console.log("RightPane effect -> old:", oldSubtotal, " new:", newSubtotal);

  //   // If a coupon is applied & the subtotal changed, show a message
  //   if (checkoutData.coupon && newSubtotal !== oldSubtotal) {
  //     console.log("Subtotal changed, showing coupon message");
  //     setCouponMessage(
  //       "Your cart changed, you may need to re-apply the coupon."
  //     );
  //   } else {
  //     // If no coupon or the subtotal didn't change, clear the message
  //     console.log("Subtotal not changed or no coupon, clearing message");
  //     setCouponMessage("");
  //   }

  //   // Update the ref
  //   prevSubtotalRef.current = newSubtotal;
  // }, [checkoutData.coupon, checkoutData.subtotal]);

  // ---------------------------------------------------------

  const shipping = checkoutData.shippingCost || 0;
  const total = checkoutData.total;

  console.log("shipping [RightPane.tsx]", shipping);

  // Redirect to shop if cart is empty
  const editInCart = () => {
    router.push("/cart");
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!isHydrated) {
    return <Spinner />; // or any loading indicator you prefer
  }

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
          couponMessage={couponMessage}
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
          couponMessage={couponMessage}
        />
      </Dialog>
    </div>
  );
};

export default RightPane;
