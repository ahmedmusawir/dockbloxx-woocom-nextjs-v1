"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import CartImage from "./CartImage";

const CartSlide = () => {
  const router = useRouter();

  // Access Zustand store
  const {
    cartItems,
    subtotal,
    removeCartItem,
    setIsCartOpen,
    isCartOpen,
    increaseCartQuantity,
    decreaseCartQuantity,
  } = useCartStore();

  // Handle quantity changes
  const handleQuantityChange = (
    itemId: number,
    action: "increase" | "decrease"
  ) => {
    if (action === "increase") {
      increaseCartQuantity(itemId); // Increase the quantity of the item
    } else if (action === "decrease") {
      const item = cartItems.find((item) => item.id === itemId);
      if (item?.quantity === 1) {
        removeCartItem(itemId); // Remove item if quantity is 1
      } else {
        decreaseCartQuantity(itemId); // Decrease the quantity of the item
      }
    }
  };

  // Redirect to shop if cart is empty after removal
  const handleRemoveCartItem = (id: number) => {
    removeCartItem(id);
    if (cartItems.length === 1) {
      router.push("/shop");
    }
  };

  // Go back to shop and close the cart drawer
  const goBackToShop = () => {
    router.push("/shop");
    setIsCartOpen(false);
  };

  return (
    <Dialog
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            {/* <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700"> */}
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Shopping Cart
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    {cartItems.length === 0 ? (
                      <h3 className="mt-12 text-center text-lg font-medium">
                        The Shopping Cart is empty!
                      </h3>
                    ) : (
                      <ul
                        role="list"
                        className="-my-6 divide-y divide-gray-200"
                      >
                        {cartItems.map((cartItem) => (
                          <li key={cartItem.id} className="flex py-6">
                            <CartImage
                              cartItem={cartItem}
                              imgHeight={85}
                              imgWidth={85}
                            />

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{cartItem.name}</h3>
                                  <p className="ml-4">{cartItem.price}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {cartItem.categories.map((c) => c.name)}
                                </p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                {/* Quantity Manage Block + & - */}
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-gray-700 border rounded-md"
                                    onClick={() =>
                                      handleQuantityChange(
                                        cartItem.id,
                                        "decrease"
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <input
                                    type="text"
                                    value={cartItem.quantity}
                                    readOnly
                                    className="mx-2 w-10 text-center border rounded-md"
                                  />
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-gray-700 border rounded-md"
                                    onClick={() =>
                                      handleQuantityChange(
                                        cartItem.id,
                                        "increase"
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  className="font-medium text-red-600 hover:text-red-500"
                                  onClick={() =>
                                    handleRemoveCartItem(cartItem.id)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${subtotal()}</p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={cartItems.length > 0 ? "/checkout" : "#"}
                      className={`flex items-center justify-center rounded-md px-6 py-3 text-base font-medium shadow-sm ${
                        cartItems.length > 0
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent"
                          : "bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Checkout
                    </Link>
                    <Link
                      href={cartItems.length > 0 ? "/cart" : "#"}
                      className={`flex items-center justify-center rounded-md px-6 py-3 text-base font-medium shadow-sm mt-5 ${
                        cartItems.length > 0
                          ? "bg-purple-600 text-white hover:bg-purple-700 border border-transparent"
                          : "bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Cart Page
                    </Link>
                  </div>

                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{" "}
                      <button
                        type="button"
                        onClick={goBackToShop}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CartSlide;
