# WooCommerce API Documentation

## Overview

The Dockbloxx application integrates with a headless WooCommerce backend to manage products, orders, customers, and checkout processes. This document provides comprehensive information about how the application interacts with the WooCommerce REST API.

## API Configuration

### Environment Variables

The WooCommerce API configuration is managed through environment variables stored in `.env.local`:

```bash
# Base backend/proxy URL (all API paths are derived from this)
NEXT_PUBLIC_BACKEND_URL=https://YOUR-BACKEND-OR-PROXY-URL

# WooCommerce REST API credentials
WOOCOM_CONSUMER_KEY=ck_************************
WOOCOM_CONSUMER_SECRET=cs_************************
```

### Authentication

The application uses **Consumer Key** and **Consumer Secret** authentication method for WooCommerce REST API access. These credentials are appended as query parameters to all API requests.

### Configuration Files

- **Products API**: `/src/rest-api/products.ts`
- **Checkout API**: `/src/rest-api/checkout.ts`
- **Centralized endpoints (source of truth)**: `/src/constants/apiEndpoints.ts` using `getApiUrl()` derived from `NEXT_PUBLIC_BACKEND_URL`. Key constants include `WC_REST_URL`, `ACF_REST_OPTIONS`, `WP_REST_POSTS`, and `GRAPHQL_ENDPOINT`.

## Key API Endpoints Used

### Product Endpoints

| Endpoint                                   | Purpose                  | Implementation                    |
| ------------------------------------------ | ------------------------ | --------------------------------- |
| `/products`                                | Fetch paginated products | `WOOCOM_REST_GET_ALL_PRODUCTS`    |
| `/products/{id}`                           | Fetch product by ID      | `WOOCOM_REST_GET_PRODUCT_BY_ID`   |
| `/products?slug={slug}`                    | Fetch product by slug    | `WOOCOM_REST_GET_PRODUCT_BY_SLUG` |
| `/products/{id}/variations/{variation_id}` | Fetch product variations | `WOOCOM_REST_GET_VARIATION_BY_ID` |

### Order Endpoints

| Endpoint       | Purpose             | Implementation                               |
| -------------- | ------------------- | -------------------------------------------- |
| `/orders`      | Create new orders   | Via `/api/place-order` Next.js route         |
| `/orders/{id}` | Update order status | Via `/api/update-order-status` Next.js route |

### Checkout & Shipping Endpoints

| Endpoint                       | Purpose                | Implementation                             |
| ------------------------------ | ---------------------- | ------------------------------------------ |
| `/coupons`                     | Fetch all coupons      | `WOOCOM_REST_GET_ALL_COUPONS`              |
| `/coupons?code={code}`         | Fetch coupon by code   | `WOOCOM_REST_GET_COUPON_BY_CODE`           |
| `/shipping/zones`              | Fetch shipping zones   | `WOOCOM_REST_GET_SHIPPING_ZONES`           |
| `/shipping/zones/{id}/methods` | Fetch shipping methods | `WOOCOM_REST_GET_SHIPPING_METHODS_BY_ZONE` |

### Category Endpoints

| Endpoint               | Purpose                  | Implementation            |
| ---------------------- | ------------------------ | ------------------------- |
| `/products/categories` | Fetch product categories | Used in category services |

## Request/Response Examples

### 1. Fetch Products (Paginated)

**Request:**

```javascript
GET /wp-json/wc/v3/products?per_page=12&page=1&consumer_key={key}&consumer_secret={secret}&orderby=date&order=asc&status=publish
```

**Response:**

```json
[
  {
    "id": 123,
    "name": "Sample Product",
    "slug": "sample-product",
    "permalink": "https://example.com/product/sample-product/",
    "price": "29.99",
    "price_html": "<span class=\"price\">$29.99</span>",
    "regular_price": "29.99",
    "sale_price": "",
    "on_sale": false,
    "purchasable": true,
    "stock_status": "instock",
    "description": "Product description...",
    "short_description": "Short description...",
    "sku": "SAMPLE-001",
    "categories": [
      {
        "id": 15,
        "name": "Category Name",
        "slug": "category-name"
      }
    ],
    "images": [
      {
        "id": 456,
        "src": "https://example.com/image.jpg",
        "name": "Product Image",
        "alt": "Product Alt Text"
      }
    ],
    "attributes": [
      {
        "id": 1,
        "name": "Color",
        "options": ["Red", "Blue", "Green"]
      }
    ],
    "variations": [789, 790],
    "related_ids": [124, 125],
    "average_rating": "4.5",
    "rating_count": 10
  }
]
```

