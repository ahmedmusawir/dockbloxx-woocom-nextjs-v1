// /app/api/search/route.ts

import { WC_REST_URL } from "@/constants/apiEndpoints";
import { type NextRequest, NextResponse } from "next/server";
import { Product } from "@/types/product"; // Assuming your Product interface is here

const WOOCOM_REST_API_URL = WC_REST_URL;
const WOOCOM_CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const WOOCOM_CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1"; // Default to page 1
  const perPage = searchParams.get("per_page") || "8"; // Default to 8 items per page

  if (!query) {
    return NextResponse.json(
      { error: "Search query (q) is required." },
      { status: 400 }
    );
  }

  if (!WOOCOM_REST_API_URL || !WOOCOM_CONSUMER_KEY || !WOOCOM_CONSUMER_SECRET) {
    console.error("[API Search Route] Missing WooCommerce API credentials.");
    return NextResponse.json(
      { error: "Server configuration error: Missing API credentials." },
      { status: 500 }
    );
  }

  try {
    // Constructing the WooCommerce API URL
    // Example from Postman: /products?search=bloxx&page=1&per_page=5
    // Added status=publish to ensure only published products are searched
    const wooUrl = new URL(`${WOOCOM_REST_API_URL}/products`);
    wooUrl.searchParams.append("search", query);
    wooUrl.searchParams.append("page", page);
    wooUrl.searchParams.append("per_page", perPage);
    wooUrl.searchParams.append("status", "publish"); // Good practice to search only published products
    wooUrl.searchParams.append("consumer_key", WOOCOM_CONSUMER_KEY);
    wooUrl.searchParams.append("consumer_secret", WOOCOM_CONSUMER_SECRET);

    console.log(`[API Search Route] Calling WooCommerce: ${wooUrl.toString()}`);

    const response = await fetch(wooUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },

      next: { revalidate: 30 },
      // cache: "no-store", // Or next: { revalidate: 10 } for short caching
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => response.text()); // Try to parse as JSON, fallback to text
      console.error(
        `[API Search Route] WooCommerce API Error (Status: ${response.status}):`,
        errorBody
      );
      return NextResponse.json(
        {
          error: `Failed to fetch search results from WooCommerce. Status: ${response.status}`,
        },
        { status: response.status }
      );
    }

    // Extracting data and pagination headers
    const products: Product[] = await response.json();
    const totalProducts = response.headers.get("x-wp-total");
    const totalPages = response.headers.get("x-wp-totalpages");

    console.log(
      `[API Search Route] Results - Products: ${products.length}, Total: ${totalProducts}, Pages: ${totalPages}`
    );

    return NextResponse.json(
      {
        products: products,
        totalProducts: totalProducts ? parseInt(totalProducts, 10) : 0,
        totalPages: totalPages ? parseInt(totalPages, 10) : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API Search Route] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error while searching products." },
      { status: 500 }
    );
  }
}
