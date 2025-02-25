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

        // NEW: Call utility function to update variation_id based on the defaults
        // updateCartItemWithVariationIds(
        //   defaultShape,
        //   defaultSize,
        //   defaultVersion,
        //   defaultStyle
        // );
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
    const matchedVariation = variations.find((variation) => {
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

    // Update cart item with the calculated price
    setCartItem((prev) => ({
      ...prev,
      basePrice: price || 0,
      price: (price || 0) * prev.quantity,
    }));
  };

  // Utility function to update the cart item with the correct variation ID
  // and update the variations array based on the current (or newly provided) selections.
  // const updateCartItemWithVariationIds = (
  //   selectedShapeParam?: string,
  //   selectedSizeParam?: string,
  //   selectedVersionParam?: string,
  //   selectedStyleParam?: string | null
  // ) => {
  //   const selectedShapeToUse = selectedShapeParam ?? selectedShape;
  //   const selectedSizeToUse = selectedSizeParam ?? selectedSize;
  //   const selectedVersionToUse = selectedVersionParam ?? selectedVersion;
  //   const selectedStyleToUse = selectedStyleParam ?? selectedPoleStyle;

  //   console.log("Shape:", selectedShapeToUse);
  //   console.log("Size:", selectedSizeToUse);
  //   console.log("Version:", selectedVersionToUse);
  //   console.log("Style:", selectedStyleToUse);
  //   console.log("Variations array:", variations);

  //   // Build required attributes (always include Pole Shape and Pole Size; include Version if available)
  //   const requiredAttributes: { name: string; value: string }[] = [
  //     { name: "Pole Shape", value: (selectedShapeToUse || "").trim() },
  //     { name: "Pole Size", value: (selectedSizeToUse || "").trim() },
  //   ];

  //   if (selectedVersionToUse) {
  //     requiredAttributes.push({ name: "Version", value: selectedVersionToUse });
  //   }

  //   // Find a variation that contains every required attribute (case-insensitive)
  //   const matchedVariation = variations.find((variation, i) => {
  //     console.log(`Variation #${i}:`, variation);
  //     // console.log(`Variation #${i}:`, variation.attributes);
  //     return requiredAttributes.every((req) =>
  //       variation.attributes.some((attr) => {
  //         const nameMatches =
  //           attr.name.toLowerCase() === req.name.toLowerCase();
  //         const optionMatches =
  //           attr.option.toLowerCase() === req.value.toLowerCase();
  //         if (nameMatches && optionMatches) {
  //           console.log("Matched attribute:", attr);
  //         }
  //         return nameMatches && optionMatches;
  //       })
  //     );
  //   });

  //   console.log("Matched Variation:[BloxxPricing]", matchedVariation);

  //   const variationId = matchedVariation ? matchedVariation.id : undefined;
  //   console.log("variationId [BloxxPricing]", variationId);

  //   setCartItem((prev) => ({
  //     ...prev,
  //     variation_id: variationId,
  //     variations: [
  //       { name: "Pole Shape", value: selectedShapeToUse || "Unknown" },
  //       { name: "Pole Style", value: selectedStyleToUse || "Unknown" },
  //       { name: "Pole Size", value: selectedSizeToUse || "Unknown" },
  //       { name: "Version", value: selectedVersionToUse || "Unknown" },
  //     ],
  //   }));

  //   calculatePrice(); // Recalculate price after updating cart item
  // };

  const updateCartItemWithVariationIds = (
    selectedShapeParam?: string,
    selectedSizeParam?: string,
    selectedVersionParam?: string,
    selectedStyleParam?: string | null
  ) => {
    const selectedShapeToUse = selectedShapeParam ?? selectedShape;
    const selectedSizeToUse = selectedSizeParam ?? selectedSize;
    const selectedVersionToUse = selectedVersionParam ?? selectedVersion;
    const selectedStyleToUse = selectedStyleParam ?? selectedPoleStyle;

    const selectedAttributes: any = [];

    if (selectedShapeToUse) {
      selectedAttributes.push({
        name: "Pole Shape",
        value: selectedShapeToUse.trim(),
      });
    }
    if (selectedSizeToUse) {
      selectedAttributes.push({
        name: "Pole Size",
        value: selectedSizeToUse.trim(),
      });
    }
    if (selectedVersionToUse) {
      selectedAttributes.push({
        name: "Version",
        value: selectedVersionToUse.trim(),
      });
    }

    console.log("Selected Attributes:", selectedAttributes);

    const matchedVariation = variations.find((variation) => {
      // Check if the variation *contains* ALL the *selected* attributes
      return selectedAttributes.every((selectedAttr: any) => {
        return variation.attributes.some((variationAttr) => {
          return (
            variationAttr.name.toLowerCase() ===
              selectedAttr.name.toLowerCase() &&
            variationAttr.option.toLowerCase() ===
              selectedAttr.value.toLowerCase()
          );
        });
      });
    });

    console.log("Matched Variation:[BloxxPricing]", matchedVariation);

    const variationId = matchedVariation ? matchedVariation.id : undefined;
    console.log("variationId [BloxxPricing]", variationId);

    setCartItem((prev) => ({
      ...prev,
      variation_id: variationId,
      variations: [
        { name: "Pole Shape", value: selectedShapeToUse || "Unknown" },
        { name: "Pole Style", value: selectedStyleToUse || "Unknown" },
        { name: "Pole Size", value: selectedSizeToUse || "Unknown" },
        { name: "Version", value: selectedVersionToUse || "Unknown" },
      ],
    }));

    calculatePrice();
  };

  // ---------- HANDLER FUNCTIONS -------------------------------------------

  // Handle shape selection
  const handleShapeSelection = (shape: string) => {
    setSelectedShape(shape);
    filterOptionsByShape(shape);
    updateCartItemWithVariationIds(shape);
  };

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
      setCustomSize(null);
      setError(null);
    }
    updateCartItemWithVariationIds(undefined, size);
  };

  const handleVersionSelection = (version: string) => {
    setSelectedVersion(version);
    updateCartItemWithVariationIds(undefined, undefined, version);
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
      <div className="mb-4">
        <h3 className="text-sm text-gray-600">Pole Size</h3>
        <div className="flex gap-3 mt-2">
          {filteredSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeSelection(size)}
              className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
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
