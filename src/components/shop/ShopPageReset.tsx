"use client";

import { useNumberedPaginationStore } from "@/store/useNumberedPaginationStore";
import { Product } from "@/types/product";
import { useEffect } from "react";

interface ShopPageResetProps {
  initialProducts: Product[];
  totalProducts: number;
}

const ShopPageReset = ({
  initialProducts,
  totalProducts,
}: ShopPageResetProps) => {
  const { resetPagination } = useNumberedPaginationStore();

  // Reset pagination when the component mounts
  useEffect(() => {
    resetPagination(initialProducts, totalProducts);
  }, [resetPagination, initialProducts]);

  return null; // This component is invisible
};

export default ShopPageReset;
