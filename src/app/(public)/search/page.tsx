import React from "react";
import SearchPageContent from "./SearchPageContent";
import { fetchFeaturedProducts } from "@/services/productServices";
import { Product } from "@/types/product";

export default async function SearchPage() {
  const initialFeaturedProducts: Product[] = await fetchFeaturedProducts();

  return (
    <SearchPageContent initialFeaturedProducts={initialFeaturedProducts} />
  );
}
