import { create } from "zustand";
import { CheckoutData } from "@/types/checkout";
import { Coupon } from "@/types/coupon";
import { CartItem } from "@/types/cart";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import type { StateCreator } from "zustand";
// Import our new utility
import { updateCheckoutTotals } from "@/lib/checkoutUtils";

import {
  applyCoupon,
  calculateCouponDiscount,
  validateCoupon,
} from "@/lib/couponUtils";

interface CheckoutStore {
  checkoutData: CheckoutData;
  setBilling: (billing: CheckoutData["billing"]) => void;
  setShipping: (shipping: CheckoutData["shipping"]) => void;
  setPaymentMethod: (method: string) => void;
  setShippingMethod: (
    method: "flat_rate" | "free_shipping" | "local_pickup",
    cost: number
  ) => void;
  setCartItems: (items: CartItem[]) => void;
  setCoupon: (coupon: CheckoutData["coupon"]) => void;
  calculateTotals: () => void;
  resetCheckout: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  billingSameAsShipping: boolean; // Default: billing is same as shipping
  setBillingSameAsShipping: (value: boolean) => void;
  orderValidated: boolean; // NEW: Tracks if order details are complete/validated
  setOrderValidated: (value: boolean) => void; // NEW: Function to update the orderValidated flag
  paymentIntentClientSecret: string; // NEW: Stores the PaymentIntent client secret
  setPaymentIntentClientSecret: (clientSecret: string) => void; // NEW: Setter function
  clearPaymentIntent: () => void; // NEW: Function to clear the PaymentIntent client secret
  orderId: number | null;
  setOrderId: (id: number) => void;
  emailSaved: boolean;
  setEmailSaved: (value: boolean) => void;
  isAnyBlockEditing: boolean;
  setIsAnyBlockEditing: (value: boolean) => void;
  enableRegistration: boolean; // NEW: Tracks if user wants to register an account
  setEnableRegistration: (value: boolean) => void; // NEW: Setter function for enableRegistration
  isHydrated: boolean;
  setIsHydrated: (value: boolean) => void;
}

