import React from "react";
import Image from "next/image";
import { RelatedProduct } from "@/types/product";
import parse from "html-react-parser";
import Link from "next/link";

interface Props {
  relatedProducts: RelatedProduct[];
}
const RelatedProducts = ({ relatedProducts }: Props) => {
  return (
    <section
      aria-labelledby="related-heading"
      className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0"
    >
      <h2 id="related-heading" className="text-xl font-bold text-gray-900">
        Customers also bought
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {relatedProducts.map((product) => (
          <div key={product.id}>
            <Link href={`/shop/${product.slug}`}>
              <div className="relative">
                <div className="relative h-72 w-full overflow-hidden rounded-lg">
                  <Image
                    alt={product.name}
                    src={product.image || "/placeholder.png"} // Add fallback if sourceUrl is undefined
                    className="size-full object-cover"
                    width={280}
                    height={280}
                    quality={80} // Adjust the quality for optimization
                    priority={true} // Prioritize loading if this is above-the-fold
                  />
                </div>
                <div className="relative mt-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.name}
                  </h3>
                  {/* <p className="mt-1 text-sm text-gray-500">{product.id}</p> */}
                </div>
                <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                  />
                  <p className="relative text-lg font-semibold text-white">
                    {parse(product.price_html)}
                  </p>
                </div>
              </div>
            </Link>

            <div className="mt-6">
              <Link href={`/shop/${product.slug}`}>
                <button
                  type="button"
                  className="mt-8 rounded-none bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:mb-10 w-full"
                >
                  SELECT OPTIONS
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
