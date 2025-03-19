import { create } from "zustand";
import { CheckoutData } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import type { StateCreator } from "zustand";

import {
  applyCoupon,
  calculateCouponDiscount,
  validateCoupon,
} from "@/lib/couponUtils";
import { Coupon } from "@/types/coupon";

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
      },

      // Set Cart Items
      setCartItems: (items) =>
        set((state) => ({
          checkoutData: { ...state.checkoutData, cartItems: items },
        })),

      // Set Coupon Data
      setCoupon: (coupon) =>
        set((state) => ({
          checkoutData: {
            ...state.checkoutData,
            coupon,
            discountTotal: coupon ? coupon.discount : 0,
          },
        })),

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
      applyCoupon: (coupon) =>
        set((state) => {
          const { checkoutData } = state;

          if (!coupon || !validateCoupon(coupon, checkoutData)) {
            return {
              checkoutData: {
                ...checkoutData,
                coupon: null,
                discountTotal: 0,
              },
            };
          }

          // Apply the coupon and get updated checkout data
          const updatedCheckoutData = applyCoupon(coupon, checkoutData);

          // console.log(
          //   "applyCoupon fn [useCheckoutStore.ts]",
          //   updatedCheckoutData
          // );

          // Extract discount value
          const discountTotal = calculateCouponDiscount(
            coupon,
            checkoutData.cartItems,
            checkoutData.subtotal
          );

          // First, update Zustand state
          set((prevState) => {
            const newState = {
              checkoutData: {
                ...prevState.checkoutData,
                ...updatedCheckoutData,
                discountTotal,
              },
            };
            // console.log("Updated Zustand state with discount:", newState);
            return newState;
          });

          // Ensure total is recalculated after the state has updated
          setTimeout(() => {
            // console.log("Triggering calculateTotals...");
            get().calculateTotals();
          }, 50);

          return { checkoutData: { ...updatedCheckoutData, discountTotal } };
        }),

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
