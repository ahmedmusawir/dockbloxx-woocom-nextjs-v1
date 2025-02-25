"use client";

import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Example style object for separate fields
const ELEMENT_STYLE = {
  base: {
    fontSize: "16px",
    color: "#000",
    fontFamily: 'Roboto, "Open Sans", sans-serif',
    "::placeholder": {
      color: "#aab7c4",
    },
  },
  invalid: {
    color: "red",
  },
};

const SeparateFieldsForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // Get the card element and guard against null
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError("Card element not found");
      setIsProcessing(false);
      return;
    }

    // Fetch PaymentIntent client secret from your API endpoint
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        /* pass order details */
      }),
    });
    const { clientSecret } = await response.json();

    // Confirm the card payment using the card element
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumberElement },
      });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      console.log("Payment succeeded:", paymentIntent);
      // Further actions like order creation, redirection, etc.
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Card Number Field */}
      <div className="border border-gray-300 rounded p-3">
        <CardNumberElement options={{ style: ELEMENT_STYLE }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Expiry Date Field */}
        <div className="border border-gray-300 rounded p-3">
          <CardExpiryElement options={{ style: ELEMENT_STYLE }} />
        </div>

        {/* CVC Field */}
        <div className="border border-gray-300 rounded p-3">
          <CardCvcElement options={{ style: ELEMENT_STYLE }} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
};

export default SeparateFieldsForm;
