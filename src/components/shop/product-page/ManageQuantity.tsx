import React from "react";
import { HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";

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
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        -{/* <MinusIcon className="text-black" /> */}
      </button>

      {/* Quantity Display */}
      <span className="px-4 py-2 border rounded-md text-gray-900 bg-white">
        {quantity}
      </span>

      {/* Increment Button */}
      <button
        onClick={onIncrement}
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default ManageQuantity;
