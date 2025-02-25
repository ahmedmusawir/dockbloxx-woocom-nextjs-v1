import React, { useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { Product } from "@/types/product";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  product: Product;
}

const ProductColorRadio = ({ product }: Props) => {
  const demoProduct = {
    name: "Zip Tote Basket",
    price: "$140",
    rating: 4,
    images: [
      {
        id: 1,
        name: "Angled view",
        src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-03-product-01.jpg",
        alt: "Angled front view with bag zipped and handles upright.",
      },
      {
        id: 2,
        name: "Angled view",
        src: "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699357042/qmjhal0k7ygtcfvgea8u.jpg",
        alt: "Angled front view with bag zipped and handles upright.",
      },
      {
        id: 3,
        name: "Angled view",
        src: "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699357113/kyuonuhab6uge4arosuo.jpg",
        alt: "Angled front view with bag zipped and handles upright.",
      },
      {
        id: 4,
        name: "Angled view",
        src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-03-product-01.jpg",
        alt: "Angled front view with bag zipped and handles upright.",
      },
      // More images...
    ],
    colors: [
      {
        name: "Washed Black",
        bgColor: "bg-gray-700",
        selectedColor: "ring-gray-700",
      },
      {
        name: "White",
        bgColor: "bg-white",
        selectedColor: "ring-gray-400",
      },
      {
        name: "Washed Gray",
        bgColor: "bg-gray-500",
        selectedColor: "ring-gray-500",
      },
    ],
    description: `
    <p>The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.</p>
  `,
    details: [
      {
        name: "Variations IDs",
        items: product.variations,
      },
      {
        name: "Related Product IDs",
        items: product.related_ids,
      },
      {
        name: "Upsell IDs",
        items: product.upsell_ids,
      },
      // More sections...
    ],
  };
  const [selectedColor, setSelectedColor] = useState(demoProduct.colors[0]);

  return (
    <div className="mt-10">
      <h3 className="text-sm text-gray-600">Color</h3>

      <fieldset aria-label="Choose a color" className="mt-2">
        <RadioGroup
          value={selectedColor}
          onChange={setSelectedColor}
          className="flex items-center gap-x-3"
        >
          {demoProduct.colors.map((color) => (
            <Radio
              key={color.name}
              value={color}
              aria-label={color.name}
              className={classNames(
                color.selectedColor,
                "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1"
              )}
            >
              <span
                aria-hidden="true"
                className={classNames(
                  color.bgColor,
                  "size-8 rounded-full border border-black/10"
                )}
              />
            </Radio>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
};

export default ProductColorRadio;
