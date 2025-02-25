"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import LeftPane from "@/components/checkout/left-pane/LeftPane";
import RightPane from "@/components/checkout/right-pane/RightPane";
import Spinner from "@/components/common/Spinner";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCheckoutStore } from "@/store/useCheckoutStore";

// Load Stripe using your publishable key (exposed with NEXT_PUBLIC_ prefix)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPageContent = () => {
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;

  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  // From our checkout store, get the stored PaymentIntent client secret and setter.
  const { paymentIntentClientSecret, setPaymentIntentClientSecret } =
    useCheckoutStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      router.push("/shop");
    }
  }, [mounted, cartItems, router]);

  // Fetch PaymentIntent client secret from your API endpoint
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        // If we already have a stored client secret, use it.
        if (paymentIntentClientSecret) {
          setClientSecret(paymentIntentClientSecret);
          return;
        }
        // Otherwise, create a new PaymentIntent.
        const response = await fetch(`${SITE_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Pass real order data here:
            amount: 52, // e.g. $50.00 in cents
            currency: "usd",
          }),
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
        // Store the client secret in Zustand for later reuse.
        setPaymentIntentClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error fetching client secret:", error);
      }
    };

    fetchClientSecret();
  }, [SITE_URL, paymentIntentClientSecret, setPaymentIntentClientSecret]);

  if (!mounted || !clientSecret) return <Spinner />;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h1>Checkout</h1>
            <section className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              <LeftPane />
              <RightPane />
            </section>
          </div>
        </main>
      </div>
    </Elements>
  );
};

export default CheckoutPageContent;
