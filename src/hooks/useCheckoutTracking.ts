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
import { OrderPayload, OrderSummary } from "@/types/order";

export const useCheckoutTracking = () => {
  const trackBeginCheckout = (lineItems: OrderPayload["line_items"]) => {
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

  const trackPurchase = (order: OrderSummary) => {
    trackEvent({
      event: "purchase",
      ecommerce: {
        transaction_id: order.id,
        value: Number(order.total),
        currency: "USD",
        shipping: order.shippingCost ? Number(order.shippingCost) : 0,
        items: order.line_items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      },
    });
  };

  return { trackBeginCheckout, trackPurchase };
};
