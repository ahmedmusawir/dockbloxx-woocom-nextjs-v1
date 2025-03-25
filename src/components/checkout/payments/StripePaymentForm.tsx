"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { createWoocomOrder, updateWoocomOrder } from "@/services/orderServices";
import { OrderSummary } from "@/types/order";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

const StripePaymentForm = () => {
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  // READ CHECKOUT DATA (e.g. total) FROM THE STORE
  const { checkoutData, removeCoupon } = useCheckoutStore();
  const { setCartItems } = useCartStore();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // CANCEL ORDER RELATED:
  const [isCancelling, setIsCancelling] = useState(false);

  //Early return if stripe isn't loaded.
  if (!stripe) {
    console.log("Stripe is not loaded yet (early return)");
    return <div>Loading Payment...</div>; // Or a spinner
  }

  // Order submission to woocom backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const submitResult = await elements.submit();
    if (submitResult.error) {
      setError(submitResult.error.message ?? "Validation error");
      setIsProcessing(false);
      return;
    }

    try {
      const orderResponse = await createWoocomOrder(checkoutData);
      if (!orderResponse) {
        setError("Order submission failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      console.log("Order submission successful:", orderResponse);

      const orderObject: OrderSummary = {
        // Build simplified order object
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

      localStorage.setItem("latestOrder", JSON.stringify(orderObject)); // Persist the order
      setOrderInfo(orderObject);
      setModalMessage("Processing Payment...");
      setIsOrderModalOpen(true);

      // Call processPayment and check its return value
      const paymentSuccess = await processPayment(elements, orderObject);
      if (!paymentSuccess) {
        return; // Exit if payment failed
      }
    } catch (err) {
      console.error("Error submitting order:", err);
      setError("Order submission encountered an error. Please try again.");
      setIsProcessing(false); // VERY IMPORTANT: Stop processing on error
      setIsOrderModalOpen(true); // Show the modal on error
      setModalMessage("Order creation failed. Please try again."); // Set an appropriate error message
    }
    // No finally block
  };

  // Process Stripe Payments making calls to Stripe API
  const processPayment = async (
    elements: any,
    orderInfo: OrderSummary
  ): Promise<boolean> => {
    // Payment submission function
    console.log(
      "checkout total: [StripePaymentForm.tsx - processPayment]",
      checkoutData.total
    );
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(checkoutData.total * 100),
          currency: "usd",
          orderId: orderInfo.id, // Now orderInfo.id will be available.
        }),
      });
      const { clientSecret } = await response.json();

      try {
        // <--- Inner try...catch block for stripe.confirmPayment
        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${SITE_URL}/thankyou`,
          },
          redirect: "if_required",
        });

        if (result.error) {
          // ---  HANDLE PAYMENT FAILURE ---
          setModalMessage("Sorry, Payment Failed... please cancel or retry!");
          setError(result.error.message || "Payment Failed");
          setIsProcessing(false);
          return false; // Return false on failure
        } else if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          setModalMessage("Payment successful. Updating order...");

          try {
            const updateResult = await updateWoocomOrder(
              orderInfo.id,
              "processing"
            );
            if (updateResult) {
              router.push("/thankyou"); // Keep the redirect
              return true; // Return true *after* the successful redirect
            } else {
              setModalMessage("Order update failed. Please contact support.");
              setIsProcessing(false);
              return false; // Return false if the order update fails
            }
          } catch (orderUpdateError) {
            console.error("Order update error:", orderUpdateError);
            setModalMessage("Order update failed. Please contact support.");
            setIsProcessing(false);
            return false; // Return false on order update error
          }
        } else if (
          result.paymentIntent &&
          result.paymentIntent.status === "requires_action"
        ) {
          setModalMessage("Payment requires additional action...");
          setIsProcessing(false); //Might require addtional action
          return false; // Return false - not a success (yet)
        } else {
          console.log("Payment status:", result.paymentIntent?.status);
          setModalMessage("Unexpected payment status. Please contact support.");
          setIsProcessing(false);
          return false; // Return false for unexpected statuses
        }
      } catch (stripeConfirmPaymentError) {
        // <--- Catch specifically stripe.confirmPayment errors
        console.error(
          "Stripe confirmPayment error:",
          stripeConfirmPaymentError
        );
        setModalMessage(
          "Stripe Payment confirmPayment failed. Please contact support."
        ); // More specific message
        setError("Stripe Payment confirmPayment failed.");
        setIsProcessing(false);
        return false; // Indicate payment processing failed
      }
    } catch (error) {
      // <--- Original catch block for other errors (like fetch)
      console.error("Payment error:", error);
      setModalMessage("Payment failed. Please contact support.");
      setIsProcessing(false);
      setError("Payment failed.");
      return false; // Return false on fetch/general error
    }
  };

  // Handler to cancel the order in WooCommerce, clear cart, and redirect
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const result = await updateWoocomOrder(orderInfo.id, "cancelled");
      if (!result) {
        console.error("Failed to cancel order on backend.");
        // You might show an error message or keep the modal open
        setIsCancelling(false);
        return;
      }
      // If cancellation succeeded, clear the cart & redirect
      setCartItems([]);
      removeCoupon();
      router.push("/shop");
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="border border-gray-300 rounded p-3">
          <PaymentElement />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-lime-500 text-white py-3 rounded-none hover:bg-lime-700"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
      </form>

      {/* Payment processing modal */}
      {isOrderModalOpen && orderInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md max-w-md w-full text-center">
            <h2 className="text-lg font-bold mb-4">Order Processing</h2>
            <p className="text-sm text-gray-700 mb-4">{modalMessage}</p>
            {/* Placeholder spinner - Conditionally render based on isProcessing*/}
            {isProcessing && (
              <div className="mb-4">
                <svg
                  className="animate-spin h-6 w-6 text-indigo-600 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>
            )}
            {/*  Show Cancel button when NOT processing AND there's an error */}
            {!isProcessing && error && (
              <>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 mr-5 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Cancel Order
                </button>

                <button
                  onClick={() => {
                    setIsOrderModalOpen(false); // Close the modal
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StripePaymentForm;
