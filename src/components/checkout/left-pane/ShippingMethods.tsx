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
  const { setShippingMethod } = useCheckoutStore();

  // // Compute the applicable flat rate cost based on subtotal.
  const computedFlatRate = useMemo(() => {
    // Assuming flat_rates is an array from the JSON:
    // [
    //   { subtotal_threshold: 100, shipping_cost: 10 },
    //   { subtotal_threshold: 250, shipping_cost: 20 },
    //   { subtotal_threshold: 300, shipping_cost: 35 }
    // ]
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
        label: `Flat Rate - $${computedFlatRate?.shipping_cost ?? 10}`,
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

    // Only include options that are available per availableMethods prop.
    return fullShippingOptions.filter((option) => {
      if (option.id === "flat_rate") {
        return availableMethods.some((m) => m.includes("Flat Rate"));
      }
      if (option.id === "free_shipping") {
        return availableMethods.includes("Free Shipping");
      }
      if (option.id === "local_pickup") {
        return availableMethods.includes("Local Pickup");
      }
      return false;
    });
  }, [availableMethods, computedFlatRate]);

  // Compute the default selection based on availableMethods.
  const computedDefaultSelection = useMemo(() => {
    if (availableMethods.includes("Free Shipping")) {
      return "free_shipping";
    } else if (availableMethods.includes("Local Pickup")) {
      return "local_pickup";
    } else if (availableMethods.some((m) => m.includes("Flat Rate"))) {
      return "flat_rate";
    }
    return "";
  }, [availableMethods]);

  // Manage the selected method state.
  const [selectedMethod, setSelectedMethod] = useState(
    computedDefaultSelection
  );

  // When availableMethods change, update selectedMethod only if the current one is no longer valid.
  useEffect(() => {
    if (!shippingOptions.find((option) => option.id === selectedMethod)) {
      setSelectedMethod(computedDefaultSelection);
    }
    // We intentionally do not force-reset if the user has made a manual change.
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
    <div className="mt-4">
      <h1 className="text-2xl text-gray-900">Delivery method</h1>

      {/* Show an empty message if no shipping methods are available */}
      {availableMethods.length === 0 ? (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white text-center text-gray-500">
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
              className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-transparent data-[focus]:ring-2 data-[focus]:ring-indigo-500"
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
                className="size-5 text-indigo-600 [.group:not([data-checked])_&]:hidden"
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
