"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cart";
import { useProductTracking } from "@/hooks/useProductTracking";

interface AddToCartButtonProps {
  cartItem: CartItem; // Pass the entire CartItem
  handleAddToCart: () => void; // (used for ROUND OTHER CUSTOM FIELD variation logic & zustand store)
}

const AddToCartButton = ({
  cartItem,
  handleAddToCart,
}: AddToCartButtonProps) => {
  // Delegate click to parent handler
  const handleClick = () => {
    handleAddToCart();
  };

  // console.log("CartItem [AddToCartButton]", cartItem);

  return (
    <div className="flex w-full">
      <button
        className="flex flex-1 items-center justify-center rounded-none border border-transparent bg-lime-300 px-8 py-6 text-xl text-black font-bold hover:bg-lime-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-gray-50 w-full"
        onClick={handleClick}
      >
        ADD TO CART
      </button>
    </div>
  );
};

export default AddToCartButton;
