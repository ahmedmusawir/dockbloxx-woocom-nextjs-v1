"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { createWoocomOrder } from "@/services/orderServices";
import { OrderSummary } from "@/types/order";
import OrderInfoDialog from "./OrderInfoDialog";

const StripePaymentForm = () => {
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // READ CHECKOUT DATA (e.g. total) FROM THE STORE
  const { checkoutData, orderId } = useCheckoutStore();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // console.log("checkoutData [StripePaymentForm]", checkoutData);
  // Convert the total (e.g. $50.00) to cents (5000).
  // const totalInCents = Math.round(checkoutData.total * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // 1. First, submit the Payment Element to trigger inline validation
    const submitResult = await elements.submit();
    if (submitResult.error) {
      // Provide a fallback if message is undefined
      setError(submitResult.error.message ?? "Validation error");
      setIsProcessing(false);
      return;
    }

    // 2. Create the order in WooCommerce (pending payment)
    try {
      const orderResponse = await createWoocomOrder(checkoutData);
      if (!orderResponse) {
        setError("Order submission failed. Please try again.");
        setIsProcessing(false);
        return;
      }
      // console.log("Order submission successful:", orderResponse);

      // Build a simplified order object with essential fields for display and persistence.
      const orderObject: OrderSummary = {
        id: orderResponse.id,
        status: orderResponse.status,
        total: orderResponse.total,
        shippingCost: orderResponse.shipping_lines?.[0]?.total,
        discountTotal: orderResponse.discount_total,
        billing: orderResponse.billing,
        shipping: orderResponse.shipping,
        line_items: orderResponse.line_items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.total,
          image: item.image?.src,
        })),
        coupon: orderResponse.coupon_lines,
      };

      console.log("Simplified Order Object:", orderObject);

      // Persist the simplified order object in localStorage for use in the Thank You page.
      localStorage.setItem("latestOrder", JSON.stringify(orderObject));

      // Save the order object in local state for display in the modal.
      setOrderInfo(orderObject);
      // Open the modal/dialog to display the order summary.
      setIsOrderModalOpen(true);
    } catch (err) {
      console.error("Error submitting order:", err);
      setError("Order submission encountered an error. Please try again.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Payment Element */}
        <div className="border border-gray-300 rounded p-3">
          <PaymentElement />
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

      {isOrderModalOpen && orderInfo && (
        <OrderInfoDialog
          orderInfo={orderInfo}
          isOpen={isOrderModalOpen}
          onConfirm={() => setIsOrderModalOpen(false)}
          onCancel={() => setIsOrderModalOpen(false)}
          // onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </>
  );
};

export default StripePaymentForm;
