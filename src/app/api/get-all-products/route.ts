import { NextResponse } from "next/server";

const WOOCOM_REST_API_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL; // WooCommerce REST API base URL
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY; // Consumer key
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET; // Consumer secret

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract and validate query parameters for pagination
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "12", 10);

  console.log("[API Route] WooCommerce REST URL:", WOOCOM_REST_API_URL);
  console.log("[API Route] Consumer Key:", WOOCOM_CONSUMER_KEY);
  console.log("[API Route] Consumer Secret:", WOOCOM_CONSUMER_SECRET);

  // Validate environment variables
  if (!WOOCOM_REST_API_URL || !WOOCOM_CONSUMER_KEY || !WOOCOM_CONSUMER_SECRET) {
    return NextResponse.json(
      {
        error:
          "Missing WooCommerce REST API credentials in environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    // Build the WooCommerce REST API URL
    const url = `${WOOCOM_REST_API_URL}/products?per_page=${perPage}&page=${page}&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}&orderby=date&order=asc&status=publish`;

    console.log("[API Route] Final WooCommerce API URL:", url);

    // Fetch data from WooCommerce REST API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache the response for 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API Route] WooCommerce API Error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to fetch products from WooCommerce.",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const totalProducts = parseInt(
      response.headers.get("X-WP-Total") || "0",
      10
    );

    console.log("[API Route] Total Products:", totalProducts);

    // Return the products and totalProducts
    return NextResponse.json(
      { products: data, totalProducts },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API Route] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
