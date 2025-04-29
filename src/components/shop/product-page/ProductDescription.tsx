import { Product } from "@/types/product";
import React from "react";

interface Props {
  product: Product;
}

const ProductDescription = ({ product }: Props) => {
  return (
    <div className="mt-6">
      <h3 className="sr-only">Description</h3>

      <h2
        id="related-heading"
        className="text-4xl font-extrabold text-gray-600 text-center my-12"
      >
        Product Description
      </h2>

      <div
        dangerouslySetInnerHTML={{
          __html: product.description || "",
        }}
        className="space-y-6 text-base text-gray-700"
      />
    </div>
  );
};

export default ProductDescription;
