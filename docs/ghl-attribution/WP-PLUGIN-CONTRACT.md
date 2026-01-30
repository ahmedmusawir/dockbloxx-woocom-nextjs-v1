# WP Plugin Contract — WordPress Plugin Specification

## Scope

This document defines the **WordPress plugin responsibilities** for the GHL Attribution Integration. The plugin must:

1. Accept attribution data from the order-creation endpoint
2. Store attribution as WooCommerce order meta
3. Fire a server-to-server webhook to GHL on order completion
4. Ensure idempotency (no duplicate webhooks)

---

## 1. Plugin Identity

| Property       | Value                                |
|----------------|--------------------------------------|
| Plugin Name    | DockBloxx GHL Attribution            |
| Slug           | `dockbloxx-ghl-attribution`          |
| Version        | 1.0.0                                |
| Purpose        | Single-purpose marketing integration |

### Why a Plugin?

- Checkout flow remains untouched
- Logic survives theme changes
- Precise timing (only after successful payment)
- Idempotency control (no duplicate Opportunities)
- Server-side reliability (no adblock/CORS issues)
- Clean separation: commerce logic ≠ marketing integration

---

## 2. Receiving Attribution from Frontend

### Endpoint Modification

The existing WooCommerce REST API order-creation endpoint (or custom endpoint) must accept an `attribution` object in the request body.

### Expected Payload Shape

```json
{
  "customer": { ... },
  "line_items": [ ... ],
  "shipping": { ... },
  "attribution": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer-sale",
    "utm_content": "banner-a",
    "utm_keyword": "dock blocks",
    "gclid": "abc123",
    "fbclid": null,
    "landing_page": "https://dockbloxx.com/products",
    "attribution_captured_at": "2024-01-15T10:30:00Z"
  }
}
```

### Handling

- Attribution field is **optional**
- If present, extract and store; if absent, skip gracefully
- Order creation must **never fail** due to attribution issues

---

## 3. Storing Attribution as Order Meta

### Meta Key Convention

All attribution meta uses the `_dbx_` prefix (underscore = hidden from default UI).

| Meta Key                       | Source Field               |
|--------------------------------|----------------------------|
| `_dbx_utm_source`              | `attribution.utm_source`   |
| `_dbx_utm_medium`              | `attribution.utm_medium`   |
| `_dbx_utm_campaign`            | `attribution.utm_campaign` |
| `_dbx_utm_content`             | `attribution.utm_content`  |
| `_dbx_utm_keyword`             | `attribution.utm_keyword`  |
| `_dbx_gclid`                   | `attribution.gclid`        |
| `_dbx_fbclid`                  | `attribution.fbclid`       |
| `_dbx_landing_page`            | `attribution.landing_page` |
| `_dbx_attribution_captured_at` | `attribution.attribution_captured_at` |

### GHL Tracking Meta

| Meta Key            | Purpose                              |
|---------------------|--------------------------------------|
| `_dbx_ghl_sent`     | `1` if webhook fired successfully    |
| `_dbx_ghl_sent_at`  | ISO timestamp of successful webhook  |
| `_dbx_ghl_response` | Optional: response body for debugging|

### Storage Timing

Store attribution meta **immediately when order is created** (before payment).

---

## 4. GHL Webhook Trigger

### Trigger Event

Hook into WooCommerce order status transition:

```php
add_action('woocommerce_order_status_processing', 'dbx_send_to_ghl', 10, 1);
```

**Why `processing`?**
- Indicates payment has been received
- Order is confirmed (not pending/failed)
- Fires after Stripe webhook confirms payment

### Alternative Triggers (if needed)

- `woocommerce_order_status_completed` — for stores that skip processing
- `woocommerce_payment_complete` — fires on payment confirmation

---

## 5. Webhook Payload to GHL

### Endpoint

GHL Inbound Workflow Webhook URL (stored in `wp-config.php` or options table):

```php
define('DBX_GHL_WEBHOOK_URL', 'https://services.leadconnectorhq.com/hooks/...');
```

### Payload Structure

