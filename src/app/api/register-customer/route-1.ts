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
    const { email, first_name, last_name, billing, shipping } =
      await req.json();

    if (!email || !first_name || !last_name || !billing || !shipping) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const woocommerceApiUrl = `${BASE_URL}/customers`;

    const auth = {
      username: CONSUMER_KEY,
      password: CONSUMER_SECRET,
    };

    // Check if customer already exists
    const existingCustomerResponse = await fetch(
      `${woocommerceApiUrl}?email=${email}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${auth.username}:${auth.password}`).toString("base64"),
          "Content-Type": "application/json",
        },
      }
    );

    const existingCustomers = await existingCustomerResponse.json();
    if (existingCustomers.length > 0) {
      return NextResponse.json(
        { message: "Customer already exists" },
        { status: 200 }
      );
    }

    // Create new customer with full details
    const response = await fetch(woocommerceApiUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${auth.username}:${auth.password}`).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        role: "customer",
        billing: {
          first_name: billing.first_name,
          last_name: billing.last_name,
          company: billing.company,
          address_1: billing.address_1,
          address_2: billing.address_2,
          city: billing.city,
          postcode: billing.postcode,
          country: billing.country,
          state: billing.state,
          phone: billing.phone,
          email: billing.email,
        },
        shipping: {
          first_name: shipping.first_name,
          last_name: shipping.last_name,
          company: shipping.company,
          address_1: shipping.address_1,
          address_2: shipping.address_2,
          city: shipping.city,
          postcode: shipping.postcode,
          country: shipping.country,
          state: shipping.state,
          phone: shipping.phone,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create customer" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Customer registered successfully", customer: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
