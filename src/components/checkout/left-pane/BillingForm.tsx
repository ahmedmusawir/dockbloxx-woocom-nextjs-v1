"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useCheckoutStore } from "@/store/useCheckoutStore";

// Dynamically import our custom StateSelector (client-side only)
const StateSelector = dynamic(
  () => import("@/components/checkout/left-pane/StateSelector"),
  {
    ssr: false,
  }
);

// Define the Zod schema for billing fields. Notice we preprocess the state to convert null to an empty string.
const billingSchema = z.object({
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

// Infer the TypeScript type from the Zod schema.
type BillingFormValues = z.infer<typeof billingSchema>;

const BillingForm = () => {
  // Destructure the global store values, including our new flag.
  const {
    checkoutData,
    setBilling,
    billingSameAsShipping,
    setIsAnyBlockEditing,
  } = useCheckoutStore();

  // Local state to track if the billing form is in edit mode.
  // Default to false because when billingSameAsShipping is true we want a closed display.
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Optional: If billing is not the same as shipping and billing info is missing, open the form.
  useEffect(() => {
    if (!billingSameAsShipping && !checkoutData.billing.first_name) {
      setIsEditing(true);
    }
  }, [billingSameAsShipping, checkoutData.billing.first_name]);

  // Set up React Hook Form.
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: checkoutData.billing,
  });

  // When checkoutData.billing updates, reset the form with the latest values.
  useEffect(() => {
    reset(checkoutData.billing);
  }, [checkoutData.billing, reset]);

  // Submission handler to update the billing info.
  const onSubmit = (data: BillingFormValues) => {
    const updatedBilling = { ...checkoutData.billing, ...data };
    setBilling(updatedBilling);
    setIsEditing(false);
    setIsAnyBlockEditing(false);
  };

  // When billingSameAsShipping is true, we show a closed view with "Same as Shipping".
  if (billingSameAsShipping) {
    return (
      <div className="mt-">
        <h2 className="text-2xl font-bold text-gray-900">
          Billing Information
        </h2>
        <div className="mt-4 border p-4 rounded-md">
          <p className="text-gray-700">Same as Shipping</p>
        </div>
      </div>
    );
  }

  // Otherwise, show either the display view or the edit form.
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-gray-900">Billing Information</h2>

      {!isEditing ? (
        // Display mode: Show the billing info as text along with an Edit button.
        <div className="mt-4 border border-gray-300 p-4 rounded-md">
          {checkoutData.billing.first_name ? (
            <>
              <p className="text-gray-700">
                <strong>
                  {checkoutData.billing.first_name}{" "}
                  {checkoutData.billing.last_name}
                </strong>
              </p>
              <p className="text-gray-700">{checkoutData.billing.address_1}</p>
              <p className="text-gray-700">
                {checkoutData.billing.city}, {checkoutData.billing.state}{" "}
                {checkoutData.billing.postcode}
              </p>
              <p className="text-gray-700">{checkoutData.billing.phone}</p>
              {/* For clarity, you could conditionally show "Same as Shipping" only if appropriate.
                  Here, since billingSameAsShipping is false, we assume a different billing address. */}
            </>
          ) : (
            <p className="text-gray-700">No billing info provided.</p>
          )}
          <button
            onClick={() => {
              setIsEditing(true);
              setIsAnyBlockEditing(true);
            }}
            // className="mt-2 text-indigo-600 border border-black px-4 py-1 rounded-md"
            className="mt-2 border border-black px-16 py-1 rounded-none hover:bg-blue-700 text-blue-500 hover:text-white"
          >
            Edit
          </button>
        </div>
      ) : (
        // Edit mode: Show the billing form.
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city.message}</p>
            )}
          </div>

          {/* State using our new StateSelector */}
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
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
              className="block w-full rounded-none px-3 py-3 border border-gray-300 placeholder-gray-400 focus:outline-indigo-600"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="-mt-6 w-full bg-blue-600 text-white py-3 rounded-none hover:bg-blue-700"
            >
              Save &amp; Continue
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BillingForm;
