import { NextResponse } from "next/server";

const WOOCOM_REST_API_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET() {
  console.log("[API Route] Fetching Featured Products...");

  if (!WOOCOM_REST_API_URL || !WOOCOM_CONSUMER_KEY || !WOOCOM_CONSUMER_SECRET) {
    return NextResponse.json(
      { error: "Missing WooCommerce API credentials." },
      { status: 500 }
    );
  }

  try {
    const url = `${WOOCOM_REST_API_URL}/products?featured=true&per_page=4&consumer_key=${WOOCOM_CONSUMER_KEY}&consumer_secret=${WOOCOM_CONSUMER_SECRET}`;

    console.log("[API Route] WooCommerce API URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 }, // Cache the response for 5 minutes
    });

    if (!response.ok) {
      console.error(
        "[API Route] WooCommerce API Error:",
        await response.json()
      );
      return NextResponse.json(
        { error: "Failed to fetch featured products." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ products: data }, { status: 200 });
  } catch (error) {
    console.error("[API Route] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
