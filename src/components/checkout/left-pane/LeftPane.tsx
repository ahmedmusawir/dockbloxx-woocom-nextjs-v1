"use client";

import React, { useState } from "react";
import ContactEmail from "./ContactEmail";
import ShippingInfo from "./ShippingInfo";
import PaymentMethods from "./PaymentMethods";
import OrderValidation from "./OrderValidation";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const LeftPane = () => {
  const { emailSaved } = useCheckoutStore();

  return (
    <div>
      {/* OrderValidation runs its useEffect to monitor checkoutData and update orderValidated */}
      <OrderValidation />

      <div className="mt-10">
        <h1 className="text-2xl text-gray-900">Customer</h1>

        <ContactEmail />
      </div>

      {/* The separator */}
      <div className="mt-10 border-t border-gray-400 pt-10">
        {/* Shipping info */}
        <h1 className="text-2xl text-gray-900">Shipping</h1>

        {emailSaved ? (
          <ShippingInfo />
        ) : (
          <p className="text-sm text-gray-600 mt-2">
            Please save your email to proceed with shipping details.
          </p>
        )}
      </div>

      {/* The separator   */}
      <div className="mt-10 border-t border-gray-400 pt-10">
        {/* Payment */}
        <h1 className="text-2xl text-gray-900">Payment</h1>
        <PaymentMethods />
      </div>
    </div>
  );
};

export default LeftPane;
