import React from "react";
import { ArrowLeftCircle } from "lucide-react";

interface BackButtonProps {
  text: string;
}

const BackButton = ({ text }: BackButtonProps) => {
  const handleBackClick = () => {
    window.history.back(); // This goes one step back in the browser history
  };

  return (
    <button
      onClick={handleBackClick}
      className="text-gray-500 hover:underline flex items-center gap-1 font-bold mb-5"
    >
      <ArrowLeftCircle size={18} /> {text}
    </button>
  );
};

export default BackButton;
