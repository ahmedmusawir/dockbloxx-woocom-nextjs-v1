# Custom API Endpoints

This document provides comprehensive documentation for all custom Next.js API endpoints in the Dockbloxx application. These endpoints serve as middleware between the frontend and external services (WooCommerce, Stripe) to handle authentication, data transformation, and business logic.

## Overview

All custom endpoints are located in `/src/app/api/` and follow Next.js App Router conventions. They provide secure server-side operations while keeping sensitive credentials away from the client.

## Endpoint List

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/create-payment-intent` | POST | Create Stripe PaymentIntent; optionally reuses/creates Stripe Customer and returns `clientSecret` |
| `/api/featured-products` | GET | Fetch featured WooCommerce products (uses `featured=true`, cached 60s) |
| `/api/get-all-post-slugs` | GET | Return array of WordPress post slugs for SSG/static params |
| `/api/get-all-posts` | GET | Fetch paginated WordPress posts via GraphQL (`first`, `after`) |
| `/api/get-all-products` | GET | Fetch paginated Woo products (`page`, `perPage`); returns `products` and `totalProducts` |
| `/api/get-coupon-by-code` | GET | Fetch Woo coupon by `code` query param |
| `/api/get-post-by-slug` | GET | Fetch a single WordPress post by `slug` via GraphQL |
| `/api/get-product-by-slug` | GET | Fetch a single Woo product by `slug` via GraphQL |
| `/api/place-order` | POST | Create Woo order from checkout payload; maps line items, shipping, coupons |
| `/api/products-by-category` | GET | Fetch Woo products by category slug (`category`, `page`, `perPage`, `orderby`, `order`) |
| `/api/register-customer` | POST | Create WooCommerce customer (idempotent: returns existing if found by email) |
| `/api/search` | GET | Search Woo products by `q` with pagination (`page`, `per_page`); returns `products`, `totalProducts`, `totalPages` |
| `/api/update-order-status` | POST | Update Woo order status with `orderId` and `newStatus` |
| `/api/products-by-category` | GET | Fetch products by category slug with pagination |

---

## 1. Place Order

**Endpoint:** `POST /api/place-order`

**Purpose:** Handles the complete checkout process by transforming frontend checkout data into WooCommerce order format and submitting it to the WooCommerce REST API. This endpoint ensures secure order creation without exposing API credentials to the client.

### Request Body Schema

```typescript
interface CheckoutData {
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  shippingMethod: "flat_rate" | "free_shipping" | "local_pickup";
  shippingCost: number;
  cartItems: CartItem[];
  coupon?: Coupon | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
}
```

### Response Schema

**Success (201):**
```json
{
  "id": 1001,
  "status": "pending",
  "total": "125.50",
  "billing": { /* billing details */ },
  "shipping": { /* shipping details */ },
  "line_items": [ /* order items */ ]
}
```

**Error (400/500):**
```json
{
  "error": "Missing required order fields",
  "details": { /* WooCommerce error details */ }
}
```

### Usage Example

```javascript
const placeOrder = async (checkoutData) => {
  try {
    const response = await fetch('/api/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Order placement failed:', error);
    throw error;
  }
};
```

---

## 2. Update Order Status

**Endpoint:** `POST /api/update-order-status`

**Purpose:** Updates the status of an existing WooCommerce order (e.g., from "pending" to "processing" or "cancelled"). This is typically used after payment confirmation or order cancellation.

### Request Body Schema

```typescript
interface UpdateOrderRequest {
  orderId: number;
  newStatus: "processing" | "cancelled" | "completed" | "on-hold" | "refunded";
}
```

### Response Schema

**Success (200):**
```json
{
  "id": 1001,
  "status": "processing",
  "date_modified": "2024-01-15T10:30:00",
  "total": "125.50"
}
```

**Error (400/404/500):**
```json
{
  "error": "Missing orderId or newStatus",
  "details": { /* WooCommerce error details */ }
}
```

### Usage Example

```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch('/api/update-order-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, newStatus }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const updatedOrder = await response.json();
    return updatedOrder;
  } catch (error) {
    console.error('Order status update failed:', error);
    throw error;
  }
};
```

---

## 3. Create Payment Intent

**Endpoint:** `POST /api/create-payment-intent`

**Purpose:** Creates a Stripe PaymentIntent for secure payment processing. This endpoint handles the server-side Stripe integration and returns a client secret for frontend payment confirmation.

### Request Body Schema

```typescript
interface PaymentIntentRequest {
  amount: number; // Amount in cents (e.g., 12550 for $125.50)
  currency: string; // Currency code (e.g., "usd")
  orderId?: string; // Optional order ID for tracking
}
```

### Response Schema

**Success (200):**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefghijk"
}
```

**Error (500):**
```json
{
  "message": "Stripe error message"
}
```

### Usage Example

```javascript
const createPaymentIntent = async (amount, currency, orderId) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, orderId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    throw error;
  }
};
```

---

## 4. Register Customer

**Endpoint:** `POST /api/register-customer`

**Purpose:** Registers a new customer in WooCommerce with complete billing and shipping information. Checks for existing customers to prevent duplicates.

### Request Body Schema

```typescript
interface CustomerRegistration {
  email: string;
  first_name: string;
  last_name: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    state: string;
    phone: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    state: string;
    phone?: string;
  };
}
```

### Response Schema

