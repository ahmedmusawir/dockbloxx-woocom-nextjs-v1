/**
 * /hooks/useProductTracking.ts
 *
 * Tracks product-related events and pushes them into the GTM dataLayer.
 * Includes view_item and add_to_cart.
 *
 * This hook wraps around the analytics core utility to provide
 * consistent, structured event formats for eCommerce tracking.
 */

import { trackEvent } from "@/lib/analytics";
import { Product } from "@/types/product";

export const useProductTracking = () => {
  const trackViewItem = (product: Product) => {
    trackEvent({
      event: "view_item",
      ecommerce: {
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categories[0].name || "Uncategorized",
            item_brand: "Dockbloxx",
            price: product.price,
            quantity: 1,
          },
        ],
      },
    });
  };

  const trackAddToCart = (product: Product, quantity: number = 1) => {
    trackEvent({
      event: "add_to_cart",
      ecommerce: {
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categories[0].name || "Uncategorized",
            item_brand: "Dockbloxx",
            price: product.price,
            quantity,
          },
        ],
      },
    });
  };

  return { trackViewItem, trackAddToCart };
};
