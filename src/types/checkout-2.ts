import { CartItem } from "./cart";
import { Coupon } from "./coupon";

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
  coupon?: Coupon | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  // appliedAt: number | null;
}
