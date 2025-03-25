"use client";

import { useEffect } from "react";
import ProductListItem from "@/components/shop/ProductListItem";
import { useNumberedPaginationStore } from "@/store/useNumberedPaginationStore";
import { Product } from "@/types/product";
import Spinner from "../common/Spinner";
import SpinnerLarge from "../common/SpinnerLarge";
import { useCartStore } from "@/store/useCartStore";

interface ProductListProps {
  initialProducts: Product[]; // Server-side rendered initial products
  totalProducts: number; // Total number of products (from SSR)
}

const ProductList = ({ initialProducts, totalProducts }: ProductListProps) => {
  const {
    currentPage,
    pageData,
    fetchPage,
    setPageData,
    setTotalProducts,
    loading,
  } = useNumberedPaginationStore();

  const { cartItems } = useCartStore();
  // console.log("Cart Items from Zustand [ProductList.tsx]", cartItems);

  // Hydrate Zustand store with initial SSR data for page 1
  useEffect(() => {
    if (!pageData[1]) {
      setPageData(1, initialProducts); // Cache Page 1 data
      setTotalProducts(totalProducts); // Set total products count
    }
  }, [initialProducts, totalProducts, setPageData, setTotalProducts, pageData]);

  // Fetch products for the current page (if not already cached)
  useEffect(() => {
    if (currentPage !== 1 && !pageData[currentPage]) {
      fetchPage(currentPage);
    }
  }, [currentPage, pageData, fetchPage]);

  const dataToDisplay = pageData[currentPage] || initialProducts;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
      {loading ? (
        <div className="col-span-full flex justify-center items-center h-[200px]">
          <SpinnerLarge />
        </div>
      ) : (
        dataToDisplay.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))
      )}
    </div>
  );
};

export default ProductList;
