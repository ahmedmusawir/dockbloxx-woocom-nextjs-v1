import React from "react";

interface ManageQuantityProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ManageQuantity = ({
  quantity,
  onIncrement,
  onDecrement,
}: ManageQuantityProps) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Decrement Button */}
      <button
        onClick={onDecrement}
        className="text-5xl flex h-16 w-16 items-center justify-center rounded-full border-2 border-lime-500 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-600"
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>

      {/* Quantity Display */}
      <span className="px-4 py-4 border-2 border-gray-200 rounded-none text-gray-900 bg-white text-2xl">
        {quantity}
      </span>

      {/* Increment Button */}
      <button
        onClick={onIncrement}
        className="text-4xl flex h-16 w-16 items-center justify-center rounded-full border-2 border-lime-500 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-600"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default ManageQuantity;
