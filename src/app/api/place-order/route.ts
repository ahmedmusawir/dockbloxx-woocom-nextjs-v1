import { WC_REST_URL } from "@/constants/apiEndpoints";
import { CheckoutData } from "@/types/checkout";
import { NextResponse } from "next/server";
import { parseCouponMeta } from "@/lib/couponUtils";

const BASE_URL = WC_REST_URL;
const CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET() {
  return NextResponse.json(
    { message: "POST method required" },
    { status: 405 },
  );
}

export async function POST(req: Request) {
  try {
    const checkoutData: CheckoutData = await req.json();

    console.log(
      "🔍 [place-order] Received cartItems:",
      checkoutData.cartItems.map((item) => ({
        id: item.id,
        basePrice: item.basePrice,
        quantity: item.quantity,
        discountApplied: item.discountApplied,
        isFree: item.isFree,
      })),
    );

    // Check if coupon is a custom per-product percentage type
    // Custom coupons use fee_lines, native WooCommerce coupons use coupon_lines
    const isCustomPercentageCoupon = checkoutData.coupon
      ? parseCouponMeta(checkoutData.coupon).percentPerProduct !== undefined
      : false;

    // Native fixed_product discount uses coupon_lines (WooCommerce handles it)
    const isNativeFixedProductCoupon = checkoutData.coupon
      ? checkoutData.coupon.discount_type === "fixed_product" &&
        checkoutData.coupon.products_included.length > 0
      : false;

    console.log("🎫 [Coupon Type Check]:", {
      hasCoupon: !!checkoutData.coupon,
      couponCode: checkoutData.coupon?.code,
      isCustomPercentageCoupon,
      isNativeFixedProductCoupon,
      discountTotal: checkoutData.discountTotal,
    });

    // Transform order structure to match WooCommerce API
    // In your POST handler, update the orderData transformation:
    const orderData = {
      payment_method: checkoutData.paymentMethod,
      payment_method_title: "Online Payment",
      billing: checkoutData.billing,
      shipping: checkoutData.shipping,
      customer_note: checkoutData.customerNote,
      line_items: checkoutData.cartItems.map((item: any) => {
        // Flatten each custom field into its own meta entry
        const customMeta = (item.customFields || []).map(
          (f: { name: string; value: string }) => ({
            key: f.name,
            value: f.value,
          }),
        );

        // Calculate the price after discount (if any)
        const itemTotal = item.basePrice * item.quantity;
        const discountApplied = item.discountApplied || 0;
        const priceAfterDiscount =
          (itemTotal - discountApplied) / item.quantity;

        console.log(`💰 [Item ${item.id}] Calculation:`, {
          basePrice: item.basePrice,
          quantity: item.quantity,
          itemTotal,
          discountApplied,
          priceAfterDiscount,
          isCustomPercentageCoupon,
          isNativeFixedProductCoupon,
        });

        // For custom coupons, send full price and let fee_lines handle discount
        // For standard coupons, send full price and let WooCommerce handle discount
        return {
          product_id: item.id,
          quantity: item.quantity,
          variation_id: item.variation_id || 0,

          meta_data: [
            {
              key: "variations",
              value: item.variations || [],
            },
            {
              key: "metadata",
              value: item.metadata || {},
            },
            ...customMeta, // ← exploded fields now visible in Woo admin
          ],
        };
      }),

      shipping_lines: [
        {
          method_id: checkoutData.shippingMethod,
          method_title:
            checkoutData.shippingMethod === "free_shipping"
              ? "Free Shipping"
              : checkoutData.shippingMethod === "local_pickup"
                ? "Local Pickup"
                : "Flat Rate",
          total: checkoutData.shippingCost.toFixed(2),
        },
      ],
      // Coupon handling logic:
      // 1. Native WooCommerce coupons (fixed_cart, percent, fixed_product) → coupon_lines
      // 2. Custom percentage per product → fee_lines
      coupon_lines:
        checkoutData.coupon &&
        !isCustomPercentageCoupon &&
        (isNativeFixedProductCoupon ||
          checkoutData.coupon.discount_type === "fixed_cart" ||
          checkoutData.coupon.discount_type === "percent")
          ? [
              {
                code: checkoutData.coupon.code,
                used_by: checkoutData.billing.email,
              },
            ]
          : [],
      // For custom percentage coupons, add discount as a negative fee line
      fee_lines:
        checkoutData.coupon &&
        isCustomPercentageCoupon &&
        checkoutData.discountTotal > 0
          ? [
              {
                name: `Coupon: ${checkoutData.coupon.code}`,
                total: `-${checkoutData.discountTotal.toFixed(2)}`,
                tax_status: "none",
              },
            ]
          : [],

      // Attribution data for GHL integration (Coach's script)
      meta_data: checkoutData.attribution
        ? [
            // Coach/GHL attribution fields
            ...Object.entries(checkoutData.attribution).map(([key, value]) => ({
              key: `_coach_ghl_${key}`,
              value: value,
            })),
            // WooCommerce Order Attribution - Origin field
            {
              key: "_wc_order_attribution_source_type",
              value: checkoutData.attribution.utm_source || "direct",
            },
          ]
        : [],
    };

    console.log(
      "📊 [place-order] Attribution received:",
      checkoutData.attribution,
    );
    console.log("📊 [place-order] Attribution meta_data:", orderData.meta_data);

    console.log(
      "DEBUG: Transformed Order Data [place-order/route.ts]",
      JSON.stringify(orderData, null, 2),
    );

    console.log(
      "DEBUG: Line Items with Discounts:",
      orderData.line_items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        total: item.total,
        discount:
          (parseFloat(item.subtotal) - parseFloat(item.total)) * item.quantity,
      })),
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
        { status: 400 },
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
        { status: response.status },
      );
    }

    const data = await response.json();

    console.log("🎉 [WooCommerce Response] Order created:", {
      id: data.id,
      total: data.total,
      discount_total: data.discount_total,
      line_items: data.line_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        subtotal: item.subtotal,
        total: item.total,
      })),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Order Submission Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
