"use client";

import { CartItem } from "@/types/cart";
import React from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

interface Props {
  cartData: CartItem[];
}

const CheckoutCartItems = ({ cartData }: Props) => {
  const router = useRouter();
  const { makeKey } = useCartStore();

  return (
    <>
      <h3 className="sr-only">Items in your cart</h3>
      <ul role="list" className="divide-y divide-gray-200">
        {cartData.length > 0 &&
          cartData.map((product) => (
            <li key={makeKey(product)} className="flex px-4 py-6 sm:px-6">
              <div className="shrink-0">
                <img
                  alt={product.name}
                  src={product.image}
                  className="w-20 rounded-md"
                />
              </div>
              <div className="ml-6 flex flex-1 flex-col">
                <div className="flex">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-gray-700 hover:text-gray-800">
                      {product.name}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 font-bold">
                      {product.categories.map((c) => c.name).join(" · ")}
                    </p>

                    <p className="my-2 text-xs text-gray-500 font-bold">
                      {product.variations
                        .filter((c) => c.value !== "Unknown")
                        .map((c) => c.value)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between pt-2">
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    ${product.price}
                  </p>
                  <p>{product.quantity} Item/s</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

export default CheckoutCartItems;
