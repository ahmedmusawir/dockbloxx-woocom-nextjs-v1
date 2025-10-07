"use client";

import { useState, useEffect, useMemo } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useCheckoutStore } from "@/store/useCheckoutStore";

interface ShippingMethodsProps {
  shippingData: {
    is_free_shipping_for_local_pickup: boolean;
    flat_rates: { subtotal_threshold: number; shipping_cost: number }[];
  };
  subtotal: number;
  availableMethods: string[];
}

const ShippingMethods = ({
  shippingData,
  subtotal,
  availableMethods,
}: ShippingMethodsProps) => {
  const { flat_rates } = shippingData;
  const { setShippingMethod, checkoutData } = useCheckoutStore();

  // Check if coupon has free_shipping, if so, add "Free Shipping" to the methods (without mutating)
  const effectiveAvailableMethods = useMemo(() => {
    if (
      checkoutData.coupon?.free_shipping &&
      !availableMethods.includes("Free Shipping")
    ) {
      console.log("[ShippingMethods] Adding 'Free Shipping' for coupon");
      return [...availableMethods, "Free Shipping"]; // Create new array
    }
    return availableMethods;
  }, [availableMethods, checkoutData.coupon?.free_shipping]);

  // Compute the applicable flat rate cost based on subtotal.
  const computedFlatRate = useMemo(() => {
    if (subtotal < 100) {
      // For orders under $100, use the $10 rate.
      return flat_rates.find((rate) => rate.subtotal_threshold === 100);
    } else if (subtotal < 250) {
      // For orders from $100 up to $249, use the $20 rate.
      return flat_rates.find((rate) => rate.subtotal_threshold === 250);
    } else {
      // For orders of $250 and above, use the $35 rate.
      return flat_rates.find((rate) => rate.subtotal_threshold === 300);
    }
  }, [flat_rates, subtotal]);

  // Build and memoize the shipping options list.
  const shippingOptions = useMemo(() => {
    const fullShippingOptions = [
      {
        id: "flat_rate",
        label: `Flat Rate`,
        // label: `Flat Rate - $${computedFlatRate?.shipping_cost ?? 10}`,
        cost: computedFlatRate?.shipping_cost ?? 10,
      },
      {
        id: "free_shipping",
        label: "Free Shipping - $0.00",
        cost: 0,
      },
      {
        id: "local_pickup",
        label: "Local Pickup - $0.00",
        cost: 0,
      },
    ];

    // Only include options that are available per effectiveAvailableMethods.
    return fullShippingOptions.filter((option) => {
      if (option.id === "flat_rate") {
        return effectiveAvailableMethods.some((m) => m.includes("Flat Rate"));
      }
      if (option.id === "free_shipping") {
        return effectiveAvailableMethods.includes("Free Shipping");
      }
      if (option.id === "local_pickup") {
        return effectiveAvailableMethods.includes("Local Pickup");
      }
      return false;
    });
  }, [effectiveAvailableMethods, computedFlatRate]);

  // Compute the default selection based on effectiveAvailableMethods.
  const computedDefaultSelection = useMemo(() => {
    // If coupon says free shipping, override everything
    if (checkoutData.coupon?.free_shipping) {
      return "free_shipping";
    }

    // Otherwise, fallback to the normal logic
    if (effectiveAvailableMethods.includes("Free Shipping")) {
      return "free_shipping";
    } else if (effectiveAvailableMethods.some((m) => m.includes("Flat Rate"))) {
      return "flat_rate";
    } else if (effectiveAvailableMethods.includes("Local Pickup")) {
      return "local_pickup";
    }

    return "";
  }, [effectiveAvailableMethods, checkoutData.coupon?.free_shipping]);

  // Manage the selected method state.
  const [selectedMethod, setSelectedMethod] = useState(
    computedDefaultSelection
  );

  // When availableMethods change, update selectedMethod only if the current one is no longer valid.
  useEffect(() => {
    if (!shippingOptions.find((option) => option.id === selectedMethod)) {
      setSelectedMethod(computedDefaultSelection);
    }
  }, [computedDefaultSelection, shippingOptions, selectedMethod]);

  // Update the checkout store whenever selectedMethod (or shippingOptions) changes.
  useEffect(() => {
    const chosenOption = shippingOptions.find((o) => o.id === selectedMethod);
    if (chosenOption) {
      setShippingMethod(
        selectedMethod as "free_shipping" | "flat_rate" | "local_pickup",
        chosenOption.cost
      );
    }
  }, [selectedMethod, shippingOptions, setShippingMethod]);

  return (
    <div className="mt-4 mb-10">
      <h1 className="text-2xl text-gray-900 mb-5">Shipping method</h1>

      {/* If free shipping coupon exists, just show that */}
      {checkoutData.coupon?.free_shipping ? (
        <div className="mt-4 p-4 border border-lime-300 rounded-none bg-lime-300">
          <span className="text-sm font-medium text-gray-900">
            Free Shipping Applied with Coupon: {checkoutData.coupon.code}
          </span>
        </div>
      ) : effectiveAvailableMethods.length === 0 ? (
        <div className="mt-4 p-4 border border-gray-300 rounded-none bg-white text-center text-gray-500">
          Please select a shipping address in order to see shipping quotes
        </div>
      ) : (
        <RadioGroup
          value={selectedMethod}
          onChange={(value) => setSelectedMethod(value)}
          className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"
        >
          {shippingOptions.map((option) => (
            <RadioGroup.Option
              key={option.id}
              value={option.id}
              className="group relative flex cursor-pointer rounded-none border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-transparent data-[focus]:ring-2 data-[focus]:ring-blue-500"
            >
              <span className="flex flex-1">
                <span className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </span>
              </span>
              <CheckCircleIcon
                aria-hidden="true"
                className="size-5 text-blue-500 [.group:not([data-checked])_&]:hidden"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500"
              />
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      )}
    </div>
  );
};

export default ShippingMethods;
