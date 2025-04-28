import { Product } from "@/types/product";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import parse from "html-react-parser";
import { divide } from "lodash";
import Image from "next/image";

interface Props {
  product: Product;
}

const AdditionalDetailsAccordion = ({ product }: Props) => {
  const includedParts = product.acf.what_is_included || [];

  const shippingReturnsWarranty = product.acf.shipping_returns_warranty || "";

  type AccordionItem =
    | {
        name: string;
        type: "included";
        items: { image: string; item_name: string }[];
      }
    | {
        name: string;
        type: "html";
        items: string;
      };

  const accordion: { details: AccordionItem[] } = {
    details: [
      {
        name: "What's included",
        type: "included",
        items: includedParts,
      },
      {
        name: "Shipping, Returns & Warranty",
        type: "html",
        items: shippingReturnsWarranty,
      },
    ],
  };

  return (
    <section aria-labelledby="details-heading" className="mt-12">
      <h2 id="details-heading" className="sr-only">
        Additional details
      </h2>

      <div className="divide-y-4 divide-gray-200 border-t-4">
        {accordion.details.map((detail) => (
          <Disclosure key={detail.type} as="div">
            <h3>
              <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                <span className="text-2xl font-extrabold text-gray-900 group-data-[open]:text-indigo-600">
                  {detail.name}
                </span>
                <span className="ml-6 flex items-center font-extrabold">
                  <PlusIcon
                    aria-hidden="true"
                    className="block size-12 font-extrabold text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                  />
                  <MinusIcon
                    aria-hidden="true"
                    className="hidden size-12 font-extrabold text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                  />
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pb-6">
              {detail.type === "included" && (
                <ul className="space-y-4">
                  {detail?.items?.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-4 bg-gray-0"
                    >
                      <Image
                        src={item?.image || "/placeholder.jpg"}
                        alt={item?.item_name || "Placeholder Image"}
                        width={128}
                        height={128}
                        className="object-cover rounded"
                      />

                      <p className="text-xl font-bold text-gray-800">
                        {item?.item_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {detail.type === "html" && (
                // <div className="text-sm text-gray-700 leading-6 space-y-2">
                //   {parse(detail.items)}
                // </div>
                <div className="prose">
                  <div className="[&a]:text-blue-600 [&a]:underline [&a:hover]:text-blue-800">
                    {/* parsed HTML or dangerouslySetInnerHTML */}
                    {parse(detail.items)}
                  </div>
                </div>
              )}
            </DisclosurePanel>
          </Disclosure>
        ))}
      </div>
    </section>
  );
};

export default AdditionalDetailsAccordion;
