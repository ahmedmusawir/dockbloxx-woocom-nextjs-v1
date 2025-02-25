import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOM_REST_API_URL;
const CONSUMER_KEY = process.env.WOOCOM_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOM_CONSUMER_SECRET;

export async function GET(req: Request) {
  try {
    // Get coupon code from the query params
    const { searchParams } = new URL(req.url);
    const couponCode = searchParams.get("code");

    if (!couponCode) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    console.log("BASE_URL [get-coupon-by-code]", BASE_URL);

    // Build API URL
    // const url = `${BASE_URL}/coupons?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    const url = `${BASE_URL}/coupons?code=${couponCode}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    console.log("URL [get-coupon-by-code]", url);

    // Fetch coupon data
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
