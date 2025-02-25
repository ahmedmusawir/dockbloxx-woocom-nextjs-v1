import { CheckoutData } from "./checkout";

export interface OrderSummary {
  id: number;
  status: string;
  total: string;
  shippingCost?: string;
  discountTotal: string;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: string;
    image?: string;
  }>;
  coupon?: any;
}

export interface OrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: CheckoutData["billing"];
  shipping: CheckoutData["shipping"];
  line_items: Array<{
    product_id: number;
    variation_id?: number;
    quantity: number;
  }>;
  shipping_lines: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  coupon_lines?: Array<{
    code: string;
  }>;
}
