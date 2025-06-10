"use client";

import { useEffect } from "react";
import ProductListItem from "@/components/shop/ProductListItem";
import { useNumberedPaginationStore } from "@/store/useNumberedPaginationStore";
import { Product } from "@/types/product";
import SpinnerLarge from "../common/SpinnerLarge";

interface ProductListProps {
  initialProducts: Product[]; // Server-side rendered initial products
  totalProducts: number; // Total number of products (from SSR)
  initialPage: number; // Page that was SSR‑rendered
  cacheKey: string; // Namespace for the cache (e.g. \"shop\", \"accessories\")
}

// const ProductList = ({ initialProducts, totalProducts }: ProductListProps) => {
const ProductList = ({
  initialProducts,
  totalProducts,
  initialPage,
  cacheKey,
}: ProductListProps) => {
  const {
    currentPage,
    pageData,
    fetchPage,
    setPageData,
    setTotalProducts,
    setCurrentPage,
    cacheKey: storeKey,
    setCacheKey,
    resetPagination,
    loading,
  } = useNumberedPaginationStore();

  // const { cartItems } = useCartStore();
  // console.log("Cart Items from Zustand [ProductList.tsx]", cartItems);

  // 1) If we’ve navigated to a different namespace, wipe & seed cache
  useEffect(() => {
    if (storeKey !== cacheKey) {
      resetPagination(initialProducts, totalProducts, cacheKey);
      // setCacheKey(cacheKey);
      return;
    }

    // 2) Normal hydration for this namespace
    if (!pageData[initialPage]) {
      setPageData(initialPage, initialProducts);
      setTotalProducts(totalProducts);
      setCurrentPage(initialPage);
    }
  }, [
    cacheKey,
    initialPage,
    initialProducts,
    totalProducts,
    setCurrentPage,
    setPageData,
    setTotalProducts,
    setCacheKey,
    storeKey,
    pageData,
  ]);

  // Fetch products for the current page (if not already cached)
  useEffect(() => {
    if (!pageData[currentPage]) {
      fetchPage(currentPage);
    }
  }, [currentPage, pageData, fetchPage]);

  const dataToDisplay = pageData[currentPage] || initialProducts;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-2 md:gap-y-0 lg:grid-cols-4 lg:gap-x-8">
      {/* <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8"> */}
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