**Success - New Customer (201):**
```json
{
  "message": "Customer registered successfully",
  "customer": {
    "id": 123,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "billing": { /* billing details */ },
    "shipping": { /* shipping details */ }
  }
}
```

**Success - Existing Customer (200):**
```json
{
  "message": "Customer already exists",
  "customer": { /* existing customer data */ }
}
```

**Error (400/500):**
```json
{
  "error": "Missing required fields"
}
```

### Usage Example

```javascript
const registerCustomer = async (customerData) => {
  try {
    const response = await fetch('/api/register-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Customer registration failed:', error);
    throw error;
  }
};
```

---

## 5. Get Coupon by Code

**Endpoint:** `GET /api/get-coupon-by-code?code={couponCode}`

**Purpose:** Fetches coupon details from WooCommerce by coupon code for validation and discount calculation during checkout.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | The coupon code to validate |

### Response Schema

**Success (200):**
```json
[
  {
    "id": 456,
    "code": "SAVE10",
    "amount": "10.00",
    "discount_type": "percent",
    "description": "10% off your order",
    "date_expires": "2024-12-31T23:59:59",
    "usage_limit": 100,
    "usage_count": 25,
    "minimum_amount": "50.00"
  }
]
```

**Error (400/404/500):**
```json
{
  "error": "Coupon code is required"
}
```

### Usage Example

```javascript
const getCouponByCode = async (couponCode) => {
  try {
    const response = await fetch(`/api/get-coupon-by-code?code=${encodeURIComponent(couponCode)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const coupons = await response.json();
    return coupons[0]; // Return first matching coupon
  } catch (error) {
    console.error('Coupon fetch failed:', error);
    throw error;
  }
};
```

---

## 6. Featured Products

**Endpoint:** `GET /api/featured-products`

**Purpose:** Fetches featured products from WooCommerce for display on the homepage or promotional sections. Limited to 4 products with caching for performance.

### Response Schema

**Success (200):**
```json
{
  "products": [
    {
      "id": 123,
      "name": "Premium Fishing Rod",
      "slug": "premium-fishing-rod",
      "price": "89.99",
      "regular_price": "99.99",
      "sale_price": "89.99",
      "featured": true,
      "images": [
        {
          "src": "https://example.com/image.jpg",
          "alt": "Premium Fishing Rod"
        }
      ],
      "categories": [ /* product categories */ ]
    }
  ]
}
```

**Error (500):**
```json
{
  "error": "Failed to fetch featured products."
}
```

### Usage Example

```javascript
const getFeaturedProducts = async () => {
  try {
    const response = await fetch('/api/featured-products');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const { products } = await response.json();
    return products;
  } catch (error) {
    console.error('Featured products fetch failed:', error);
    throw error;
  }
};
```

---

## 7. Products by Category

**Endpoint:** `GET /api/products-by-category`

**Purpose:** Fetches products from a specific WooCommerce category using category slug. Supports pagination, sorting, and is used for both homepage category sections and shop page filtering.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | Yes | - | WooCommerce category slug |
| `page` | number | No | 1 | Page number for pagination |
| `perPage` | number | No | 4 | Products per page |
| `orderby` | string | No | "date" | Sort field (date, price, title, popularity) |
| `order` | string | No | "desc" | Sort order (asc, desc) |

### Response Schema

**Success (200):**
```json
{
  "products": [
    {
      "id": 789,
      "name": "Water Sports Gear",
      "slug": "water-sports-gear",
      "price": "45.99",
      "images": [ /* product images */ ],
      "categories": [ /* product categories */ ]
    }
  ]
}
```

**Error (400/404/500):**
```json
{
  "error": "Category slug is required."
}
```

### Usage Examples

```javascript
// Homepage - Get 4 best-sellers
const getHomepageProducts = async () => {
  const response = await fetch('/api/products-by-category?category=best-sellers');
  const { products } = await response.json();
  return products;
};

// Shop page - Get paginated water sports products
const getShopProducts = async (page = 1) => {
  const response = await fetch(`/api/products-by-category?category=water-sports&page=${page}&perPage=12`);
  const { products } = await response.json();
  return products;
};

// Sorted products - Lowest to highest price
const getSortedProducts = async (category) => {
  const response = await fetch(`/api/products-by-category?category=${category}&orderby=price&order=asc`);
  const { products } = await response.json();
  return products;
};
```

---

## Security Considerations

1. **API Credentials**: All WooCommerce and Stripe credentials are stored as environment variables and never exposed to the client
2. **Authentication**: WooCommerce API authentication is handled server-side using consumer key/secret
3. **Input Validation**: All endpoints validate required fields and return appropriate error messages
4. **Error Handling**: Sensitive error details are logged server-side while returning generic error messages to clients

## Performance Optimizations

1. **Caching**: Featured products endpoint uses Next.js ISR with 5-minute revalidation
2. **Pagination**: Products by category supports pagination to limit data transfer
3. **Error Boundaries**: Proper error handling prevents application crashes

## Environment Variables Required

```bash
# WooCommerce API Configuration
NEXT_PUBLIC_WOOCOM_REST_API_URL=YOUR_WOOCOMMERCE_API_URL
WOOCOM_CONSUMER_KEY=YOUR_CONSUMER_KEY
WOOCOM_CONSUMER_SECRET=YOUR_CONSUMER_SECRET

# Stripe Configuration
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
```

---

This documentation covers all custom API endpoints in the Dockbloxx application. For implementation details, refer to the individual route files in `/src/app/api/`.