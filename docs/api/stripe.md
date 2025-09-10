# Stripe Integration Documentation

## Overview

The Dockbloxx project integrates with Stripe for secure payment processing in the headless WooCommerce Next.js application. This documentation covers the complete Stripe integration including API configuration, checkout flow, custom endpoints, and data handling.

## Table of Contents

1. [Stripe API Keys and Configuration](#stripe-api-keys-and-configuration)
2. [Dependencies](#dependencies)
3. [Checkout Process Flow](#checkout-process-flow)
4. [Custom API Endpoints](#custom-api-endpoints)
5. [Data Structures](#data-structures)
6. [Frontend Components](#frontend-components)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [Security Considerations](#security-considerations)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

## Stripe API Keys and Configuration

### Environment Variables

Stripe integration requires two environment variables configured in `.env.local`:

```bash
# Stripe Publishable Key (exposed to client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Stripe Secret Key (server-side only)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
```

### Key Types and Usage

- **Publishable Key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)**: 
  - Exposed to the client-side
  - Used to initialize Stripe.js in the browser
  - Safe to include in frontend code
  - Prefixed with `NEXT_PUBLIC_` for Next.js client access

- **Secret Key (`STRIPE_SECRET_KEY`)**:
  - Server-side only
  - Used for creating PaymentIntents and server operations
  - Never exposed to the client
  - Stored securely in environment variables

### Stripe Initialization

**Client-side initialization** in `CheckoutPageContent.tsx`:

```typescript
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe using publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**Server-side initialization** in API routes:

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});
```

## Dependencies

Stripe integration uses the following npm packages:

```json
{
  "@stripe/react-stripe-js": "^3.1.1",
  "@stripe/stripe-js": "^5.6.0",
  "stripe": "^17.6.0"
}
```

### Package Purposes

- **`@stripe/stripe-js`**: Core Stripe.js library for client-side operations
- **`@stripe/react-stripe-js`**: React components and hooks for Stripe integration
- **`stripe`**: Server-side Stripe SDK for Node.js

## Checkout Process Flow

### High-Level Flow

1. **Initialization**: Load Stripe and create PaymentIntent
2. **Form Collection**: Collect customer and payment information
3. **Order Creation**: Create WooCommerce order
4. **Payment Processing**: Process payment with Stripe
5. **Order Update**: Update WooCommerce order status
6. **Confirmation**: Redirect to thank you page

### Detailed Step-by-Step Process

#### 1. Checkout Page Initialization

```typescript
// CheckoutPageContent.tsx
const CheckoutPageContent = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  
  useEffect(() => {
    const fetchClientSecret = async () => {
      // Check for existing PaymentIntent in store
      if (paymentIntentClientSecret) {
        setClientSecret(paymentIntentClientSecret);
        return;
      }
      
      // Create new PaymentIntent
      const response = await fetch(`${SITE_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 52, // Amount in cents
          currency: "usd",
        }),
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentClientSecret(data.clientSecret);
    };
    
    fetchClientSecret();
  }, []);
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {/* Checkout form components */}
    </Elements>
  );
};
```

#### 2. Payment Form Submission

```typescript
// StripePaymentForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!stripe || !elements) return;
  
  setIsProcessing(true);
  
  // 1. Validate form elements
  const submitResult = await elements.submit();
  if (submitResult.error) {
    setError(submitResult.error.message);
    return;
  }
  
  // 2. Create WooCommerce order
  const orderResponse = await createWoocomOrder(checkoutData);
  if (!orderResponse) {
    setError("Order submission failed");
    return;
  }
  
  // 3. Process payment
  const paymentSuccess = await processPayment(elements, orderResponse);
  if (!paymentSuccess) {
    return; // Error handling done in processPayment
  }
};
```

#### 3. Payment Processing

```typescript
const processPayment = async (
  elements: any,
  orderInfo: OrderSummary
): Promise<boolean> => {
  try {
    // 1. Create PaymentIntent with order details
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(checkoutData.total * 100),
        currency: "usd",
        orderId: orderInfo.id,
      }),
    });
    
    const { clientSecret } = await response.json();
    
    // 2. Confirm payment with Stripe
    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${SITE_URL}/thankyou`,
      },
      redirect: "if_required",
    });
    
    // 3. Handle payment result
    if (result.error) {
      setError(result.error.message);
      return false;
    } else if (result.paymentIntent?.status === "succeeded") {
      // 4. Update WooCommerce order status
      const updateResult = await updateWoocomOrder(orderInfo.id, "processing");
      if (updateResult) {
        router.push("/thankyou");
        return true;
      }
    }
  } catch (error) {
    console.error("Payment error:", error);
    return false;
  }
};
```

