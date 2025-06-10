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
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "view_item",
      ecommerce: {
        currency: "USD",
        value: Number(product.price) || 0,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categories?.[0]?.name || "Uncategorized",
            item_brand: "Dockbloxx",
            price: Number(product.price) || 0,
            quantity: 1,
          },
        ],
      },
    });
  };

  const trackAddToCart = (
    item: {
      id: number;
      name: string;
      category?: string;
      brand?: string;
      price: number;
    },
    quantity: number = 1
  ) => {
    if (process.env.NODE_ENV !== "production") return;

    trackEvent({
      event: "add_to_cart",
      ecommerce: {
        currency: "USD",
        value: Number(item.price) * quantity || 0,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_category: item.category || "Uncategorized",
            item_brand: item.brand || "Dockbloxx",
            price: item.price,
            quantity,
          },
        ],
      },
    });
  };

  return { trackViewItem, trackAddToCart };
};
