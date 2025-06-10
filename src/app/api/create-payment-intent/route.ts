import { NextResponse } from "next/server";
import Stripe from "stripe";

// --- GET Handler -------------------------------------------------------------
// Stripe Webhook verification pings and casual probes should receive
// a clear 405 so the route contract stays explicit.
export async function GET() {
  return NextResponse.json(
    { message: "POST method required" },
    { status: 405 }
  );
}

// --- Stripe Client -----------------------------------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // Keep current API version in sync
});

// --- POST Handler ------------------------------------------------------------
export async function POST(request: Request) {
  try {
    // Extract payload from the client
    const { amount, currency, orderId, email, name, phone, wooCustomerId } =
      await request.json();

    // 1️⃣ Find or create a Stripe Customer so the payment is not filed as “Guest”.
    let customerId: string | undefined;
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });

      if (existing.data.length) {
        // Re‑use existing customer to avoid dashboard clutter
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name,
          phone,
          metadata: wooCustomerId ? { wooCustomerId } : undefined,
        });
        customerId = customer.id;
      }
    }

    // 2️⃣ Create the PaymentIntent, attaching customer + email receipt.
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      ...(customerId && { customer: customerId }),
      ...(email && { receipt_email: email }),
      payment_method_types: ["card", "klarna"],
      metadata: { orderId: orderId || "N/A" },
    });

    // 3️⃣ Return the client secret (+ customerId for optional downstream use)
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
    });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
