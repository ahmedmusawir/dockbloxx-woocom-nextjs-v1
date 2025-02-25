import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/cart";

// Type for the Zustand store
interface CartStore {
  cartItems: CartItem[]; // The list of items in the cart
  isCartOpen: boolean; // Whether the cart drawer is open
  isLoading: boolean; // To check the loading state
  setIsLoading: (loading: boolean) => void; // To Set loading state
  setIsCartOpen: (isOpen: boolean) => void; // Toggle the cart drawer
  setCartItems: (
    updater: CartItem[] | ((prevItems: CartItem[]) => CartItem[])
  ) => void; // Directly update cart items or use a callback
  addOrUpdateCartItem: (item: CartItem) => void; // Add or update a cart item
  removeCartItem: (itemId: number) => void; // Remove an item from the cart
  clearCart: () => void; // Clear the entire cart
  getCartDetails: () => CartItem[]; // Get detailed cart items
  increaseCartQuantity: (itemId: number) => void; // Add item to cart by ID
  decreaseCartQuantity: (itemId: number) => void; // Decrement the quantity of a specific item
  subtotal: () => number; // Calculate the subtotal of all items in the cart
  getItemQuantity: (itemId: number) => number; // Get the quantity of a specific item
}

// Define the Zustand store with persist middleware
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      setCartItems: (updater) =>
        set((state) => ({
          cartItems:
            typeof updater === "function" ? updater(state.cartItems) : updater,
        })),

      getItemQuantity: (itemId) =>
        get().cartItems.find((item) => item.id === itemId)?.quantity || 0,

      addOrUpdateCartItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingItemIndex !== -1) {
            // Update existing item
            const updatedCartItems = [...state.cartItems];
            updatedCartItems[existingItemIndex] = {
              ...updatedCartItems[existingItemIndex],
              quantity:
                updatedCartItems[existingItemIndex].quantity + newItem.quantity,
              variations:
                newItem.variations ||
                updatedCartItems[existingItemIndex].variations,
              customFields:
                newItem.customFields ||
                updatedCartItems[existingItemIndex].customFields,
            };

            return { cartItems: updatedCartItems };
          }

          // Add new item
          return { cartItems: [...state.cartItems, newItem] };
        });
      },

      removeCartItem: (itemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        })),

      clearCart: () => set({ cartItems: [] }),

      getCartDetails: () => get().cartItems,

      increaseCartQuantity: (itemId: number) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === itemId
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return state; // No changes if item doesn't exist
        });
      },

      decreaseCartQuantity: (itemId: number) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === itemId
          );
          if (existingItem?.quantity === 1) {
            return {
              cartItems: state.cartItems.filter((item) => item.id !== itemId),
            };
          } else if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          }
          return state; // No changes if item doesn't exist
        });
      },

      subtotal: () => {
        return parseFloat(
          get()
            .cartItems.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            )
            .toFixed(2)
        );
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
