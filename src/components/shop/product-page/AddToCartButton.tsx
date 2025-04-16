import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cart";

interface AddToCartButtonProps {
  cartItem: CartItem; // Pass the entire CartItem
  handleAddToCart: () => void; // Callback for handling add to cart logic
}

const AddToCartButton = ({
  cartItem,
  handleAddToCart,
}: AddToCartButtonProps) => {
  const { cartItems, setIsCartOpen, setCartItems } = useCartStore();

  // Testing
  // console.log("cartItems [AddToCartButton.tsx]", cartItems);

  // Check if the product is already in the cart
  const isProductInCart = cartItems.some((item) => item.id === cartItem.id);

  // Handle remove cart item
  const handleRemoveCartItem = () => {
    setCartItems(cartItems.filter((item) => item.id !== cartItem.id));
    setIsCartOpen(true);
  };

  return (
    <div className="flex w-full">
      {!isProductInCart && (
        <button
          className="flex flex-1 items-center justify-center rounded-none border border-transparent bg-lime-300 px-8 py-6 text-xl text-black font-bold hover:bg-lime-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-gray-50 w-full"
          onClick={handleAddToCart}
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
