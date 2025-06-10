/**
 * /hooks/useCheckoutTracking.ts
 *
 * Tracks checkout-related events and pushes them into the GTM dataLayer.
 * Includes begin_checkout and purchase.
 *
 * This hook ensures that all ecommerce tracking is consistent and
 * GA4/Stape compatible.
 */

import { trackEvent } from "@/lib/analytics";
import { CheckoutData } from "@/types/checkout";
import { OrderPayload, OrderSummary } from "@/types/order";

export const useCheckoutTracking = () => {
  /**
   * Tracks the start of the checkout process.
   * Fires the 'begin_checkout' event for GTM/GA4.
   * Only runs in production to prevent dev data pollution.
   *
   * @param lineItems - The items being checked out (from the cart/order payload).
   */
  const trackBeginCheckout = (lineItems: OrderPayload["line_items"]) => {
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "begin_checkout",
      ecommerce: {
        items: lineItems.map((item) => ({
          item_id: item.product_id,
          quantity: item.quantity,
        })),
      },
    });
  };

  /**
   * Tracks the completion of a purchase/order.
   * Fires the 'purchase' event for GTM/GA4, including user data for Stape/GA4 advanced matching.
   * Only runs in production.
   *
   * @param order - The finalized order summary containing all details.
   */
  const trackPurchase = (order: OrderSummary) => {
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "purchase",
      ecommerce: {
        transaction_id: order.id,
        affiliation: "Online Store",
        value: Number(order.total),
        currency: "USD",
        shipping: order.shippingCost ? Number(order.shippingCost) : 0,
        coupon: order.coupon || "",
        items: order.line_items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      },
      user_data: {
        email: order.billing.email,
        phone_number: order.billing.phone,
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        city: order.billing.city,
        state: order.billing.state,
        zip: order.billing.postcode,
        country: order.billing.country,
      },
    });
  };

  /**
   * Tracks when a user adds/shares their shipping information in the checkout flow.
   * Fires the 'add_shipping_info' event for GTM/GA4 monetization funnel.
   * Only runs in production.
   *
   * @param checkoutData - The current checkout store/state containing shipping, items, and totals.
   */
  const trackAddShippingInfo = (
    checkoutData: CheckoutData // If you have this type, use it; otherwise, 'any'
  ) => {
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "add_shipping_info",
      ecommerce: {
        currency: "USD",
        value: Number(checkoutData.total) || Number(checkoutData.subtotal) || 0,
        shipping_tier: checkoutData.shippingMethod || "",
        items:
          checkoutData.cartItems?.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
          })) || [],
      },
    });
  };

  // Track payment info entered
  const trackAddPaymentInfo = (checkoutData: CheckoutData) => {
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "add_payment_info",
      ecommerce: {
        currency: "USD",
        value: Number(checkoutData.total) || Number(checkoutData.subtotal) || 0,
        payment_type: checkoutData.paymentMethod || "stripe_card",
        items:
          checkoutData.cartItems?.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
          })) || [],
      },
    });
  };

  return {
    trackBeginCheckout,
    trackPurchase,
    trackAddShippingInfo,
    trackAddPaymentInfo,
  };
};
