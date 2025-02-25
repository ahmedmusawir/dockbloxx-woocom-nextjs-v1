import { CartItem } from "./cart";

export interface CheckoutData {
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string; // <-- Added email field
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string; // <-- Added email field
    phone: string;
  };
  paymentMethod: string;
  shippingMethod: "flat_rate" | "free_shipping" | "local_pickup";
  shippingCost: number;
  cartItems: CartItem[];
  coupon?: {
    code: string;
    discount: number;
    free_shipping: boolean;
    description: string;
  } | null; // Allow null explicitly
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
}
