"use client";

import { CartItem } from "@/types/cart";
import React, { useEffect } from "react";

interface SimplePricingProps {
  productPrice: number; // Price passed from the global JSON
  onPriceChange: (price: number | null) => void;
  cartItem: CartItem; // Pass the CartItem state
  setCartItem: React.Dispatch<React.SetStateAction<CartItem>>; // Update CartItem state
}

const SimplePricing = ({
  productPrice,
  onPriceChange,
  setCartItem,
}: SimplePricingProps) => {
  // Set the price and update the cart item on mount
  useEffect(() => {
    onPriceChange(productPrice);

    // Update cart item with the base price
    setCartItem((prev) => ({
      ...prev,
      basePrice: productPrice,
      price: productPrice * prev.quantity, // Update price based on quantity
      variations: [], // No variations for SimplePricing
    }));
  }, [productPrice, onPriceChange, setCartItem]);

  return (
    <div className="mt-10">
      {/* <p className="text-sm text-gray-600">This product has no variations.</p> */}
    </div>
  );
};

export default SimplePricing;
