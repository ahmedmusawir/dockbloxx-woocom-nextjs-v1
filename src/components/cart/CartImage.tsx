import { useState } from "react";
import Image from "next/image";
import { CartItem } from "@/types/cart";
import Spinner from "../common/Spinner";

interface Props {
  cartItem: CartItem;
  imgHeight: number;
  imgWidth: number;
}

const CartImage = ({ cartItem, imgHeight, imgWidth }: Props) => {
  const [isImgLoading, setIsImgLoading] = useState(true);

  // console.log("img url [CartImage.tsx]", cartItem.image);

  return (
    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
      {isImgLoading && (
        <div className="flex justify-center items-center h-full w-full">
          <Spinner /> {/* Show spinner while the image loads */}
        </div>
      )}
      <Image
        src={cartItem.image || "/placeholder-image.jpg"} // Add a fallback placeholder if necessary
        alt={cartItem.name || "Product Image"}
        width={imgWidth}
        height={imgHeight}
        className={`h-full w-full object-cover object-center transition-opacity duration-500 ${
          isImgLoading ? "opacity-0" : "opacity-100"
        }`} // Hide image until loaded
        onLoadingComplete={() => setIsImgLoading(false)} // Hide spinner once loaded
      />
    </div>
  );
};

export default CartImage;
