"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import localforage from "localforage";
import { Product } from "@/types/product";
import { fetchPaginatedProducts } from "@/services/productServices";

// Define the state and actions for pagination
interface NumberedPaginationStore {
  currentPage: number; // Current active page
  totalProducts: number; // Total number of products
  productsPerPage: number; // Number of products displayed per page
  totalPages: number; // Total number of pages (calculated)
  pageData: Record<number, Product[]>; // Cache for products per page
  loading: boolean; // Track loading status
  setLoading: (loading: boolean) => void; // Action to toggle loading
  setTotalProducts: (count: number) => void; // Set total products
  fetchPage: (page: number) => Promise<void>; // Fetch products for a specific page
  setPageData: (page: number, products: Product[]) => void; // Cache a specific page
  resetPagination: (initialProducts: Product[], totalProducts: number) => void; // Reset pagination
}

export const useNumberedPaginationStore = create<NumberedPaginationStore>()(
  persist(
    (set, get) => ({
      currentPage: 1, // Default to first page
      totalProducts: 0, // Initialize with 0 products
      productsPerPage: 12, // Default per-page limit
      totalPages: 0, // Dynamically calculated
      pageData: {}, // Cached data for each page
      loading: false,

      setLoading: (loading) => set({ loading }),

      // Set total products and calculate total pages
      setTotalProducts: (count) =>
        set((state) => ({
          totalProducts: count,
          totalPages: Math.ceil(count / state.productsPerPage),
        })),

      // Fetch products for a specific page
      fetchPage: async (page: number) => {
        const { pageData, productsPerPage, setLoading } = get();

        // If data for the requested page is already cached, return it
        if (pageData[page]) {
          set({ currentPage: page });
          return;
        }

        // Otherwise, fetch data from the API
        setLoading(true);
        try {
          const { products, totalProducts } = await fetchPaginatedProducts(
            page,
            productsPerPage
          );

          console.log("PRODUCTS: [useNumberedPaginationStore]", products);

          set((state) => ({
            currentPage: page,
            pageData: { ...state.pageData, [page]: products }, // Cache the fetched page
          }));

          // Update total products on the first fetch
          if (totalProducts !== get().totalProducts) {
            get().setTotalProducts(totalProducts); // Use get() to access the latest state
          }
        } catch (error) {
          console.error(
            `[Zustand Pagination] Failed to fetch page ${page}:`,
            error
          );
        } finally {
          setLoading(false);
        }
      },

      setPageData: (page, products) =>
        set((state) => ({
          pageData: { ...state.pageData, [page]: products },
        })),

      // Reset pagination (for SSR data or initial state)
      resetPagination: (initialProducts, totalProducts) => {
        set({
          currentPage: 1,
          totalProducts,
          totalPages: Math.ceil(totalProducts / get().productsPerPage),
          pageData: { 1: initialProducts }, // Cache initial SSR data
        });
      },
    }),
    {
      name: "numbered-pagination-storage", // Key for persistence
      storage: createJSONStorage(() => localforage), // Use localforage for IndexedDB
      partialize: (state) => ({
        currentPage: state.currentPage,
        totalProducts: state.totalProducts,
        totalPages: state.totalPages,
        pageData: state.pageData, // Persist cached pages only
      }),
    }
  )
);
