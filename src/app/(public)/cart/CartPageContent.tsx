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

const relatedProducts = [
  {
    id: 1,
    name: "Billfold Wallet",
    href: "#",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356460/bxnjpaubvbqedieglq2w.jpg",
    imageAlt: "Front of Billfold Wallet in natural leather.",
    price: "$118",
    color: "Natural",
  },
  {
    id: 2,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Sienna",
    inStock: true,
    size: "Large",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356435/qvg6d7teq8hm1wnbup2a.jpg",
    imageAlt: "Front of men's Basic Tee in sienna.",
  },
  {
    id: 3,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Black",
    inStock: false,
    leadTime: "3–4 weeks",
    size: "Large",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356511/kqtfimpi1wbohxxujjkp.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
  },
  {
    id: 4,
    name: "Nomad Tumbler",
    href: "#",
    price: "$35.00",
    color: "White",
    inStock: true,
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356684/ite2ep7qmfj8yebjxdhi.jpg",
    imageAlt: "Insulated bottle with white base and black snap lid.",
  },
  // More products...
];

const CartPageContent = () => {
  const router = useRouter();
  // Access Zustand store
  const {
    cartItems,
    subtotal,
    removeCartItem,
    setIsCartOpen,
    isLoading,
    setCartItems,
    increaseCartQuantity,
    decreaseCartQuantity,
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
    <div className="bg-white">
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl text-center font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>

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

        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
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
                                className="font-medium text-gray-700 hover:text-gray-800"
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
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {product.price}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <div className="inline-grid w-full max-w-16 grid-cols-1">
                            <select
                              id={`quantity-${product.id}`}
                              name={`quantity-${product.id}`}
                              value={product.quantity}
                              aria-label={`Quantity, ${product.name}`}
                              className="col-start-1 row-start-1 appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  parseInt(e.target.value, 10)
                                )
                              }
                            >
                              {[...Array(10).keys()].map((n) => (
                                <option key={n + 1} value={n + 1}>
                                  {n + 1}
                                </option>
                              ))}
                            </select>

                            <ChevronDownIcon
                              aria-hidden="true"
                              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
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
                                className="size-5"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {product.id ? (
                          <CheckIcon
                            aria-hidden="true"
                            className="size-5 shrink-0 text-green-500"
                          />
                        ) : (
                          <ClockIcon
                            aria-hidden="true"
                            className="size-5 shrink-0 text-gray-300"
                          />
                        )}

                        <span>
                          {product.id ? "In stock" : `Ships in ${product.id}`}
                        </span>
                      </p>
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
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${subtotal()}
                  </dd>
                </div>
                {/* <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <a
                      href="#"
                      className="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how shipping is calculated
                      </span>
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="size-5"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">$5.00</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>
                    <a
                      href="#"
                      className="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how tax is calculated
                      </span>
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="size-5"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">$8.32</dd>
                </div> */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${subtotal().toFixed(2)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <Link href={"/checkout"} type="submit">
                  <div className="text-center w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                    Checkout
                  </div>
                </Link>
              </div>
            </section>
          )}
        </form>

        {/* Related products */}
        {cartItems.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-24">
            <h2
              id="related-heading"
              className="text-lg font-medium text-gray-900"
            >
              You may also like&hellip;
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group relative">
                  <img
                    alt={relatedProduct.imageAlt}
                    src={relatedProduct.imageSrc}
                    className="aspect-square w-full rounded-md object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                  />
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">
                        <a href={relatedProduct.href}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {relatedProduct.name}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {relatedProduct.color}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {relatedProduct.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CartPageContent;
