import { create } from "zustand";
import { persist } from "zustand/middleware";
import localforage from "localforage";
import { Product } from "@/types/product";

// Define the state and actions for the store
interface ProductStore {
  products: Product[]; // Array to store the products
  isLoading: boolean; // Loading state for product hydration
  setIsLoading: (loading: boolean) => void; // Action to set loading state
  setProducts: (products: Product[]) => void; // Action to set the products
  addProducts: (products: Product[]) => void; // Action to append new products
  hasHydrated: boolean; // Track if the store has been hydrated
  setHasHydrated: (hydrated: boolean) => void; // Action to mark hydration complete
  clearProducts: () => void; // Action to clear the products
}

// Create a custom storage using localforage
const localForageStorage = {
  getItem: async (name: string) => {
    const value = await localforage.getItem(name);
    return value !== null ? JSON.parse(value as string) : null;
  },
  setItem: async (name: string, value: any) => {
    await localforage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await localforage.removeItem(name);
  },
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [], // Initialize with an empty array
      hasHydrated: false, // Track hydration status
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      isLoading: true, // Start with loading state as true
      setIsLoading: (loading) => set({ isLoading: loading }),
      setProducts: (products) => set({ products }), // Overwrite the current products
      addProducts: (products) =>
        set((state) => ({ products: [...state.products, ...products] })), // Append new products
      clearProducts: () => set({ products: [] }), // Clear products when needed
    }),
    {
      name: "product-storage", // Name for IndexDB storage
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false); // Set loading to false after hydration
      },
      storage: localForageStorage, // Use localForage as storage
    }
  )
);
