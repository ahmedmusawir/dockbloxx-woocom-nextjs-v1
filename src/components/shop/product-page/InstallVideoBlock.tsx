import React from "react";
import { Product, RelatedProduct } from "@/types/product";

interface Props {
  product: Product;
}
const InstallVideoBlock = ({ product }: Props) => {
  return (
    <section
      aria-labelledby="related-heading"
      className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0"
    >
      <h2
        id="related-heading"
        className="text-4xl font-extrabold text-gray-600 text-center"
      >
        How To Install
      </h2>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl aspect-video ">
          <iframe
            className="w-full h-[600px] rounded-none shadow-lg"
            src={`https://www.youtube.com/embed/${product.acf.youtube}`}
            title="DockBloxx Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default InstallVideoBlock;
