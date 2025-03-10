"use client";

import { ProductVariation } from "@/types/product";
import React, { useState, useEffect } from "react";
import BloxxPricingPoleStyles from "./BloxxPricingPoleStyles";
import { CartItem } from "@/types/cart";

interface BloxxPricingProps {
  onPriceChange: (price: number | null) => void;
  setCartItem: React.Dispatch<React.SetStateAction<CartItem>>; // New prop
}

const BloxxPricing = ({ onPriceChange, setCartItem }: BloxxPricingProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string | null>(null);
  const [filteredVersions, setFilteredVersions] = useState<string[]>([]);
  const [filteredSizes, setFilteredSizes] = useState<string[]>([]);
  const [selectedPoleStyle, setSelectedPoleStyle] = useState<string | null>(
    null
  );
  const [customSize, setCustomSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // For validation feedback

  // Fetch and parse variations JSON on mount
  useEffect(() => {
    const variationsScript = document.getElementById("product-variations");
    if (variationsScript) {
      const data = JSON.parse(variationsScript.textContent || "[]");
      setVariations(data);
    }
  }, []);

  // Syncs up the Pole Size to CartItem when Pole Shape is changed
  useEffect(() => {
    if (!selectedShape) return;

    const defaultSize = filteredSizes[0] || "Unknown";

    // Synchronize default size and cart item
    setSelectedSize(defaultSize);
    setCartItem((prev) => ({
      ...prev,
      variations: prev.variations.map((variation) =>
        variation.name === "Pole Size"
          ? { ...variation, value: defaultSize }
          : variation
      ),
    }));
  }, [selectedShape, filteredSizes]);

  // Synchronize Pole Style when the shape changes
  useEffect(() => {
    if (!selectedShape) return;

    // Determine default style based on the selected shape
    let defaultStyle: string | null = null;
    switch (selectedShape.toLowerCase()) {
      case "square":
        defaultStyle = "square";
        break;
      case "round":
        defaultStyle = "round";
        break;
      case "octagon":
        defaultStyle = "round_octagon";
        break;
      default:
        defaultStyle = null;
    }

    // Synchronize default style and cart item
    setSelectedPoleStyle(defaultStyle);
    setCartItem((prev) => ({
      ...prev,
      variations: prev.variations.map((variation) =>
        variation.name === "Pole Style"
          ? { ...variation, value: defaultStyle || "Unknown" }
          : variation
      ),
    }));
  }, [selectedShape]);

  // Synchronize Pole Version when the shape changes or on mount
  useEffect(() => {
    if (!filteredVersions.length) return;

    const defaultVersion = filteredVersions[0] || "Unknown";

    // Synchronize default version and cart item
    setSelectedVersion(defaultVersion);
    setCartItem((prev) => ({
      ...prev,
      variations: prev.variations.map((variation) =>
        variation.name === "Version"
          ? { ...variation, value: defaultVersion }
          : variation
      ),
    }));
  }, [filteredVersions]);

  // Initialize default selections for pole shape, style, size, and update the cart item.
  useEffect(() => {
    if (variations.length > 0) {
      const validShapes = getValidShapes();

      if (validShapes.length > 0) {
        const defaultShape = validShapes[0];
        setSelectedShape(defaultShape);
        filterOptionsByShape(defaultShape);

        let defaultStyle: string | null = null;
        switch (defaultShape.toLowerCase()) {
          case "square":
            defaultStyle = "square";
            break;
          case "round":
            defaultStyle = "round";
            break;
          case "octagon":
            defaultStyle = "round_octagon";
            break;
          default:
            defaultStyle = null;
        }
        setSelectedPoleStyle(defaultStyle);

        const defaultSize = variations
          .find(
            (variation) =>
              variation.attributes.find(
                (attr) =>
                  attr.name === "Pole Shape" && attr.option === defaultShape
              ) !== undefined
          )
          ?.attributes.find((attr) => attr.name === "Pole Size")?.option;

        setSelectedSize(defaultSize || null);

        setCartItem((prev) => ({
          ...prev,
          variations: [
            { name: "Pole Shape", value: defaultShape },
            { name: "Pole Style", value: defaultStyle || "Unknown" },
            { name: "Pole Size", value: defaultSize || "Unknown" },
          ],
        }));
      }
    }
  }, [variations]);

  // Initialize default selections on mount
  useEffect(() => {
    if (variations.length > 0) {
      const validShapes = getValidShapes();
      if (validShapes.length > 0) {
        // Set default shape
        const defaultShape = validShapes[0];
        setSelectedShape(defaultShape);
        filterOptionsByShape(defaultShape); // Filter options for default shape

        // Determine default style based on shape
        let defaultStyle: string | null = null;
        switch (defaultShape.toLowerCase()) {
          case "square":
            defaultStyle = "square";
            break;
          case "round":
            defaultStyle = "round";
            break;
          case "octagon":
            defaultStyle = "round_octagon";
            break;
          default:
            defaultStyle = null;
        }
        setSelectedPoleStyle(defaultStyle);

        // Determine default size
        const defaultSize = variations
          .find(
            (variation) =>
              variation.attributes.find(
                (attr) =>
                  attr.name === "Pole Shape" && attr.option === defaultShape
              ) !== undefined
          )
          ?.attributes.find((attr) => attr.name === "Pole Size")?.option;
        setSelectedSize(defaultSize || null);

        // Determine default version
        const defaultVersion = filteredVersions[0] || "Unknown";
        setSelectedVersion(defaultVersion);

        // Update cart item with all defaults
        setCartItem((prev) => ({
          ...prev,
          variations: [
            { name: "Pole Shape", value: defaultShape },
            { name: "Pole Style", value: defaultStyle || "Unknown" },
            { name: "Pole Size", value: defaultSize || "Unknown" },
            { name: "Version", value: defaultVersion },
          ],
        }));
      }
    }
  }, [variations]);

  // Trigger price calculation when all selections are made
  useEffect(() => {
    if (selectedShape && selectedSize) {
      calculatePrice();
    }
  }, [selectedShape, selectedVersion, selectedSize]);

  // Triggers Default Pole Shape to Pole Styles (round, round_octagon etc.)
  useEffect(() => {
    if (!selectedShape) return;

    // Set default pole style based on default shape
    switch (selectedShape.toLowerCase()) {
      case "square":
        setSelectedPoleStyle("square");
        break;
      case "round":
        setSelectedPoleStyle("round");
        break;
      case "octagon":
        setSelectedPoleStyle("round_octagon");
        break;
      default:
        setSelectedPoleStyle(null); // Reset if no match
    }
  }, [selectedShape]);

  // ---------- UTILITY FUNCTIONS --------------------------------------------

  // Extract unique Pole Shapes
  const getValidShapes = (): string[] => {
    const shapes = new Set<string>();
    variations.forEach((variation) => {
      const shapeAttribute = variation.attributes.find(
        (attr) => attr.name === "Pole Shape"
      );
      if (shapeAttribute) shapes.add(shapeAttribute.option);
    });
    return Array.from(shapes);
  };

  // Filter versions and sizes based on the selected shape
  const filterOptionsByShape = (shape: string) => {
    const validVersions = new Set<string>();
    const validSizes = new Set<string>();

    variations.forEach((variation) => {
      const shapeAttribute = variation.attributes.find(
        (attr) => attr.name === "Pole Shape" && attr.option === shape
      );
      if (shapeAttribute) {
        // Collect valid versions
        const versionAttribute = variation.attributes.find(
          (attr) => attr.name === "Version"
        );
        if (versionAttribute) validVersions.add(versionAttribute.option);

        // Collect valid sizes
        const sizeAttribute = variation.attributes.find(
          (attr) => attr.name === "Pole Size"
        );
        if (sizeAttribute) validSizes.add(sizeAttribute.option);
      }
    });

    const versionsArray = Array.from(validVersions);
    const sizesArray = Array.from(validSizes);

    // Update filtered options
    setFilteredVersions(versionsArray);
    setFilteredSizes(sizesArray);

    // Automatically select defaults
    setSelectedVersion(versionsArray[0] || null); // Fallback to null if no versions
    setSelectedSize(sizesArray[0] || null); // Fallback to null if no sizes
  };

  // Calculate current price when all selections are made
  const calculatePrice = () => {
    let variationId = null;

    const matchedVariation = variations.find((variation) => {
      console.log(
        "Variation ID [BloxxPrice.tsx: calculatePrice]",
        variation.id
      );
      const shapeMatch = variation.attributes.find(
        (attr) => attr.name === "Pole Shape" && attr.option === selectedShape
      );
      const sizeMatch = variation.attributes.find(
        (attr) => attr.name === "Pole Size" && attr.option === selectedSize
      );
      const versionAttributeExists = variation.attributes.some(
        (attr) => attr.name === "Version"
      );
      const versionMatch = versionAttributeExists
        ? variation.attributes.find(
            (attr) => attr.name === "Version" && attr.option === selectedVersion
          )
        : true; // Skip if no "Version" exists for this variation

      return shapeMatch && sizeMatch && versionMatch;
    });

    const price = matchedVariation ? parseFloat(matchedVariation.price) : null;
    setCurrentPrice(price ? `$${price}` : "Select options");
    onPriceChange(price); // Pass the price to the parent component

    if (matchedVariation) {
      variationId = matchedVariation.id; // 2. Extract variation.id and store it
      console.log(
        "Extracted Variation ID [BloxxPrice.tsx: calculatePrice]:",
        variationId
      ); // Verification log
    }

    // Update cart item with the calculated price
    setCartItem((prev) => ({
      ...prev,
      variation_id: variationId || undefined,
      basePrice: price || 0,
      price: (price || 0) * prev.quantity,
    }));
  };

  // ---------- HANDLER FUNCTIONS -------------------------------------------

  // Handle shape selection
  const handleShapeSelection = (shape: string) => {
    setSelectedShape(shape); // Update the selected shape
    filterOptionsByShape(shape); // Reset versions and sizes for the new shape

    // Determine the default pole style based on the shape
    let defaultStyle: string | null = null;
    switch (shape.toLowerCase()) {
      case "square":
        defaultStyle = "square";
        break;
      case "round":
        defaultStyle = "round";
        break;
      case "octagon":
        defaultStyle = "round_octagon"; // Default for Octagon
        break;
      default:
        defaultStyle = null;
    }
    setSelectedPoleStyle(defaultStyle);

    // Ensure the first size option is selected as default
    const defaultSize = filteredSizes.length > 0 ? filteredSizes[0] : "Unknown";
    setSelectedSize(defaultSize);

    // Update the cart item to reflect the selected shape, style, and size
    setCartItem((prev) => {
      const updatedVariations = [
        ...(prev.variations || []).filter(
          (v) => v.name !== "Pole Shape" && v.name !== "Pole Size"
        ),
        { name: "Pole Shape", value: shape },
        { name: "Pole Size", value: defaultSize },
      ];

      return {
        ...prev,
        variations: updatedVariations,
      };
    });
  };

  // Handle Pole Style Change
  const handlePoleStyleChange = (selectedStyle: string) => {
    setSelectedPoleStyle(selectedStyle);

    // Update cart item
    setCartItem((prev) => {
      const updatedVariations = [
        ...(prev.variations || []).filter((v) => v.name !== "Pole Style"),
        { name: "Pole Style", value: selectedStyle },
      ];
      return { ...prev, variations: updatedVariations };
    });
  };

  // Handle Custom Size When the 'Other' Pole Size is Chosen (Mainly for Round and Octagon)
  const handleCustomSizeChange = (value: string) => {
    setCustomSize(value);

    if (value.trim()) {
      setError(null); // Clear the error if the input is valid
      setCartItem((prev) => {
        const updatedCustomFields = [
          ...(prev.customFields || []).filter((f) => f.name !== "Custom Size"),
          { name: "Custom Size", value: value },
        ];
        return { ...prev, customFields: updatedCustomFields };
      });
    } else {
      setError("Please enter a custom size.");
    }
  };

  // Handle Pole Size options
  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);

    if (size !== "Other") {
      setCustomSize(null); // Clear custom size if "Other" is not selected
      setError(null); // Clear any validation error
    }

    // Update cart item
    setCartItem((prev) => {
      const updatedVariations = [
        ...(prev.variations || []).filter((v) => v.name !== "Pole Size"),
        { name: "Pole Size", value: size },
      ];

      // If "Other" is selected, ensure customFields are reset
      const updatedCustomFields = size === "Other" ? [] : prev.customFields;

      return {
        ...prev,
        variations: updatedVariations,
        customFields: updatedCustomFields,
      };
    });
  };

  // Handle Version Selection
  const handleVersionSelection = (version: string) => {
    setSelectedVersion(version);

    // Update the cart item with the selected version
    setCartItem((prev) => {
      const updatedVariations = [
        ...(prev.variations || []).filter((v) => v.name !== "Version"),
        { name: "Version", value: version },
      ];
      return { ...prev, variations: updatedVariations };
    });
  };

  return (
    <div className="mt-10">
      {/* Pole Shape Options */}
      <div className="mb-4">
        <h3 className="text-sm text-gray-600">Pole Shape</h3>
        <div className="flex gap-3 mt-2">
          {getValidShapes().map((shape) => (
            <button
              key={shape}
              onClick={() => handleShapeSelection(shape)}
              className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
                selectedShape === shape
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Version Options */}
      {filteredVersions.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-sm text-gray-600">Version</h3>
          <div className="flex gap-3 mt-2">
            {filteredVersions.map((version) => (
              <button
                key={version}
                onClick={() => handleVersionSelection(version)}
                className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
                  selectedVersion === version
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {version}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          {/* <h3 className="text-sm text-gray-600">Version</h3> */}
          {/* <p className="text-gray-500">No Version Available</p> */}
        </div>
      )}

      {/* Pole Size Options */}
      {/* Pole Size Options */}
      <div className="mb-4">
        <h3 className="text-sm text-gray-600">Pole Size</h3>
        <div className="flex flex-wrap gap-3 mt-2 justify-start">
          {filteredSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeSelection(size)}
              className={`px-3 py-2 min-w-[50px] rounded-md text-sm font-medium shadow-sm ${
                selectedSize === size
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Render the custom size input if "Other" is selected */}
        {selectedSize === "Other" && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Enter custom size"
              value={customSize || ""}
              onChange={(e) => handleCustomSizeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        )}
      </div>

      {/* Pole Shape Styles */}
      <div>
        <BloxxPricingPoleStyles
          onSelectionChange={handlePoleStyleChange}
          setSelectedPoleStyle={setSelectedPoleStyle}
          selectedPoleStyle={selectedPoleStyle}
        />

        {/* Debugging or additional logic */}
        <p className="mt-5">Current Selected Pole Style: {selectedPoleStyle}</p>
      </div>
    </div>
  );
};

export default BloxxPricing;
