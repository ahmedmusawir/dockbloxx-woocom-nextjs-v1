// /services/searchServices.ts

import { Product } from "@/types/product"; // Assuming Product interface is here

// Define the expected structure of the successful API response from /api/search
interface SearchApiResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

// Define the structure for an error response from the API
interface ApiErrorResponse {
  error: string;
  // Potentially other fields like 'details' or 'code' if your API returns them
}

/**
 * Fetches search results from the internal Next.js API endpoint.
 * This endpoint, in turn, queries the WooCommerce API.
 *
 * @param query - The search term.
 * @param page - The page number for pagination.
 * @param perPage - The number of items per page.
 * @returns A promise that resolves to an object containing products, totalProducts, and totalPages, or null if an error occurs.
 */
export const fetchProductsBySearch = async (
  query: string,
  page: number,
  perPage: number
): Promise<SearchApiResponse | null> => {
  // Constructing the URL for the internal API search endpoint
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/search`);
  apiUrl.searchParams.append("q", query);
  apiUrl.searchParams.append("page", String(page));
  apiUrl.searchParams.append("per_page", String(perPage));

  console.log(
    `[Search Service] Fetching products for query: "${query}", page: ${page}, perPage: ${perPage}`
  );
  console.log(`[Search Service] Calling API: ${apiUrl.toString()}`);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET", // GET request as defined in the API route
      headers: {
        "Content-Type": "application/json",
      },
      // Consider caching strategy if needed, though API route handles its own.
      // For client-side fetches to API routes, Next.js fetch usually does smart caching.
      // cache: "no-store", // Uncomment if fresh data is always required and bypassing any client cache
    });

    // Attempting to parse the JSON response body
    const data: SearchApiResponse | ApiErrorResponse = await response.json();

    if (!response.ok) {
      // Log the error details from the API if available
      const errorMessage =
        (data as ApiErrorResponse).error ||
        `Failed to fetch search results. Status: ${response.status}`;
      console.error("[Search Service] API Error:", errorMessage, data);
      // Throwing an error to be caught by the catch block, consistent with the example provided
      throw new Error(errorMessage);
    }

    // Checking if the data is a successful response (has 'products' key)
    if ("products" in data) {
      console.log("[Search Service] Search successful:", data);
      return data as SearchApiResponse;
    } else {
      // This case should ideally be caught by !response.ok, but as a fallback:
      const errorMessage =
        (data as ApiErrorResponse).error ||
        "Received unexpected data structure from search API.";
      console.error("[Search Service] Unexpected API Response:", data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Logging the error, whether from network failure or thrown from response handling
    // The error object here could be an Error instance or might have a 'message' property
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Search Service] Fetch Error:", message);
    // Returning null as per the example's error handling pattern
    return null;
  }
};
