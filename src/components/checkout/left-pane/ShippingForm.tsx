"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import dynamic from "next/dynamic";

// 1. Extend the Zod schema for shipping fields, adding "state"
const shippingSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address_1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.preprocess(
    (val) => (val === null ? "" : val),
    z.string().min(2, "State is required")
  ),
  postcode: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  phone: z.string().regex(/^\d{10,15}$/, "Invalid phone number"),
});

// 2. Infer the TypeScript type from the Zod schema
type ShippingFormValues = z.infer<typeof shippingSchema>;

const ShippingForm = () => {
  const {
    checkoutData,
    setShipping,
    setBilling,
    billingSameAsShipping,
    setBillingSameAsShipping,
    setIsAnyBlockEditing,
  } = useCheckoutStore();

  // Local state to control editing mode.
  const [isEditing, setIsEditing] = useState<boolean>(
    !checkoutData.shipping.first_name
  );

  // 3. Use the Zod schema as the resolver for React Hook Form.
  //    Destructure "reset" so we can update the form when checkoutData.shipping changes.
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: checkoutData.shipping,
  });

  // 3. Whenever checkoutData.shipping updates (e.g., on mount or after Save),
  //      reset the form with the latest values.
  useEffect(() => {
    reset(checkoutData.shipping);
  }, [checkoutData.shipping, reset]);

  // 4. Submission handler updates the Zustand store with valid data.
  const onSubmit = (data: ShippingFormValues) => {
    // Merge into existing shipping object (in case there are extra fields).
    const updatedShipping = {
      ...checkoutData.shipping,
      ...data,
    };
    setShipping(updatedShipping);

    // If the "billing same as shipping" checkbox is checked, update billing as well.
    if (billingSameAsShipping) {
      setBilling(updatedShipping);
    }
    // After saving, switch to display mode.
    setIsEditing(false);
    // Set block editing status for payment to show up
    setIsAnyBlockEditing(false);
  };

  // 5. Handle changes to the "Billing same as shipping" checkbox.
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setBillingSameAsShipping(newVal);
    if (newVal) {
      // Immediately copy the current shipping data into billing.
      setBilling(checkoutData.shipping);
    }
  };

  // Dynamically import StateSelector, disabling SSR.
  const StateSelector = dynamic(() => import("../left-pane/StateSelector"), {
    ssr: false,
  });

  // 6. Render the form.
  return (
    <div className="mt-4">
      {/* Display Country/Region: USA on top (not part of the form) */}
      <div className="mb-4 flex">
        <label className="block text-sm font-medium text-gray-700">
          Country/Region
        </label>
        <p className="text-base text-gray-900 ml-5">USA</p>
      </div>

      {/* Billing Address same as shipping */}
      <div className="mb-6 flex items-center space-x-2">
        <input
          id="billing-same-checkbox"
          type="checkbox"
          checked={billingSameAsShipping}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
          htmlFor="billing-same-checkbox"
          className="block text-sm font-medium text-gray-700"
        >
          Billing address is same as Shipping
        </label>
      </div>

      {/* The existing shipping form */}
      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"
        >
          {/* First Name */}
          <div>
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-gray-700"
            >
              {/* First name */}
            </label>
            <input
              {...register("first_name")}
              placeholder="First Name"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm">
                {errors.first_name.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-gray-700"
            >
              {/* Last name */}
            </label>
            <input
              {...register("last_name")}
              placeholder="Last Name"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm">{errors.last_name.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 -m-3"
            >
              {/* Address */}
            </label>
            <input
              {...register("address_1")}
              placeholder="Address"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.address_1 && (
              <p className="text-red-500 text-sm">{errors.address_1.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 -m-3"
            >
              {/* City */}
            </label>
            <input
              {...register("city")}
              placeholder="City"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city.message}</p>
            )}
          </div>

          {/* State using react-country-state-city */}
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 -m-3"
            >
              {/* State */}
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <StateSelector
                    value={field.value}
                    onChange={(newState) => field.onChange(newState)}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="postcode"
              className="block text-sm font-medium text-gray-700 -m-3"
            >
              {/* Postal Code */}
            </label>
            <input
              {...register("postcode")}
              placeholder="Zip Code"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.postcode && (
              <p className="text-red-500 text-sm">{errors.postcode.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 -m-3"
            >
              {/* Phone Number */}
            </label>
            <input
              {...register("phone")}
              placeholder="Phone"
              className="block w-full rounded-none px-3 py-3 text-base outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="-mt-3 w-full bg-blue-600 text-white py-3 rounded-none hover:bg-blue-700"
            >
              Save &amp; Continue
            </button>
          </div>
        </form>
      ) : (
        // Display mode: show shipping info as text with an Edit button.
        <div className="border border-gray-300 p-4 rounded-md">
          {checkoutData.shipping.first_name ? (
            <>
              <p className="text-gray-700">
                <strong>
                  {checkoutData.shipping.first_name}{" "}
                  {checkoutData.shipping.last_name}
                </strong>
              </p>
              <p className="text-gray-700">{checkoutData.shipping.address_1}</p>
              <p className="text-gray-700">
                {checkoutData.shipping.city}, {checkoutData.shipping.state}{" "}
                {checkoutData.shipping.postcode}
              </p>
              <p className="text-gray-700">{checkoutData.shipping.phone}</p>
            </>
          ) : (
            <p className="text-gray-700">No shipping info provided.</p>
          )}
          <button
            onClick={() => {
              setIsEditing(true);
              setIsAnyBlockEditing(true);
            }}
            className="mt-2 border border-black px-16 py-1 rounded-none hover:bg-blue-700 text-blue-500 hover:text-white"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
