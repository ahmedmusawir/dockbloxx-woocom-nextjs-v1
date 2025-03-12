"use client";

import CartImage from "@/components/cart/CartImage";
import Spinner from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useNumberedPaginationStore } from "@/store/useNumberedPaginationStore";
import { useProductStore } from "@/store/useProductStore";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import {
  CheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const CartItems = () => {
  const router = useRouter();
  // Access Zustand store
  const {
    cartItems,
    subtotal,
    removeCartItem,
    setIsCartOpen,
    isLoading,
    setCartItems,
  } = useCartStore();

  // Closes the sidebar Cart Slide
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]); // This runs once when the component mounts

  // Makes sure Zustand states are loaded
  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  // Handle quantity changes
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems); // Update Zustand store
  };

  // Redirect to shop if cart is empty
  const handleRemoveCartItem = (id: number) => {
    removeCartItem(id);

    if (cartItems.length === 0) {
      console.log("Cart Items [CartPageContent.tsx]:", cartItems);
      router.push("/shop");
      const { resetPagination } = useNumberedPaginationStore.getState();
      const totalProducts = useProductStore.getState().products.length; // Dynamically get total product count
      resetPagination([], totalProducts); // Reset pagination with dynamic total
    }
    console.log("Cart Items [CartPageContent.tsx]:", cartItems);
  };

  // Go back to shop link
  const goBackToShop = () => {
    router.push("/shop");
    setIsCartOpen(false);
  };
  return (
    <>
      {cartItems.length === 0 && (
        <>
          <h2 className="text-center mt-5">Your Cart Is Empty!</h2>
          <figure className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dyb0qa58h/image/upload/v1725423361/NO-ITEM-FOUND_bwdwum.webp"
              alt=""
            />
          </figure>
          <div className="flex justify-center">
            <Link href={"/shop"}>
              <Button>Go Back To Shop</Button>
            </Link>
          </div>
        </>
      )}

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {cartItems.length > 0 && (
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-b border-t border-gray-200"
            >
              {cartItems.map((product) => (
                <li key={product.id} className="flex py-6 sm:py-10">
                  <div className="shrink-0">
                    <CartImage
                      cartItem={product}
                      imgHeight={200}
                      imgWidth={200}
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link
                              href={`/shop/${product.id}`}
                              className="text-xl font-bold text-gray-700 hover:text-gray-800"
                            >
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="mt-1 flex text-sm">
                          <p className="text-gray-500">
                            {product.categories.map((cat) => cat.name)}
                          </p>
                        </div>
                        <p className="mt-1 text-xl font-bold text-gray-900">
                          ${product.price}.00
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center gap-2">
                          {/* Decrease Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                Math.max(1, product.quantity - 1)
                              )
                            }
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="text-2xl flex h-12 w-12 items-center justify-center rounded-full border-2 border-lime-500 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            −
                          </button>

                          {/* Quantity Display */}
                          <span className="w-6 text-center text-base font-medium text-gray-900">
                            {product.quantity}
                          </span>

                          {/* Increase Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                product.quantity + 1
                              )
                            }
                            aria-label={`Increase quantity of ${product.name}`}
                            className="text-2xl flex h-12 w-12 items-center justify-center rounded-full border-2 border-lime-500 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            +
                          </button>
                        </div>

                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => handleRemoveCartItem(product.id)}
                          >
                            <span className="sr-only">Remove</span>
                            <XMarkIconMini
                              aria-hidden="true"
                              className="size-8"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* ORDER SUMMARY */}
        {cartItems.length > 0 && (
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-none bg-gray-00 px-4 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 border border-gray-300"
          >
            <h2
              id="summary-heading"
              className="text-3xl font-extrabold text-gray-900 pt-10"
            >
              Order Summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-lg text-gray-600">Subtotal</dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${subtotal()}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-2xl font-bold text-gray-900">
                  Order total
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  ${subtotal().toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pb-10">
              <Link href={"/checkout"} type="submit">
                <div className="text-center w-full rounded-none border border-transparent bg-lime-500 px-4 py-4 text-base font-medium text-white shadow-sm hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                  Checkout
                </div>
              </Link>
            </div>
            <div className="mt-1 pb-1 flex justify-center">
              <Image
                src="/all-cards-dockbloxx.png"
                alt="Accepted Payment Methods"
                width={250}
                height={50}
                priority
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default CartItems;
