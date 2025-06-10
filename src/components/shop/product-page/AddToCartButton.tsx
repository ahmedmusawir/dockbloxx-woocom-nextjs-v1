"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cart";
import { useProductTracking } from "@/hooks/useProductTracking";

interface AddToCartButtonProps {
  cartItem: CartItem; // Pass the entire CartItem
  handleAddToCart: () => void; // Callback for handling add to cart logic
}

const AddToCartButton = ({
  cartItem,
  handleAddToCart,
}: AddToCartButtonProps) => {
  const { cartItems, setIsCartOpen, setCartItems } = useCartStore();

  const { trackAddToCart } = useProductTracking();

  // Check if the product is already in the cart
  const isProductInCart = cartItems.some((item) => item.id === cartItem.id);

  // Handle remove cart item
  const handleRemoveCartItem = () => {
    setCartItems(cartItems.filter((item) => item.id !== cartItem.id));
    setIsCartOpen(true);
  };

  // Handle click w/ add to cart and GTM Tracking
  const handleClick = () => {
    handleAddToCart();
    trackAddToCart(
      {
        id: cartItem.id,
        name: cartItem.name,
        category: cartItem.categories[0].name || "Uncategorized",
        brand: "Dockbloxx",
        price: Number(cartItem.basePrice),
      },
      cartItem.quantity || 1
    );
  };

  console.log("CartItem [AddToCartButton]", cartItem);

  return (
    <div className="flex w-full">
      {!isProductInCart && (
        <button
          className="flex flex-1 items-center justify-center rounded-none border border-transparent bg-lime-300 px-8 py-6 text-xl text-black font-bold hover:bg-lime-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-gray-50 w-full"
          onClick={handleClick}
        >
          ADD TO CART
        </button>
      )}
      {isProductInCart && (
        <button
          className="flex flex-1 items-center justify-center rounded-md border border-transparent bg-red-600 px-8 py-3 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50 w-full"
          onClick={handleRemoveCartItem}
        >
          Remove from Cart
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
