"use client";

import { useEffect } from "react";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const OrderValidation = () => {
  // Extract the checkout data and the setter for orderValidated
  const { checkoutData, setOrderValidated } = useCheckoutStore();

  useEffect(() => {
    // Destructure the fields needed for validation
    const { billing, shipping, shippingMethod, cartItems } = checkoutData;

    // Define a simple validation check
    const isValid =
      billing.email.trim() !== "" &&
      shipping.first_name.trim() !== "" &&
      shipping.last_name.trim() !== "" &&
      shipping.address_1.trim() !== "" &&
      shipping.city.trim() !== "" &&
      shipping.postcode.trim() !== "" &&
      shipping.country.trim() !== "" &&
      // And that there is at least one cart item
      cartItems.length > 0;

    // Update the store with the result of the validation
    setOrderValidated(isValid);
  }, [checkoutData, setOrderValidated]);

  // This component doesn't render any visible UI.
  return null;
};

export default OrderValidation;
