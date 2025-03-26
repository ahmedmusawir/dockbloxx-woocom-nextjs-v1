"use client";

import React, { useEffect, useState } from "react";
import { OrderSummary } from "@/types/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateWoocomOrder } from "@/services/orderServices";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/useCheckoutStore";

// Define the props using the OrderSummary interface.
interface OrderInfoDialogProps {
  orderInfo: OrderSummary;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  // onClose: () => void;
}

const OrderInfoDialog = ({
  orderInfo,
  isOpen,
  onConfirm,
  onCancel,
}: // onClose,
OrderInfoDialogProps) => {
  const router = useRouter();
  const { setCartItems } = useCartStore();
  const { removeCoupon } = useCheckoutStore();
  const [isCancelling, setIsCancelling] = useState(false);

  // 1. Handler to cancel the order in WooCommerce, clear cart, and redirect
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      {/* 
        max-w-md = set a medium max width
        w-full   = ensure it uses full width up to max
        p-6      = padding for spacing
        text-sm  = smaller text for a cleaner, more compact look
        space-y-4 = vertical spacing between elements
      */}
      <DialogContent className="max-w-md w-full p-6 text-sm text-gray-700 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Confirm Your Order
          </DialogTitle>
        </DialogHeader>

        {/* Order Metadata (ID & Status) */}
        <div className="space-y-1">
          <p>
            <span className="font-semibold">Order ID:</span> {orderInfo.id}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {orderInfo.status}
          </p>
        </div>

        {/* Items Section */}
        {orderInfo.line_items && orderInfo.line_items.length > 0 && (
          <div className="border border-gray-200 rounded-md p-3">
            <h3 className="text-base font-semibold mb-2">Items</h3>
            <ul className="list-disc ml-5 space-y-1">
              {orderInfo.line_items.map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{item.name}</span> &times;{" "}
                  {item.quantity}{" "}
                  <span className="text-gray-600">(@ ${item.price} each)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discount, Shipping, Total */}
        <div className="space-y-1">
          {/* Discount */}
          {orderInfo.discountTotal &&
            parseFloat(orderInfo.discountTotal) > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Discount</span>
                <span className="text-red-600">
                  - ${orderInfo.discountTotal}
                </span>
              </div>
            )}

          {/* Shipping */}
          {orderInfo.shippingCost && parseFloat(orderInfo.shippingCost) > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Shipping</span>
              <span>${orderInfo.shippingCost}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold">${orderInfo.total}</span>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-4">
          <button
            // onClick={onCancel}
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Confirm Order
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderInfoDialog;
