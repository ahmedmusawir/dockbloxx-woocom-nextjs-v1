import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PaginationStore<T> {
  items: T[]; // Array to store paginated items
  endCursor: string | null; // Cursor for the next page
  hasNextPage: boolean; // Indicator if more pages are available
  isLoading: boolean; // Loading state for UI feedback
  hasHydrated: boolean; // Checks if the state has been hydrated or not
  fetchNextPage: (
    fetchFunction: (
      cursor: string | null
    ) => Promise<{ items: T[]; endCursor: string | null; hasNextPage: boolean }>
  ) => Promise<void>;
  updateData: (
    newItems: T[],
    newEndCursor: string | null,
    newHasNextPage: boolean
  ) => void; // Action to manually update the store
  resetPagination: () => void; // Action to reset pagination state
  setIsLoading: (loading: boolean) => void; // Action to set loading state
  markHydrated: () => void; // Updates the hasHydrated value
}

export const usePaginationStore = create<PaginationStore<any>>()(
  persist(
    (set) => ({
      items: [],
      endCursor: null,
      hasNextPage: true,
      isLoading: true, // Initially loading
      hasHydrated: false, // Track hydration status

      // Add a method to mark the store as hydrated
      markHydrated: () => set({ hasHydrated: true }),

      fetchNextPage: async (fetchFunction) => {
        set({ isLoading: true });

        try {
          const { items, endCursor, hasNextPage } = await fetchFunction(
            usePaginationStore.getState().endCursor
          );

          set((state) => ({
            items: [...state.items, ...items],
            endCursor,
            hasNextPage,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error fetching next page:", error);
          set({ isLoading: false });
        }
      },

      updateData: (newItems, newEndCursor, newHasNextPage) => {
        set((state) => ({
          items: [...state.items, ...newItems],
          endCursor: newEndCursor,
          hasNextPage: newHasNextPage,
        }));
      },

      resetPagination: () =>
        set({
          items: [],
          endCursor: null,
          hasNextPage: true,
          isLoading: false,
        }),

      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "pagination-store", // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          items: state.items,
          endCursor: state.endCursor,
          hasNextPage: state.hasNextPage,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false); // Hydration is complete
      },
    }
  )
);
