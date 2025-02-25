import { Product } from "@/types/product";
import React from "react";

interface Props {
  product: Product;
}

const ProductDescription = ({ product }: Props) => {
  return (
    <div className="mt-6">
      <h3 className="sr-only">Description</h3>

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
