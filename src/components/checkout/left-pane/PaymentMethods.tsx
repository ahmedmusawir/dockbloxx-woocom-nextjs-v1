"use client";

import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StripePaymentForm from "../payments/StripePaymentForm";

const PaymentMethods = () => {
  const router = useRouter();
  // Retrieve orderValidated flag along with checkoutData
  const { checkoutData, orderValidated, isAnyBlockEditing } =
    useCheckoutStore();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      {/* Conditional Rendering: Payment Form is only shown if orderValidated is true */}
      {orderValidated && !isAnyBlockEditing ? (
        <>
          {/* PAYMENT FORM */}
          <StripePaymentForm />
        </>
      ) : (
        // If order is not validated, display an info message
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Please complete your order details (shipping, billing, cart) to
            enable payment.
          </p>
        </div>
      )}
    </>
  );
};

export default PaymentMethods;
