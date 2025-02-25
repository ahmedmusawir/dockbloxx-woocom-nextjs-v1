import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  return NextResponse.json(
    { message: "POST method required" },
    { status: 405 }
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // current API version
});

export async function POST(request: Request) {
  try {
    const { amount, currency, orderId } = await request.json();

    // Create a PaymentIntent with the given amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card", "klarna"],
      metadata: { orderId: orderId || "N/A" },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