## Custom API Endpoints

### `/api/create-payment-intent`

**Purpose**: Creates a Stripe PaymentIntent for processing payments.

**Method**: `POST`

**Request Body**:
```typescript
{
  amount: number;     // Amount in cents (e.g., 5000 for $50.00)
  currency: string;   // Currency code (e.g., "usd")
  orderId?: number;   // Optional WooCommerce order ID
}
```

**Response**:
```typescript
// Success (200)
{
  clientSecret: string; // PaymentIntent client secret
  paymentIntentId: string; // PaymentIntent ID
}

// Error (400/500)
{
  error: string; // Error message
}
```

**Implementation**:
```typescript
// /api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, orderId } = await request.json();
    
    // Validate required fields
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required" },
        { status: 400 }
      );
    }
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: orderId ? { orderId: orderId.toString() } : {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json(
      { error: "Failed to create PaymentIntent" },
      { status: 500 }
    );
  }
}
```

**Usage Example**:
```typescript
const createPaymentIntent = async (orderTotal: number, orderId?: number) => {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(orderTotal * 100), // Convert to cents
        currency: "usd",
        orderId,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create PaymentIntent");
    }
    
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

**Security Considerations**:
- Uses server-side Stripe secret key
- Validates input parameters
- Includes order metadata for tracking
- Handles errors gracefully
- Never exposes sensitive data to client

**Environment Variables Required**:
- `STRIPE_SECRET_KEY`: Stripe secret key for server-side operations

## Data Structures

### PaymentIntent Object

Stripe PaymentIntent represents a single payment transaction:

```typescript
interface PaymentIntent {
  id: string;                    // Unique PaymentIntent ID
  client_secret: string;         // Client secret for frontend
  amount: number;                // Amount in cents
  currency: string;              // Currency code
  status: PaymentIntentStatus;   // Payment status
  metadata: Record<string, string>; // Custom metadata
  created: number;               // Unix timestamp
  payment_method?: string;       // Payment method ID
}

type PaymentIntentStatus = 
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded";
```

### Checkout Data Structure

Checkout data managed by Zustand store:

```typescript
interface CheckoutData {
  billing: BillingAddress;
  shipping: ShippingAddress;
  cartItems: CartItem[];
  paymentMethod: string;         // "stripe"
  shippingMethod: {
    id: string;
    title: string;
    cost: number;
  };
  coupon: Coupon | null;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}
```

### Order Summary Structure

Simplified order object after WooCommerce creation:

```typescript
interface OrderSummary {
  id: number;                    // WooCommerce order ID
  status: string;                // Order status
  total: string;                 // Total amount
  shippingCost?: string;         // Shipping cost
  discountTotal?: string;        // Discount amount
  billing: BillingAddress;       // Billing details
  shipping: ShippingAddress;     // Shipping details
  line_items: OrderLineItem[];   // Order items
  coupon?: CouponLine[];         // Applied coupons
}

interface OrderLineItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  image?: string;
}
```

## Frontend Components

### StripePaymentForm Component

**Location**: `src/components/checkout/payments/StripePaymentForm.tsx`

**Purpose**: Main payment form component handling Stripe payment processing.

**Key Features**:
- Payment form validation
- Order creation integration
- Payment processing with Stripe
- Error handling and user feedback
- Order status updates

**Props**: None (uses Zustand stores)

**Key Hooks Used**:
```typescript
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const StripePaymentForm = () => {
  const stripe = useStripe();     // Stripe instance
  const elements = useElements(); // Form elements
  
  // Component logic...
};
```

### Elements Provider Setup

**Location**: `src/app/(public)/checkout/CheckoutPageContent.tsx`

**Purpose**: Provides Stripe context to child components.

```typescript
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPageContent = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="checkout-content">
        <LeftPane />  {/* Contains StripePaymentForm */}
        <RightPane /> {/* Order summary */}
      </div>
    </Elements>
  );
};
```

### PaymentElement Configuration

The `PaymentElement` is Stripe's unified payment form:

```typescript
<PaymentElement
  options={{
    layout: "tabs",
    paymentMethodOrder: ["card", "apple_pay", "google_pay"],
  }}
