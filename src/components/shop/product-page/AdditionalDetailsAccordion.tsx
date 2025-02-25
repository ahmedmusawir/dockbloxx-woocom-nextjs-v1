import { Product } from "@/types/product";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Props {
  product: Product;
}

const AdditionalDetailsAccordion = ({ product }: Props) => {
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
  return (
    <section aria-labelledby="details-heading" className="mt-12">
      <h2 id="details-heading" className="sr-only">
        Additional details
      </h2>

      <div className="divide-y divide-gray-200 border-t">
        {demoProduct.details.map((detail) => (
          <Disclosure key={detail.name} as="div">
            <h3>
              <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                  {detail.name}
                </span>
                <span className="ml-6 flex items-center">
                  <PlusIcon
                    aria-hidden="true"
                    className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                  />
                  <MinusIcon
                    aria-hidden="true"
                    className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                  />
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pb-6">
              <ul
                role="list"
                className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
              >
                {detail.items.map((item) => (
                  <li key={item} className="pl-2">
                    {item}
                  </li>
                ))}
              </ul>
            </DisclosurePanel>
          </Disclosure>
        ))}
      </div>
    </section>
  );
};

export default AdditionalDetailsAccordion;
