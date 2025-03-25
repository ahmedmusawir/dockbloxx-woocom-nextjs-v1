"use client";

import { useCheckoutStore } from "@/store/useCheckoutStore";
import React, { useState } from "react";

const ContactEmail = () => {
  const {
    checkoutData,
    setBilling,
    setShipping,
    setEmailSaved,
    setIsAnyBlockEditing,
    enableRegistration,
    setEnableRegistration,
  } = useCheckoutStore();
  const email = checkoutData.billing.email || "";
  const [error, setError] = useState("");

  // Initially set isEditing to true if no email is present, otherwise false.
  const [isEditing, setIsEditing] = useState(!email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    // Update billing email
    setBilling({ ...checkoutData.billing, email: newEmail });
    // Also update shipping email so both remain in sync
    setShipping({ ...checkoutData.shipping, email: newEmail });
  };

  const handleSaveEmail = () => {
    if (
      !checkoutData.billing.email.trim() ||
      !checkoutData.billing.email.includes("@")
    ) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    // Close edit mode only when the user clicks "Continue"
    setIsEditing(false);
    // Mark email as saved in the store
    setEmailSaved(true);
    // Setting Any Block Editing status
    setIsAnyBlockEditing(false);
  };

  return (
    <div className="mt-4">
      <label
        htmlFor="email-address"
        className="block text-sm font-medium text-gray-700"
      >
        {/* Email address */}
      </label>

      {isEditing ? (
        <div className="mt-2">
          <input
            id="email-address"
            name="email-address"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={checkoutData.billing.email}
            onChange={handleEmailChange}
            className="block w-full rounded-none bg-white px-3 py-3 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            onClick={handleSaveEmail}
            className="mt-2 bg-blue-700 text-white uppercase  py-3 px-10 rounded-none"
          >
            Save & Continue
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-900">{checkoutData.billing.email}</p>
          <button
            onClick={() => {
              setIsEditing(true);
              setEmailSaved(false);
              setIsAnyBlockEditing(true);
            }}
            className="mt-2 border border-black px-16 py-1 rounded-none hover:bg-blue-700 text-blue-500 hover:text-white"
          >
            Edit
          </button>
        </div>
      )}

      {/* Enable Registration Checkbox */}
      <div className="mt-3 flex items-center">
        <input
          id="enable-registration"
          type="checkbox"
          checked={enableRegistration}
          onChange={() => setEnableRegistration(!enableRegistration)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label
          htmlFor="enable-registration"
          className="ml-2 text-sm text-gray-900"
        >
          Enable Registration
        </label>
      </div>
    </div>
  );
};

export default ContactEmail;
