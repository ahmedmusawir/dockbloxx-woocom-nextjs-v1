import { CheckoutData } from "@/types/checkout";

/**
 * Submits an order to WooCommerce via our Next.js backend endpoint.
 *
 * This function sends a POST request to the '/api/place-order/route' endpoint using the
 * assembled Order Object (of type OrderPayload) from the checkout store. The backend endpoint
 * then forwards this request to WooCommerce with the appropriate authentication credentials.
 *
 * @param order - The order payload containing billing, shipping, line items, shipping lines, and coupon lines.
 * @returns A promise that resolves to the WooCommerce order data on success, or null if the submission fails.
 */
export const createWoocomOrder = async (order: CheckoutData): Promise<any> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/place-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      }
    );

    if (!response.ok) {
      console.error("Order submission failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting order:", error);
    return null;
  }
};

/**
 * Updates the status of an existing WooCommerce order via our Next.js backend endpoint.
 *
 * This function sends a POST request to the `/api/update-order-status` endpoint with the
 * specified order ID and the new status. The backend endpoint then forwards this request to
 * WooCommerce using the appropriate authentication credentials.
 *
 * Use this function to update an order's status to "processing" after a successful payment,
 * or to "cancelled" if the customer decides to cancel their order.
 *
 * @param orderId - The unique identifier of the WooCommerce order to update.
 * @param newStatus - The new status to set for the order (e.g., "processing", "cancelled").
 * @returns A promise that resolves to the updated order data on success, or null if the update fails.
 */
export const updateWoocomOrder = async (
  orderId: number,
  newStatus: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/update-order-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, newStatus }),
      }
    );

    if (!response.ok) {
      console.error("Order update failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
};