type CheckoutPersist = (
  config: StateCreator<CheckoutStore>,
  options: PersistOptions<CheckoutStore>
) => StateCreator<CheckoutStore>;

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      setIsHydrated: (value: boolean) => set(() => ({ isHydrated: value })),
      enableRegistration: true, // Default: Registration is enabled
      setEnableRegistration: (value: boolean) =>
        set({ enableRegistration: value }),
      orderId: null,
      setOrderId: (id) => set({ orderId: id }),
      paymentIntentClientSecret: "", // Initially empty
      billingSameAsShipping: true, // Default: billing is same as shipping
      orderValidated: false, // NEW: Initially, order is not validated
      checkoutData: {
        billing: {
          first_name: "",
          last_name: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "USA",
          email: "",
          phone: "",
        },
        shipping: {
          first_name: "",
          last_name: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "USA",
          email: "",
          phone: "",
        },
        paymentMethod: "stripe",
        shippingMethod: "flat_rate",
        shippingCost: 0,
        cartItems: [],
        coupon: null,
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        total: 0,
      },

      // NEW: Setter for PaymentIntent client secret
      setPaymentIntentClientSecret: (clientSecret: string) =>
        set(() => ({ paymentIntentClientSecret: clientSecret })),

      // NEW: Function to clear the PaymentIntent client secret
      clearPaymentIntent: () => set(() => ({ paymentIntentClientSecret: "" })),

      setBillingSameAsShipping: (value: boolean) =>
        set(() => ({ billingSameAsShipping: value })),

      // Set Billing Address
      setBilling: (billing) =>
        set((state) => ({ checkoutData: { ...state.checkoutData, billing } })),

      // Set Shipping Address
      setShipping: (shipping) =>
        set((state) => ({ checkoutData: { ...state.checkoutData, shipping } })),

      // Set Payment Method
      setPaymentMethod: (method) =>
        set((state) => ({
          checkoutData: { ...state.checkoutData, paymentMethod: method },
        })),

      // Set Shipping Method & Cost
      setShippingMethod: (method, cost) => {
        // Don't override if there's a free shipping coupon
        const currentState = get();
        if (currentState.checkoutData.coupon?.free_shipping) {
          console.log(
            "Preventing shipping method change due to free shipping coupon"
          );
          return;
        }

        // 1) Update shipping cost in store
        set((state) => ({
          checkoutData: {
            ...state.checkoutData,
            shippingMethod: method,
            shippingCost: cost,
          },
        }));

        // 2) Immediately run calculateTotals
        get().calculateTotals();

        console.log("[setShippingMethod] => ", method, cost);
      },

      // setShippingMethod: (method, cost) => {
      //   // 1) Update shipping cost in store
      //   set((state) => ({
      //     checkoutData: {
      //       ...state.checkoutData,
      //       shippingMethod: method,
      //       shippingCost: cost,
      //     },
      //   }));

      //   // 2) Immediately run calculateTotals
      //   get().calculateTotals();

      //   console.log("[setShippingMethod] => ", method, cost);
      // },

      /**
       * 1) When we setCartItems, we just store them in state,
       *    then re-run updateCheckoutTotals immediately.
       */
      setCartItems: (items) => {
        set((state) => {
          const updatedCheckoutData = {
            ...state.checkoutData,
            cartItems: items,
          };
          // Now recalc everything
          const newTotals = updateCheckoutTotals(updatedCheckoutData);
          return { checkoutData: newTotals };
        });
      },

      // Set Coupon Data
      setCoupon: (coupon) =>
        set((state) => {
          // Simply store the coupon as-is, without overwriting discountTotal
          const updatedCheckoutData = {
            ...state.checkoutData,
            coupon,
          };
          // Recalculate totals based on the new coupon and current cart items
          const newTotals = updateCheckoutTotals(updatedCheckoutData);
          return { checkoutData: newTotals };
        }),

      // Calculate Totals
      calculateTotals: () =>
        set((state) => {
          const subtotal = state.checkoutData.cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity, // Fix: Multiply price by quantity
            0
          );

          const discount = state.checkoutData.discountTotal || 0;
          const shippingCost = state.checkoutData.shippingCost || 0;
          const taxTotal = 0; // Future implementation
          const total = subtotal + shippingCost - discount;

          console.log("calculateTotals: total [useCheckoutStore.ts]", total);

          return {
            checkoutData: { ...state.checkoutData, subtotal, taxTotal, total },
          };
        }),

      // Apply Coupon Zustand Function

      /**
       * 2) Apply a coupon:
       *    - Validate the coupon
       *    - If valid, store it in checkoutData.coupon (unchanged)
       *    - Then recalc totals using updateCheckoutTotals
       */
      applyCoupon: (coupon) => {
        const { checkoutData } = get();

        console.log("Before applying coupon:", get().checkoutData.coupon);

        const { isValid, message } = validateCoupon(coupon, checkoutData);
        if (!isValid) {
          console.warn("Invalid coupon:", message);
          // Optionally set some error state, or do nothing
          return;
        }

        // Store the coupon as-is, do NOT override coupon.discount_value
        const updatedCheckoutData = {
          ...checkoutData,
          coupon,
        };

        // Recalculate totals with the newly applied coupon
        const newTotals = updateCheckoutTotals(updatedCheckoutData);

        // Update Zustand store
        set({ checkoutData: newTotals });

        console.log("After applying coupon:", get().checkoutData.coupon);
      },

      removeCoupon: () =>
        set((state) => {
          const { checkoutData } = state;

          // Restore original shipping cost based on subtotal
          let restoredShippingCost = 0;

          if (checkoutData.subtotal < 100) {
            restoredShippingCost = 10; // Base flat rate for smaller orders
          } else if (checkoutData.subtotal < 250) {
            restoredShippingCost = 20; // Mid-tier rate
          } else {
            restoredShippingCost = 35; // Highest flat rate for large orders
          }

          return {
            checkoutData: {
              ...checkoutData,
              coupon: null, // Remove the applied coupon
              discountTotal: 0, // Reset discount
              shippingMethod: "flat_rate", // Force it back to Flat Rate
              shippingCost: restoredShippingCost, // Reset shipping based on subtotal
              total: checkoutData.subtotal + restoredShippingCost, // Ensure total recalculates properly
            },
          };
        }),

      // Reset Checkout (After Order is Placed)
      resetCheckout: () =>
        set({
          checkoutData: {
            billing: {
              first_name: "",
              last_name: "",
              address_1: "",
              address_2: "",
              city: "",
              state: "",
              postcode: "",
              country: "",
              email: "",
              phone: "",
            },
            shipping: {
              first_name: "",
              last_name: "",
              address_1: "",
              address_2: "",
              city: "",
              state: "",
              postcode: "",
              country: "",
              email: "",
              phone: "",
            },
            paymentMethod: "stripe",
            shippingMethod: "flat_rate",
            shippingCost: 0,
            cartItems: [],
            coupon: null,
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            total: 0,
          },
        }),
      // NEW: Setter for orderValidated
      setOrderValidated: (value: boolean) =>
        set(() => ({ orderValidated: value })),

      // NEW: emailSaved boolean
      emailSaved: false,

      // NEW: setter function
      setEmailSaved: (value: boolean) => set(() => ({ emailSaved: value })),

      // NEW: Initialize isAnyBlockEditing to false
      isAnyBlockEditing: false,
      setIsAnyBlockEditing: (value: boolean) =>
        set(() => ({ isAnyBlockEditing: value })),

      // ... END OF (set, get)
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        checkoutData: state.checkoutData,
        billingSameAsShipping: state.billingSameAsShipping,
        orderValidated: state.orderValidated,
        paymentIntentClientSecret: state.paymentIntentClientSecret, // Persist the PaymentIntent secret
        emailSaved: state.emailSaved, // Persist the emailSaved flag
      }),
      // 🔥 NEW: Fix shipping cost during rehydration
      onRehydrateStorage: () => (store, error) => {
        console.log("Rehydration callback fired");
        if (error) {
          console.error("Error:", error);
        }
        store?.setIsHydrated(true);
        console.log("store?.isHydrated after set?", store?.isHydrated);
      },
    }
  )
);

// Export the persist object for onFinishHydration usage
export const checkoutStorePersist: CheckoutPersist = (useCheckoutStore as any)
  .persist;