### 2. Create Order

**Request:**

```javascript
POST /wp-json/wc/v3/orders
Content-Type: application/json

{
  "payment_method": "stripe",
  "payment_method_title": "Online Payment",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postcode": "12345",
    "country": "US",
    "email": "john@example.com",
    "phone": "555-1234"
  },
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postcode": "12345",
    "country": "US"
  },
  "line_items": [
    {
      "product_id": 123,
      "quantity": 2,
      "variation_id": 789,
      "meta_data": [
        {
          "key": "variations",
          "value": [{"name": "Color", "value": "Red"}]
        }
      ]
    }
  ],
  "shipping_lines": [
    {
      "method_id": "flat_rate",
      "method_title": "Flat Rate",
      "total": "10.00"
    }
  ],
  "coupon_lines": [
    {
      "code": "SAVE10",
      "discount": "5.00"
    }
  ]
}
```

**Response:**

```json
{
  "id": 1001,
  "parent_id": 0,
  "status": "pending",
  "currency": "USD",
  "total": "64.99",
  "subtotal": "59.98",
  "total_tax": "0.00",
  "shipping_total": "10.00",
  "discount_total": "5.00",
  "date_created": "2024-01-15T10:30:00",
  "billing": {
    /* billing details */
  },
  "shipping": {
    /* shipping details */
  },
  "line_items": [
    /* line items */
  ]
}
```

### 3. Fetch Coupon by Code

**Request:**

```javascript
GET /wp-json/wc/v3/coupons?code=SAVE10&consumer_key={key}&consumer_secret={secret}
```

**Response:**

```json
[
  {
    "id": 201,
    "code": "SAVE10",
    "description": "Save $10 on your order",
    "discount_type": "fixed_cart",
    "amount": "10.00",
    "free_shipping": false,
    "minimum_amount": "50.00",
    "maximum_amount": "",
    "usage_limit": 100,
    "usage_limit_per_user": 1,
    "date_expires": "2024-12-31T23:59:59"
  }
]
```

## Data Handling

### Product Data Transformation

The application transforms WooCommerce product data through several service functions:

1. **fetchInitialProducts()**: Server-side product fetching for SSR/SSG
2. **fetchPaginatedProducts()**: Client-side paginated product fetching
3. **fetchProductBySlug()**: Single product retrieval
4. **fetchProductVariationsById()**: Product variation details

### Order Data Processing

Order data flows through these stages:

1. **Checkout Store**: Collects user input and cart items
2. **Order Transformation**: Converts checkout data to WooCommerce format
3. **API Submission**: Sends order via `/api/place-order` endpoint
4. **Status Updates**: Updates order status via `/api/update-order-status`

### Custom Fields Integration

The application integrates with Advanced Custom Fields (ACF) for:

- **Shipping Options**: Flat rate thresholds and local pickup zip codes
- **Pole Shape Styles**: Custom product attributes
- **Featured Products**: Product highlighting

## Error Handling

### API Error Responses

The application implements comprehensive error handling:

```javascript
// Example error handling in productServices.ts
try {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[fetchInitialProducts] WooCommerce API Error:", errorData);
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error("Error fetching products:", error);
  return { products: [], totalProducts: 0 };
}
```

### Common Error Scenarios

1. **Network Issues**: Connection timeouts, server unavailability
2. **Authentication Errors**: Invalid consumer key/secret
3. **Invalid Requests**: Malformed data, missing required fields
4. **Rate Limiting**: API request limits exceeded
5. **Product Not Found**: Invalid product IDs or slugs

### Error Recovery Strategies

- **Graceful Degradation**: Return empty arrays/objects on failure
- **Retry Logic**: Implemented for critical operations
- **User Feedback**: Error messages displayed to users
- **Logging**: Comprehensive error logging for debugging

## Security Considerations

1. **Credential Protection**: API keys stored in environment variables
2. **Server-Side Proxy**: Sensitive operations routed through Next.js API routes
3. **Input Validation**: User input sanitized before API calls
4. **HTTPS Only**: All API communications over secure connections

## Performance Optimizations

1. **Caching**: Response caching with `next: { revalidate: 300 }`
2. **Pagination**: Large datasets fetched in manageable chunks
3. **Selective Fields**: Only required fields fetched from API
4. **Batch Operations**: Multiple variations fetched in single requests

---

This documentation serves as the foundation for understanding WooCommerce API integration in the Dockbloxx application. For specific implementation details, refer to the service files in `/src/services/` and API routes in `/src/app/api/`.
