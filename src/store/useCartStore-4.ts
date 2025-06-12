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
  // removeCartItem: (itemId: number) => void; // Remove an item from the cart
  removeCartItem: (item: CartItem) => void;
  clearCart: () => void; // Clear the entire cart
  getCartDetails: () => CartItem[]; // Get detailed cart items
  increaseCartQuantity: (target: CartItem) => void; // Add item to cart by ID
  decreaseCartQuantity: (target: CartItem) => void; // Decrement the quantity of a specific item
  subtotal: () => number; // Calculate the subtotal of all items in the cart
  getItemQuantity: (itemId: number) => number; // Get the quantity of a specific item
  makeKey: (item: CartItem) => string;
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
          // Normalize payload so `price` is unit-price
          const unitPriceItem = {
            ...newItem,
            price:
              typeof newItem.basePrice === "number"
                ? newItem.basePrice
                : newItem.price / Math.max(newItem.quantity || 1, 1),
          };

          // Build a unique key comprising product ID + variations + customFields
          const makeKey = (item: CartItem) =>
            `${item.id}::${JSON.stringify(
              item.variations || {}
            )}::${JSON.stringify(item.customFields || {})}`;

          const newKey = makeKey(unitPriceItem);
          const existingIndex = state.cartItems.findIndex(
            (item) => makeKey(item) === newKey
          );

          if (existingIndex !== -1) {
            // Exact same variation combo → increment quantity
            const updated = [...state.cartItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity:
                updated[existingIndex].quantity + unitPriceItem.quantity,
            };
            return { cartItems: updated };
          }

          // Different combo → push as a new line item
          return { cartItems: [...state.cartItems, unitPriceItem] };
        });
      },

      removeCartItem: (targetItem) => {
        // Build the same composite key we use for add/update
        const makeKey = (ci: CartItem) =>
          `${ci.id}::${JSON.stringify(ci.variations || {})}}::${JSON.stringify(
            ci.customFields || {}
          )}`;

        const targetKey = makeKey(targetItem);
        set((state) => ({
          cartItems: state.cartItems.filter((ci) => makeKey(ci) !== targetKey),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      getCartDetails: () => get().cartItems,

      // Helper to generate a unique cart key
      makeKey: (item: CartItem) =>
        `${item.id}::${JSON.stringify(
          item.variations || {}
        )}}::${JSON.stringify(item.customFields || {})}`,

      increaseCartQuantity: (target: CartItem) => {
        const makeKey = get().makeKey;
        set((state) => {
          return {
            cartItems: state.cartItems.map((item) =>
              makeKey(item) === makeKey(target)
                ? { ...item, quantity: Math.max(1, item.quantity + 1) }
                : item
            ),
          };
        });
      },

      decreaseCartQuantity: (target: CartItem) => {
        const makeKey = get().makeKey;
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => makeKey(item) === makeKey(target)
          );
          if (existingItem?.quantity === 1) {
            // Remove the item
            return {
              cartItems: state.cartItems.filter(
                (item) => makeKey(item) !== makeKey(target)
              ),
            };
          } else if (existingItem) {
            // Decrement
            return {
              cartItems: state.cartItems.map((item) =>
                makeKey(item) === makeKey(target)
                  ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                  : item
              ),
            };
          }
          return state;
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
