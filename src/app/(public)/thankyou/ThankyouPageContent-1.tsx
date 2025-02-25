"use client";

import Spinner from "@/components/common/Spinner";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ThankyouPageContent = () => {
  const router = useRouter();
  const { cartItems, subtotal, isLoading, getItemQuantity, clearCart } =
    useCartStore();
  const { removeCoupon } = useCheckoutStore();
  const [latestOrder, setLatestOrder] = useState<any>(null);

  // Makes sure Zustand states are loaded and then clear cart & coupon,
  // and pick up the latest order from localStorage.
  useEffect(() => {
    // Clear the cart and coupon AFTER the order is finalized
    clearCart();
    removeCoupon();

    // Retrieve the latest order from localStorage
    const storedOrder = localStorage.getItem("latestOrder");
    if (storedOrder) {
      setLatestOrder(JSON.parse(storedOrder));
    }
  }, [clearCart, removeCoupon]);

  // Makes sure Zustand states are loaded
  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <main className="relative lg:min-h-full">
        <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
          <img
            alt="TODO"
            src="https://res.cloudinary.com/dyb0qa58h/image/upload/v1693546210/39483523_wtpocj.webp"
            className="size-full object-cover"
          />
        </div>

        <div>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
            <div className="lg:col-start-2">
              <h1 className="text-sm font-medium text-indigo-600">
                Payment successful
              </h1>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Thanks for ordering
              </p>
              <p className="mt-2 text-base text-gray-500">
                We appreciate your order, we’re currently processing it. So hang
                tight and we’ll send you confirmation very soon!
              </p>

              <dl className="mt-16 text-sm font-medium">
                <dt className="text-gray-900">Tracking number</dt>
                <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
              </dl>

              {/* <ul
                role="list"
                className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500"
              >
                {cartItems.map((product) => (
                  <li key={product.id} className="flex space-x-6 py-6">
                    <img
                      alt={product.name}
                      src={product.image}
                      className="size-24 flex-none rounded-md bg-gray-100 object-cover"
                    />
                    <div className="flex-auto space-y-1">
                      <h3 className="text-gray-900">
                        <Link href={`/shop/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p>{product.categories?.map((cat) => cat.name)}</p>
                      <p>qty: {getItemQuantity(product.id)}</p>
                    </div>
                    <p className="flex-none font-medium text-gray-900">
                      {product.price}
                    </p>
                  </li>
                ))}
              </ul> */}

              {latestOrder ? (
                <div className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
                  <div className="py-6">
                    <h3 className="text-sm font-medium text-gray-900">
                      Order Summary
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {latestOrder.line_items.map((item: any) => (
                        <li
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>${item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="py-6">
                    <div className="flex justify-between">
                      <span className="font-medium">Discount</span>
                      <span className="text-red-600">
                        - ${latestOrder.discountTotal}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="font-medium">Shipping</span>
                      <span>${latestOrder.shippingCost}</span>
                    </div>
                    <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${latestOrder.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No order details available.</p>
              )}

              <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-900">${subtotal()}</dd>
                </div>

                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-gray-900">$8.00</dd>
                </div>

                <div className="flex justify-between">
                  <dt>Taxes</dt>
                  <dd className="text-gray-900">$5.00</dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">${subtotal() + 8.6 + 5}</dd>
                </div>
              </dl>

              <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                <div>
                  <dt className="font-medium text-gray-900">
                    Shipping Address
                  </dt>
                  <dd className="mt-2">
                    <address className="not-italic">
                      <span className="block">Kristin Watson</span>
                      <span className="block">7363 Cynthia Pass</span>
                      <span className="block">Toronto, ON N3Y 4H8</span>
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">
                    Payment Information
                  </dt>
                  <dd className="mt-2 space-y-2 sm:flex sm:space-x-4 sm:space-y-0">
                    <div className="flex-none">
                      <svg
                        width={36}
                        height={24}
                        viewBox="0 0 36 24"
                        aria-hidden="true"
                        className="h-6 w-auto"
                      >
                        <rect rx={4} fill="#224DBA" width={36} height={24} />
                        <path
                          d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                          fill="#fff"
                        />
                      </svg>
                      <p className="sr-only">Visa</p>
                    </div>
                    <div className="flex-auto">
                      <p className="text-gray-900">Ending with 4242</p>
                      <p>Expires 12 / 21</p>
                    </div>
                  </dd>
                </div>
              </dl>

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ThankyouPageContent;
