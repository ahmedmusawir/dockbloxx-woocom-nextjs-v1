import { Product } from "@/types/product";
import Link from "next/link";
import React from "react";

interface Props {
  featuredProducts: Product[];
}

const FeaturedProducts = ({ featuredProducts }: Props) => {
  return (
    <section aria-labelledby="related-heading" className="mt-5">
      <h2
        id="related-heading"
        className="text-2xl font-bold text-gray-900 pb-5"
      >
        Recommended For You&hellip;
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {featuredProducts.map((relatedProduct) => (
          <div key={relatedProduct.id} className="group relative">
            <img
              alt={relatedProduct.name}
              src={relatedProduct.images[1].src}
              className="aspect-square w-full rounded-md object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
            />
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <Link
                    href={`/shop/${relatedProduct.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    <span aria-hidden="true" className="absolute inset-0" />

                    <span className="text-lg font-bold text-black">
                      {relatedProduct.name}
                    </span>
                  </Link>
                </h3>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${relatedProduct.price}.00
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
