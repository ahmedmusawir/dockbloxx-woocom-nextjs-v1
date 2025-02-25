import { CheckoutData } from "@/types/checkout";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET() {
  return NextResponse.json(
    { message: "POST method required" },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    const checkoutData: CheckoutData = await req.json();

    console.log(
      "DEBUG: Transformed Checkout cartItems [place-order/route.ts]",
      checkoutData.cartItems
    );

    // Transform order structure to match WooCommerce API
    // In your POST handler, update the orderData transformation:
    const orderData = {
      payment_method: checkoutData.paymentMethod,
      payment_method_title: "Online Payment",
      billing: checkoutData.billing,
      shipping: checkoutData.shipping,
      line_items: checkoutData.cartItems.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
        variation_id: item.variation_id || 0, // Use item.variation_id if available, otherwise 0
        meta_data: [
          {
            key: "variations",
            value: item.variations || [],
          },
          {
            key: "customFields",
            value: item.customFields || [],
          },
          {
            key: "metadata",
            value: item.metadata || {},
          },
        ],
      })),
      shipping_lines: [
        {
          method_id: checkoutData.shippingMethod,
          method_title:
            checkoutData.shippingMethod === "free_shipping"
              ? "Free Shipping"
              : "Flat Rate",
          total: checkoutData.shippingCost.toFixed(2),
        },
      ],
      coupon_lines: checkoutData.coupon
        ? [
            {
              code: checkoutData.coupon.code,
              used_by: checkoutData.billing.email, // Track who used it
            },
          ]
        : [],
    };

    console.log(
      "DEBUG: Transformed Order line_items [place-order/route.ts]",
      orderData
    );

    // Validate required fields
    if (
      !orderData.billing ||
      !orderData.shipping ||
      !orderData.line_items ||
      !orderData.payment_method
    ) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    // Construct WooCommerce Order API URL
    const url = `${BASE_URL}/orders?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    // Send order data to WooCommerce
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "WooCommerce Order Failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Order Submission Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
