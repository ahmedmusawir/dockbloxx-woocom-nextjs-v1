"use client";

import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import ShippingMethods from "./ShippingMethods";
import ShippingForm from "./ShippingForm";
import BillingForm from "./BillingForm";

// Function to retrieve shipping data from the embedded script
const getShippingData = () => {
  const script = document.getElementById("shipping-data");
  return script ? JSON.parse(script.textContent || "{}") : null;
};

const ShippingInfo = () => {
  const { checkoutData, setShipping, setShippingMethod } = useCheckoutStore();

  // Use Zustand's state directly instead of local state reset
  const [shipping, setLocalShipping] = useState(checkoutData.shipping);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [shippingData, setShippingData] = useState<{
    local_pickup_zipcodes: string[];
    flat_rates: { subtotal_threshold: number; shipping_cost: number }[];
    is_free_shipping_for_local_pickup: boolean;
  } | null>(null);

  const subtotal = checkoutData.subtotal;

  useEffect(() => {
    const data = getShippingData();
    if (!data) return;

    setShippingData(data);

    const { local_pickup_zipcodes, flat_rates, is_free_shipping_for_local } =
      data;
    let methods: string[] = [];
    const isValidZip = /^\d{5}$/.test(shipping.postcode);

    if (!isValidZip) {
      setAvailableMethods([]);
      return;
    }

    if (local_pickup_zipcodes.includes(shipping.postcode)) {
      if (is_free_shipping_for_local) {
        // Push both options when free shipping is enabled
        methods.push("Free Shipping");
        methods.push("Local Pickup");
      } else {
        methods.push("Local Pickup");
      }
    } else {
      const applicableRates = flat_rates.filter(
        (rate: { subtotal_threshold: number; shipping_cost: number }) =>
          subtotal >= rate.subtotal_threshold
      );
      const applicableRate =
        applicableRates.length > 0
          ? applicableRates.reduce(
              (
                prev: { subtotal_threshold: number; shipping_cost: number },
                curr: { subtotal_threshold: number; shipping_cost: number }
              ) =>
                curr.subtotal_threshold > prev.subtotal_threshold ? curr : prev
            )
          : flat_rates[0];
      methods.push(`Flat Rate - $${applicableRate?.shipping_cost}`);
    }
    setAvailableMethods(methods);

    // Persist shipping method if not already set
    if (!checkoutData.shippingMethod) {
      if (methods.includes("Free Shipping")) {
        setShippingMethod("free_shipping", 0);
      } else if (methods.includes("Local Pickup")) {
        setShippingMethod("local_pickup", 0);
      } else if (methods.some((m) => m.includes("Flat Rate"))) {
        const flatRateStr = methods.find((m) => m.includes("Flat Rate")) || "";
        const cost = Number(flatRateStr.split("$")[1]) || 0;
        setShippingMethod("flat_rate", cost);
      }
    }
  }, [
    shipping.postcode,
    subtotal,
    checkoutData.shippingMethod,
    setShippingMethod,
  ]);

  const debouncedUpdate = debounce((updatedShipping) => {
    setShipping(updatedShipping);
  }, 300);

  // Ensure persisted shipping data is set properly across page reloads
  useEffect(() => {
    setLocalShipping(checkoutData.shipping);
    debouncedUpdate(checkoutData.shipping);
    return () => debouncedUpdate.cancel();
  }, [checkoutData.shipping]);

  // Input change handler updates the store immediately
  const handleInputChange = (field: keyof typeof shipping, value: string) => {
    setShipping({ ...shipping, [field]: value });
  };

  return (
    <div className="mt-4">
      {/* Shipping From w/ zod validation */}
      <ShippingForm />

      {/* Shipping Method Selection Box */}
      <div className="mt-10">
        {shippingData && (
          <ShippingMethods
            availableMethods={availableMethods}
            shippingData={shippingData}
            subtotal={subtotal}
          />
        )}
      </div>

      {/* Billing From w/ zod validation */}
      <BillingForm />
    </div>
  );
};

export default ShippingInfo;