/>
```

## State Management

### Checkout Store Integration

**PaymentIntent Management**:
```typescript
interface CheckoutStore {
  paymentIntentClientSecret: string;
  setPaymentIntentClientSecret: (clientSecret: string) => void;
  clearPaymentIntent: () => void;
}
```

**Usage in Components**:
```typescript
const {
  paymentIntentClientSecret,
  setPaymentIntentClientSecret,
  clearPaymentIntent
} = useCheckoutStore();

// Store PaymentIntent for reuse
setPaymentIntentClientSecret(data.clientSecret);

// Clear on checkout reset
clearPaymentIntent();
```

### Payment Method Storage

```typescript
const { checkoutData, setPaymentMethod } = useCheckoutStore();

// Set payment method to Stripe
setPaymentMethod("stripe");
```

### Order Validation State

```typescript
const { orderValidated, setOrderValidated } = useCheckoutStore();

// Mark order as validated before payment
setOrderValidated(true);
```

## Error Handling

### Client-Side Error Handling

**Form Validation Errors**:
```typescript
const submitResult = await elements.submit();
if (submitResult.error) {
  setError(submitResult.error.message ?? "Validation error");
  setIsProcessing(false);
  return;
}
```

**Payment Confirmation Errors**:
```typescript
const result = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: { return_url: `${SITE_URL}/thankyou` },
  redirect: "if_required",
});

