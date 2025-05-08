"use client";

import { Product } from "@/types/product";
import React, { useEffect } from "react";
import { useProductTracking } from "@/hooks/useProductTracking";

interface Props {
  product: Product;
}

const ProductDescription = ({ product }: Props) => {
  const { trackViewItem } = useProductTracking();

  useEffect(() => {
    if (product?.id) {
      trackViewItem(product);
    }
  }, [product]);

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
        className="prose prose-lg text-gray-700 mx-auto px-5 lg:px-6 max-w-prose"
      />
    </div>
  );
};

export default ProductDescription;
