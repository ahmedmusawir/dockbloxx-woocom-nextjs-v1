// Used to update woocom order status by orderId to either 'cancel' or 'processing'

import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

// For testing, GET returns a message.
export async function GET() {
  return NextResponse.json(
    { message: "POST method required" },
    { status: 405 }
  );
}

// POST to update an order status (e.g., "processing" or "cancelled")
export async function POST(request: Request) {
  try {
    // Expecting orderId and newStatus in the request body
    const { orderId, newStatus } = await request.json();
    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: "Missing orderId or newStatus" },
        { status: 400 }
      );
    }

    // Construct WooCommerce Order Update API URL
    const url = `${BASE_URL}/orders/${orderId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    // Prepare the update payload (here, updating the status field)
    const updateData = { status: newStatus };

    const response = await fetch(url, {
      method: "PUT", // Using PUT to update the order.
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "WooCommerce Order Update Failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Order Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
