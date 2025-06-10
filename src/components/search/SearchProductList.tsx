"use client";

import React from "react";
import ProductListItem from "@/components/shop/ProductListItem"; // Assuming this path is correct
import { Product } from "@/types/product"; // Your main Product interface

interface SearchProductListProps {
  products: Product[]; // Directly receives the array of products to display
}

const SearchProductList = ({ products }: SearchProductListProps) => {
  if (!products || products.length === 0) {
    // This case should ideally be handled by the parent component (SearchPageContent)
    // by not rendering SearchProductList if there are no products,
    // but as a fallback, we can return null or a message.
    // For now, SearchPageContent will show "No products found...", so this component might not even be rendered.
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 lg:gap-x-8">
      {/*
        Tailwind classes for grid layout.
        Adjust md:grid-cols-2, lg:grid-cols-4, xl:grid-cols-4 as needed
        for desired number of items per row on different breakpoints.
        Your original ProductList had lg:grid-cols-4.
        The ShopPageContent screenshot (image_8f98c1.png) uses a more complex grid structure initially.
        This is a common responsive grid for product listings.
      */}
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
};

export default SearchProductList;
