"use client";

import React, { useState, useEffect } from "react";
import { ProductVariation } from "@/types/product";
import { CartItem } from "@/types/cart";

interface SingleVariationPricingProps {
  onPriceChange: (price: number | null) => void;
  cartItem: CartItem; // To track the cart item data
  setCartItem: React.Dispatch<React.SetStateAction<CartItem>>; // To update the cart item state
}

const SingleVariationPricing = ({
  onPriceChange,
  setCartItem,
  cartItem,
}: SingleVariationPricingProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch and parse variations JSON on mount
  useEffect(() => {
    const variationsScript = document.getElementById("product-variations");
    if (variationsScript) {
      const data = JSON.parse(variationsScript.textContent || "[]");
      setVariations(data);

      // Set default selection
      if (data.length > 0) {
        const defaultVariation = data[0];
        const defaultOption = defaultVariation.attributes[0]?.option || null;
        setSelectedOption(defaultOption);

        // Set initial price and update cart item with variation id
        const defaultPrice = parseFloat(defaultVariation.price) || null;
        onPriceChange(defaultPrice);
        setCartItem((prev) => ({
          ...prev,
          variation_id: defaultVariation.id, // store the actual variation ID
          variations: [
            ...(prev.variations || []).filter(
              (variation) => variation.name !== "Option"
            ),
            { name: "Option", value: defaultOption },
          ],
        }));
      }
    }
  }, [onPriceChange]);

  // Fetch and parse variations JSON on mount
  useEffect(() => {
    const variationsScript = document.getElementById("product-variations");
    if (variationsScript) {
      const data = JSON.parse(variationsScript.textContent || "[]");
      setVariations(data);

      if (data.length > 0) {
        const defaultVariation = data[0]; // Grab the first/default variation clearly
        const defaultOption = defaultVariation.attributes[0]?.option || null;
        const defaultPrice = parseFloat(defaultVariation.price) || 0; // Ensure numeric default

        setSelectedOption(defaultOption); // set selected variation option
        onPriceChange(defaultPrice); // update parent basePrice clearly

        // Update cart item explicitly (IMPORTANT!)
        setCartItem((prev) => ({
          ...prev,
          variation_id: defaultVariation.id, // crucial to store variation ID
          price: defaultPrice, // explicitly set price for the cart
          basePrice: defaultPrice, // explicitly set basePrice as well
          variations: [
            ...(prev.variations || []).filter(
              (variation) => variation.name !== "Option"
            ),
            { name: "Option", value: defaultOption },
          ],
        }));
      }
    }
  }, [onPriceChange, setCartItem]);

  // Handle option selection
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);

    const matchedVariation = variations.find((variation) =>
      variation.attributes.some((attr) => attr.option === option)
    );
    const price = matchedVariation ? parseFloat(matchedVariation.price) : 0;
    onPriceChange(price); // explicitly set base price in parent

    setCartItem((prev) => ({
      ...prev,
      variation_id: matchedVariation ? matchedVariation.id : 0,
      price, // explicitly set price HERE
      basePrice: price, // explicitly set basePrice HERE
      variations: [
        ...(prev.variations || []).filter((v) => v.name !== "Option"),
        { name: "Option", value: option },
      ],
    }));
  };

  console.log("CartItem [SingleVariationPricing]", cartItem);

  return (
    <div className="mt-10">
      {/* Options */}
      <div className="mb-4">
        <h3 className="text-sm text-gray-600">Options</h3>
        <div className="flex flex-wrap gap-3 mt-2 justify-start">
          {variations.map((variation) => {
            const option = variation.attributes[0]?.option || "N/A";
            return (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`px-8 py-4 rounded-none text-sm font-medium shadow-sm ${
                  selectedOption === option
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SingleVariationPricing;
