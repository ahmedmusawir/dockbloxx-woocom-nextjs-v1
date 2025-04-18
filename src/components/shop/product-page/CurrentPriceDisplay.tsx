import React from "react";

interface Props {
  basePrice: number | null; // Base price of the product
  quantity: number; // Selected quantity
}

const CurrentPriceDisplay = ({ basePrice, quantity }: Props) => {
  // console.log("basePrice [CurrentPriceDisplay]: ", basePrice);

  const totalPrice = basePrice ? basePrice * quantity : 0;

  return (
    <div className="mt-10 p-6 bg-gray-100 rounded-none shadow-lg border-2">
      <h3 className="text-2xl font-bold text-gray-800">
        Current Price:{" "}
        {basePrice ? `$${totalPrice.toFixed(2)}` : "Select options"}
      </h3>
    </div>
  );
};

export default CurrentPriceDisplay;