if (result.error) {
  setError(result.error.message || "Payment Failed");
  setIsProcessing(false);
  return false;
}
```

**Network and API Errors**:
```typescript
try {
  const response = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.clientSecret;
} catch (error) {
  console.error("Error creating PaymentIntent:", error);
  setError("Failed to initialize payment. Please try again.");
  throw error;
}
```

### Server-Side Error Handling

**API Route Error Responses**:
```typescript
export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json();
    
    // Validation
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required" },
        { status: 400 }
      );
    }
    
    // Stripe API call
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe API error:", error);
    
    // Return generic error to client
    return NextResponse.json(
      { error: "Failed to create PaymentIntent" },
      { status: 500 }
    );
  }
}
```

### Error Types and Handling

**Common Error Scenarios**:
1. **Invalid API Keys**: Check environment variables
2. **Network Failures**: Retry mechanism or user notification
3. **Payment Declined**: Display card decline message
4. **Validation Errors**: Show field-specific errors
5. **Server Errors**: Generic error message with logging

**Error Display Component**:
```typescript
{error && (
  <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

## Security Considerations

### API Key Security

**✅ Best Practices**:
- Store secret keys in environment variables only
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly
- Use `.env.local` for local development

**❌ Security Risks to Avoid**:
- Hardcoding API keys in source code
- Exposing secret keys to client-side
- Using production keys in development
- Committing `.env` files to git

### Environment Variable Security

```bash
# ✅ Correct: Publishable key (safe for client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ✅ Correct: Secret key (server-side only)
STRIPE_SECRET_KEY=sk_test_...

# ❌ Wrong: Secret key exposed to client
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_...  # NEVER DO THIS
```

### Data Validation

**Server-Side Validation**:
```typescript
// Validate amount
if (!amount || amount < 50) { // Minimum 50 cents
  return NextResponse.json(
    { error: "Invalid amount" },
    { status: 400 }
  );
}

// Validate currency
const validCurrencies = ["usd", "eur", "gbp"];
if (!validCurrencies.includes(currency)) {
  return NextResponse.json(
    { error: "Invalid currency" },
    { status: 400 }
  );
}
```

**Client-Side Sanitization**:
```typescript
// Sanitize amount before sending
const sanitizedAmount = Math.round(Math.abs(amount * 100));
```

### HTTPS Requirements

- **Production**: Always use HTTPS for Stripe integration
- **Development**: HTTP is acceptable for localhost
- **Webhooks**: Must use HTTPS endpoints

### PCI Compliance

- Stripe handles PCI compliance when using Stripe Elements
- Never collect or store card data directly
- Use PaymentElement for secure card input
- Stripe tokenizes sensitive payment information

## Testing

### Test API Keys

Stripe provides test keys for development:

```bash
# Test keys (safe to use in development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

```javascript
// Successful payment
"4242424242424242" // Visa
"4000056655665556" // Visa (debit)
"5555555555554444" // Mastercard

// Declined payments
"4000000000000002" // Generic decline
"4000000000009995" // Insufficient funds
"4000000000009987" // Lost card
"4000000000009979" // Stolen card

// Authentication required
"4000002500003155" // 3D Secure authentication
```

### Testing Scenarios

**1. Successful Payment Flow**:
```typescript
// Test data
const testPayment = {
  amount: 5000, // $50.00
  currency: "usd",
  card: "4242424242424242",
  exp_month: 12,
  exp_year: 2025,
  cvc: "123"
};
```

**2. Payment Failure Scenarios**:
- Declined cards
- Insufficient funds
- Invalid card details
- Network timeouts

**3. Edge Cases**:
- Empty cart
- Invalid amounts
- Missing required fields
- Concurrent payment attempts

### Integration Testing

**Test Payment Flow**:
1. Create test order in WooCommerce
2. Initialize PaymentIntent
3. Submit payment form
4. Verify payment confirmation
5. Check order status update
6. Validate redirect to thank you page

## Troubleshooting

### Common Issues

**1. "Stripe is not loaded yet" Error**
```typescript
// Solution: Add loading check
if (!stripe) {
  return <div>Loading Payment...</div>;
}
```

**2. PaymentIntent Creation Fails**
```bash
# Check environment variables
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Verify API key format
# Secret keys start with: sk_test_ or sk_live_
# Publishable keys start with: pk_test_ or pk_live_
```

**3. Elements Not Mounting**
```typescript
// Ensure Elements provider wraps components
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <StripePaymentForm />
</Elements>
```

**4. Payment Confirmation Fails**
```typescript
// Check return_url configuration
const result = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/thankyou`,
  },
  redirect: "if_required",
});
```

### Debug Logging

**Client-Side Debugging**:
```typescript
console.log("Stripe loaded:", !!stripe);
console.log("Elements loaded:", !!elements);
console.log("Client secret:", clientSecret);
console.log("Payment result:", result);
```

**Server-Side Debugging**:
```typescript
console.log("Creating PaymentIntent:", { amount, currency });
console.log("PaymentIntent created:", paymentIntent.id);
console.log("Client secret generated:", !!paymentIntent.client_secret);
```

### Error Code Reference

**Common Stripe Error Codes**:
- `card_declined`: Payment method declined
- `expired_card`: Card has expired
- `incorrect_cvc`: Invalid CVC code
- `processing_error`: Error processing payment
- `rate_limit`: Too many requests

### Performance Optimization

**1. Lazy Load Stripe**:
```typescript
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**2. Reuse PaymentIntents**:
```typescript
// Store in checkout store for reuse
if (paymentIntentClientSecret) {
  setClientSecret(paymentIntentClientSecret);
  return;
}
```

**3. Minimize API Calls**:
- Create PaymentIntent once per checkout session
- Update existing PaymentIntent instead of creating new ones
- Use client-side validation before API calls

---

## Summary

The Stripe integration in Dockbloxx provides secure payment processing with:

- **Secure Configuration**: Environment-based API key management
- **Seamless Flow**: Integrated with WooCommerce order creation
- **Modern Components**: React Stripe.js components and hooks
- **Error Handling**: Comprehensive error management
- **State Management**: Zustand store integration
- **Security**: PCI-compliant payment processing
- **Testing**: Test keys and scenarios for development

The integration follows Stripe best practices and provides a smooth checkout experience while maintaining security and reliability.