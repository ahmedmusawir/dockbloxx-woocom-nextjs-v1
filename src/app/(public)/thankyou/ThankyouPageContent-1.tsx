"use client";

import Spinner from "@/components/common/Spinner";
import { regCustomer } from "@/services/customerService";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useCheckoutTracking } from "@/hooks/useCheckoutTracking";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSignupTracking } from "@/hooks/useSignupTracking";

const ThankyouPageContent = () => {
  const { isLoading, clearCart } = useCartStore();
  const { removeCoupon, checkoutData, enableRegistration } = useCheckoutStore();
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const isCustomerRegistered = useRef(false);

  const hasTrackedPurchase = useRef(false);
  const { trackPurchase } = useCheckoutTracking();

  const { trackSignup } = useSignupTracking();

  useEffect(() => {
    // Clear the cart and coupon AFTER the order is finalized
    clearCart();
    removeCoupon();

    // Scroll to the top of the page when the component loads
    window.scrollTo(0, 0);

    // Retrieve the latest order from localStorage
    const storedOrder = localStorage.getItem("latestOrder");
    if (storedOrder) {
      const parsed = JSON.parse(storedOrder);
      setLatestOrder(parsed);

      // Track GTM purchase only once
      if (!hasTrackedPurchase.current) {
        hasTrackedPurchase.current = true;
        trackPurchase(parsed);
      }
    }

    // Register customer only once
    if (
      !isCustomerRegistered.current &&
      enableRegistration &&
      checkoutData.billing.email
    ) {
      isCustomerRegistered.current = true; // Prevent infinite loop
      regCustomer({
        email: checkoutData.billing.email,
        first_name: checkoutData.billing.first_name,
        last_name: checkoutData.billing.last_name,
        billing: checkoutData.billing,
        shipping: checkoutData.shipping,
      }).then((res) => {
        if (res) {
          console.log("Customer registered successfully:", res);
          // GTM Signup Tracking
          trackSignup({
            id: res.id?.toString() || checkoutData.billing.email,
            email: checkoutData.billing.email,
            plan: "checkout_signup",
            source: "order_checkout",
          });
        } else {
          console.error("Customer registration failed");
        }
      });
    }
  }, []); // Run only once after mount

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <main className="relative lg:min-h-full">
        <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
          <img
            alt="TODO"
            src="/home-header-bg.jpg"
            className="size-full object-cover"
          />
        </div>

        <div>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
            <div className="lg:col-start-2">
              <h1 className="text-sm font-medium text-indigo-600">
                Payment successful
              </h1>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Thanks for ordering
              </p>
              <p className="mt-2 text-base text-gray-500">
                We appreciate your order, we’re currently processing it. So hang
                tight and we’ll send you confirmation very soon!
              </p>

              {latestOrder ? (
                <div className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
                  <div className="py-6">
                    <h3 className="text-sm font-medium text-gray-900">
                      Order Summary
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {latestOrder.line_items.map((item: any) => (
                        <li
                          key={item.id}
                          className="flex items-center space-x-3"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {item.name} x {item.quantity}
                              </span>
                              <span>${item.price}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="py-6 space-y-2">
                    {latestOrder.discountTotal &&
                      parseFloat(latestOrder.discountTotal) > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium">Discount</span>
                          <span className="text-red-600">
                            - ${latestOrder.discountTotal}
                          </span>
                        </div>
                      )}
                    {latestOrder.shippingCost &&
                      parseFloat(latestOrder.shippingCost) > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium">Shipping</span>
                          <span>${latestOrder.shippingCost}</span>
                        </div>
                      )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${latestOrder.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No order details available.</p>
              )}

              <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                {latestOrder ? (
                  <div>
                    <dt className="font-medium text-gray-900">
                      Shipping Address
                    </dt>
                    <dd className="mt-2">
                      <address className="not-italic">
                        <span className="block">
                          {latestOrder.shipping.first_name}{" "}
                          {latestOrder.shipping.last_name}
                        </span>
                        <span className="block">
                          {latestOrder.shipping.address_1}
                        </span>
                        <span className="block">
                          {latestOrder.shipping.city},{" "}
                          {latestOrder.shipping.postcode}
                        </span>
                        <span className="block">
                          Phone: {latestOrder.shipping.phone}
                        </span>
                      </address>
                    </dd>
                  </div>
                ) : (
                  <p>No order details available.</p>
                )}
              </dl>

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <Link
                  href="/shop"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ThankyouPageContent;