```json
{
  "event": "order_completed",
  "order_id": 12345,
  "order_number": "DBX-12345",
  "order_total": "299.99",
  "currency": "USD",
  "order_date": "2024-01-15T10:35:00Z",
  
  "customer": {
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  },
  
  "attribution": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer-sale",
    "utm_content": "banner-a",
    "utm_keyword": "dock blocks",
    "gclid": "abc123",
    "fbclid": null,
    "landing_page": "https://dockbloxx.com/products"
  },
  
  "products": [
    {
      "name": "DockBloxx Starter Kit",
      "sku": "DBX-001",
      "quantity": 2,
      "total": "199.99"
    }
  ]
}
```

### Payload Notes

- Include all attribution fields (even if null — GHL workflow can handle)
- Customer email is the **anchor** for GHL Contact lookup
- Order ID enables deduplication on GHL side if needed

---

## 6. Idempotency Logic

### Before Sending

```php
function dbx_send_to_ghl($order_id) {
    $order = wc_get_order($order_id);
    
    // Check if already sent
    if ($order->get_meta('_dbx_ghl_sent') === '1') {
        return; // Already processed, skip
    }
    
    // Build and send payload...
}
```

### After Successful Send

```php
$order->update_meta_data('_dbx_ghl_sent', '1');
$order->update_meta_data('_dbx_ghl_sent_at', current_time('c'));
$order->update_meta_data('_dbx_ghl_response', wp_json_encode($response));
$order->save();
```

### On Failure

- Do **NOT** set `_dbx_ghl_sent`
- Log the error
- Order remains eligible for retry (manual or automated)

---

## 7. Error Handling

### HTTP Failures

```php
$response = wp_remote_post($webhook_url, [
    'headers' => ['Content-Type' => 'application/json'],
    'body'    => wp_json_encode($payload),
    'timeout' => 15,
]);

if (is_wp_error($response)) {
    error_log('DBX GHL Webhook Error: ' . $response->get_error_message());
    return false;
}

$code = wp_remote_retrieve_response_code($response);
if ($code < 200 || $code >= 300) {
    error_log("DBX GHL Webhook HTTP $code for order $order_id");
    return false;
}
```

### Logging

- Use `error_log()` for failures
- Optionally store in `_dbx_ghl_error` meta for admin visibility

---

## 8. Configuration

### Required Constants (wp-config.php)

```php
define('DBX_GHL_WEBHOOK_URL', 'https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID');
define('DBX_GHL_ENABLED', true); // Kill switch
```

### Optional: Admin Settings Page

For v1, constants are sufficient. Future versions may add:
- Settings page under WooCommerce menu
- Webhook URL field
- Enable/disable toggle
- Test webhook button
- Retry failed orders button

---

## 9. File Structure

```
wp-content/plugins/dockbloxx-ghl-attribution/
├── dockbloxx-ghl-attribution.php   # Main plugin file
├── includes/
│   ├── class-attribution-handler.php   # Stores attribution on order
│   ├── class-ghl-webhook.php           # Builds & sends webhook
│   └── class-payload-builder.php       # Constructs webhook payload
└── readme.txt
```

---

## 10. Testing Checklist

### Unit Tests

- [ ] Attribution stored correctly on order creation
- [ ] Webhook payload matches expected structure
- [ ] Idempotency: second trigger does not re-send

### Integration Tests

- [ ] Order with attribution → meta saved → webhook fires → GHL receives
- [ ] Order without attribution → order succeeds → webhook fires with empty attribution
- [ ] Failed payment → no webhook fired
- [ ] Webhook failure → order not marked as sent → retry works

### Manual Tests

- [ ] Create order via frontend → check order meta in WP admin
- [ ] Verify GHL workflow receives payload (check GHL logs)
- [ ] Re-save order → no duplicate webhook

---

## 11. Dependencies

- WooCommerce 8.0+
- WordPress 6.0+
- PHP 7.4+
- GHL Inbound Workflow Webhook URL (see [GHL Workflow Contract](./GHL-WORKFLOW-CONTRACT.md))
