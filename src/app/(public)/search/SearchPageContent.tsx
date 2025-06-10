"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Page from "@/components/common/Page";
import FeaturedProducts from "@/components/common/FeaturedProducts";
import SearchControls from "@/components/search/SearchControls";
import SpinnerLarge from "@/components/common/SpinnerLarge";
import Head from "next/head"; // Keep for now if you're still migrating metadata strategy
import { Product } from "@/types/product";
import { fetchProductsBySearch } from "@/services/searchServices";
import SearchProductList from "@/components/search/SearchProductList"; // Ensure this path is correct
import SearchPagination from "@/components/search/SearchPagination";
import { useSearchParams, useRouter } from "next/navigation";

// Define the expected structure of the successful API response from the service
interface SearchServiceResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

interface SearchPageContentProps {
  initialFeaturedProducts: Product[];
}

const SearchPageContent = ({
  initialFeaturedProducts,
}: SearchPageContentProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // NEW: State for pagination and result counts
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1); // Will be used by pagination
  const [currentQuery, setCurrentQuery] = useState<string>(""); // Store the active query

  const PRODUCTS_PER_PAGE = 8; // Or whatever you set in fetchProductsBySearch test (e.g., 8)

  const handleNewSearchSubmit = (submittedSearchTerm: string) => {
    console.log(
      "New search submitted from SearchControls:",
      submittedSearchTerm
    );
    const params = new URLSearchParams();
    params.set("q", submittedSearchTerm);
    params.set("page", "1"); // Always go to page 1 for a new search query
    router.push(`/search?${params.toString()}`);
  };

  const performSearch = useCallback(
    async (queryToSearch: string, pageToFetch: number) => {
      if (!queryToSearch) {
        setSearchPerformed(false);
        setSearchResults([]);
        setTotalProducts(0);
        setTotalPages(0);
        // currentQuery and currentPage will be updated by useEffect based on searchParams
        setIsLoading(false);
        return;
      }

      console.log(
        `[performSearch] Fetching data for query: "${queryToSearch}", page: ${pageToFetch}`
      );
      setIsLoading(true);
      setSearchPerformed(true); // A search is actively being performed or results are being displayed

      const results: SearchServiceResponse | null = await fetchProductsBySearch(
        queryToSearch,
        pageToFetch,
        PRODUCTS_PER_PAGE
      );

      if (results && results.products) {
        setSearchResults(results.products);
        setTotalProducts(results.totalProducts);
        setTotalPages(results.totalPages);
      } else {
        setSearchResults([]);
        setTotalProducts(0);
        setTotalPages(0);
      }
      setIsLoading(false);
    },
    [PRODUCTS_PER_PAGE]
  ); // Dependency: PRODUCTS_PER_PAGE (if it could change, though it's const here)

  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

    setCurrentQuery(queryFromUrl || ""); // Update state for SearchPagination currentQuery prop AND for "Search Results for X" text
    setCurrentPage(pageFromUrl); // Update state for SearchPagination currentPage prop

    if (queryFromUrl) {
      performSearch(queryFromUrl, pageFromUrl);
    } else {
      // No query in URL, reset to initial state if needed
      setSearchPerformed(false);
      setSearchResults([]);
      setTotalProducts(0);
      setTotalPages(0);
    }
  }, [searchParams, performSearch]);

  return (
    <>
      <Head>
        <title>Dockbloxx Product Search</title>
        <meta
          name="description"
          content="Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
        />
      </Head>
      {/* Hero Section with Background Image - This part is fine */}
      <div className="relative h-[200px] md:h-[300px] w-full">
        {" "}
        {/* Adjusted height slightly */}
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")} // Consider a search-specific banner
          alt="Product Search Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Product Search
          </h1>
        </div>
      </div>

      <Page className="" FULL={false}>
        <div className="bg-white">
          <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-2 md:max-w-7xl lg:max-w-7xl lg:px-1">
            {/* Section 1: Search Input Controls */}
            <div className="text-center mb-6">
              {" "}
              {/* <SearchControls
                onSearchSubmit={handleSearch}
                isLoading={isLoading}
              /> */}
              <SearchControls
                onSearchSubmit={handleNewSearchSubmit} // New function name
                isLoading={isLoading}
              />
            </div>

            {/* Section 2: Conditional Display - Spinner or Search Results */}
            {/* <div className="text-center min-h-[10px] my-6"> */}
            <div className="min-h-[10px] my-6">
              {" "}
              {/* Your original min-height */}{" "}
              {isLoading && (
                <div className="flex justify-center items-center py-10">
                  <SpinnerLarge />
                </div>
              )}
              {!isLoading && searchPerformed && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                    Search Results For "{currentQuery}"{" "}
                    {totalProducts > 0 ? `(${totalProducts})` : ""}{" "}
                    {/* Display total products count */}
                  </h2>
                  <hr className="mb-4" />
                  {searchResults.length > 0 ? (
                    // UPDATED: Use SearchProductList
                    <SearchProductList products={searchResults} />
                  ) : (
                    // Message when search is performed but no results
                    <p>No products found for "{currentQuery}".</p>
                  )}
                  {/* Pagination */}
                  {!isLoading && totalPages > 1 && (
                    <SearchPagination
                      currentPage={currentPage} // Uses the 'currentPage' state variable
                      totalPages={totalPages}
                      currentQuery={currentQuery} // Uses the 'currentQuery' state variable
                      // No onPageChange needed as SearchPagination now uses next/link
                    />
                  )}
                </div>
              )}
              {!isLoading &&
                !searchPerformed && ( // Initial state before any search
                  <div className="text-gray-500">
                    {" "}
                    {/* Your original class */}
                    <p className="text-center">
                      Enter a product name above to start your search.
                    </p>
                  </div>
                )}
            </div>

            {/* Section 3: Featured products - always visible below search/spinner */}
            {initialFeaturedProducts && initialFeaturedProducts.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                {" "}
                {/* Added pt-6 and mt-6 for more spacing */}{" "}
                <FeaturedProducts featuredProducts={initialFeaturedProducts} />
              </div>
            )}
          </div>
        </div>
      </Page>
    </>
  );
};

export default SearchPageContent;
