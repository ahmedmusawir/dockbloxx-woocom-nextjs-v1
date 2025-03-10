import React, { useState, useEffect } from "react";
import { ProductVariation } from "@/types/product";
import { CartItem } from "@/types/cart";

interface Props {
  onPriceChange: (price: number | null) => void; // Prop to communicate price changes
  cartItem: CartItem; // Current cart item
  setCartItem: React.Dispatch<React.SetStateAction<CartItem>>; // Function to update cart item
}

const ComplexVariationPricing = ({ onPriceChange, setCartItem }: Props) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Fetch and parse variations JSON on mount
  useEffect(() => {
    const variationsScript = document.getElementById("product-variations");
    if (variationsScript) {
      const data = JSON.parse(variationsScript.textContent || "[]");
      setVariations(data);

      // Initialize default selections
      const initialSelections: Record<string, string> = {};
      data[0]?.attributes.forEach((attr: { name: string; option: string }) => {
        initialSelections[attr.name] = attr.option;
      });
      setSelectedOptions(initialSelections);
    }
  }, []);

  // Calculate current price and notify parent
  useEffect(() => {
    const matchedVariation = variations.find((variation) =>
      variation.attributes.every(
        (attr) => selectedOptions[attr.name] === attr.option
      )
    );

    const price = matchedVariation ? parseFloat(matchedVariation.price) : null;
    onPriceChange(price); // Notify parent of price change
  }, [selectedOptions, variations, onPriceChange]);

  // Set default selections on mount
  useEffect(() => {
    if (variations.length > 0) {
      const initialSelections: Record<string, string> = {};
      const initialVariations: { name: string; value: string }[] = []; // Explicit type

      variations[0]?.attributes.forEach((attr) => {
        initialSelections[attr.name] = attr.option; // Set defaults
        initialVariations.push({ name: attr.name, value: attr.option }); // Add to variations
      });

      setSelectedOptions(initialSelections);

      // Update cart item with default variations
      setCartItem((prev) => ({
        ...prev,
        variations: initialVariations, // Correctly typed
      }));
    }
  }, [variations, setCartItem]);

  // ------------------ UTILITY FUNCTIONS ----------------------------------

  // Filter available options based on current selections
  const filterOptions = (attributeName: string): string[] => {
    const options = new Set<string>();
    variations.forEach((variation) => {
      const match = variation.attributes.every(
        (attr) =>
          attr.name === attributeName ||
          selectedOptions[attr.name] === attr.option
      );
      if (match) {
        const attr = variation.attributes.find(
          (attr) => attr.name === attributeName
        );
        if (attr) options.add(attr.option);
      }
    });
    return Array.from(options);
  };

  // ------------------ HANDLER FUNCTIONS ----------------------------------

  // Handle option selection
  const handleOptionClick = (attributeName: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: option,
    }));

    // Update cart item with selected variations
    setCartItem((prev) => {
      const updatedVariations = [
        ...(prev.variations || []).filter((v) => v.name !== attributeName),
        { name: attributeName, value: option },
      ];
      return { ...prev, variations: updatedVariations };
    });
  };

  // NEW: Update the cart item with the correct variation id
  useEffect(() => {
    const matchedVariation = variations.find((variation) =>
      variation.attributes.every(
        (attr) => selectedOptions[attr.name] === attr.option
      )
    );
    if (matchedVariation) {
      setCartItem((prev) => ({
        ...prev,
        variation_id: matchedVariation.id,
      }));
    }
  }, [selectedOptions, variations, setCartItem]);

  return (
    <div className="mt-10">
      <div className="space-y-6">
        {Object.keys(selectedOptions).map((attributeName) => (
          <div key={attributeName} className="mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              {attributeName}
            </h3>
            <div className="flex flex-wrap gap-3 mt-2 justify-start">
              {filterOptions(attributeName).map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(attributeName, option)}
                  className={`px-3 py-2 min-w-[50px] rounded-md text-sm font-medium shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-offset-1 ${
                    selectedOptions[attributeName] === option
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplexVariationPricing;
