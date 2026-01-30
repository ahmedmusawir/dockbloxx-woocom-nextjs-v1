# GHL Workflow Contract — GoHighLevel Webhook & Workflow Setup

## Scope

This document defines the **GHL (GoHighLevel) responsibilities** for the Attribution Integration. GHL must:

1. Receive inbound webhook from WordPress
2. Identify or create Contact (email anchor)
3. Create or update Opportunity
4. Store attribution data on the Opportunity

---

## 1. Inbound Webhook Setup

### Create Inbound Webhook Trigger

1. Navigate to **Automation** → **Workflows**
2. Create new workflow: "DockBloxx Order Attribution"
3. Add trigger: **Inbound Webhook**
4. Copy the generated webhook URL

### Webhook URL Format

```
https://services.leadconnectorhq.com/hooks/YOUR_UNIQUE_WEBHOOK_ID
```

> **Important**: Provide this URL to the WordPress plugin configuration.

---

## 2. Expected Payload Structure

The WordPress plugin sends this JSON payload:

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

### Field Reference

| Field Path                  | Type   | Description                    |
|-----------------------------|--------|--------------------------------|
| `event`                     | string | Always `order_completed`       |
| `order_id`                  | int    | WooCommerce order ID           |
| `order_number`              | string | Display order number           |
| `order_total`               | string | Total amount                   |
| `currency`                  | string | Currency code (USD)            |
| `order_date`                | string | ISO 8601 timestamp             |
| `customer.email`            | string | **Contact anchor** (required)  |
| `customer.first_name`       | string | Customer first name            |
| `customer.last_name`        | string | Customer last name             |
| `customer.phone`            | string | Customer phone                 |
| `attribution.utm_source`    | string | Traffic source                 |
| `attribution.utm_medium`    | string | Marketing medium               |
| `attribution.utm_campaign`  | string | Campaign name                  |
| `attribution.utm_content`   | string | Ad/link variant                |
| `attribution.utm_keyword`   | string | Search keyword                 |
| `attribution.gclid`         | string | Google Click ID                |
| `attribution.fbclid`        | string | Facebook Click ID              |
| `attribution.landing_page`  | string | First page visited             |
| `products[]`                | array  | Line items                     |

---

## 3. Workflow Steps

### Step 1: Find or Create Contact

**Action**: Find or Create Contact

| Setting        | Value                              |
|----------------|------------------------------------|
| Lookup By      | Email                              |
| Email          | `{{trigger.customer.email}}`       |
| First Name     | `{{trigger.customer.first_name}}`  |
| Last Name      | `{{trigger.customer.last_name}}`   |
| Phone          | `{{trigger.customer.phone}}`       |

> Contact is created if not found; updated if exists.

---

### Step 2: Create Opportunity

**Action**: Create Opportunity

| Setting          | Value                                          |
|------------------|------------------------------------------------|
| Pipeline         | Select your sales pipeline                     |
| Stage            | "Won" or "Completed Purchase"                  |
| Opportunity Name | `Order {{trigger.order_number}}`               |
| Contact          | Contact from Step 1                            |
| Monetary Value   | `{{trigger.order_total}}`                      |

---

### Step 3: Update Opportunity Custom Fields

**Action**: Update Opportunity

Map attribution data to **Opportunity custom fields**:

| Custom Field Name | Value                                  |
|-------------------|----------------------------------------|
| UTM Source        | `{{trigger.attribution.utm_source}}`   |
| UTM Medium        | `{{trigger.attribution.utm_medium}}`   |
| UTM Campaign      | `{{trigger.attribution.utm_campaign}}` |
| UTM Content       | `{{trigger.attribution.utm_content}}`  |
| UTM Keyword       | `{{trigger.attribution.utm_keyword}}`  |
| GCLID             | `{{trigger.attribution.gclid}}`        |
| FBCLID            | `{{trigger.attribution.fbclid}}`       |
| Landing Page      | `{{trigger.attribution.landing_page}}` |
| Order ID          | `{{trigger.order_id}}`                 |
| Order Date        | `{{trigger.order_date}}`               |

### Required: Create Custom Fields First

Before the workflow can write to these fields, create them in GHL:

1. Go to **Settings** → **Custom Fields**
2. Select **Opportunities** tab
3. Create each field:

| Field Name    | Field Type  | Internal Name (suggested) |
|---------------|-------------|---------------------------|
| UTM Source    | Single Line | `utm_source`              |
| UTM Medium    | Single Line | `utm_medium`              |
| UTM Campaign  | Single Line | `utm_campaign`            |
| UTM Content   | Single Line | `utm_content`             |
| UTM Keyword   | Single Line | `utm_keyword`             |
| GCLID         | Single Line | `gclid`                   |
| FBCLID        | Single Line | `fbclid`                  |
| Landing Page  | Single Line | `landing_page`            |
| Order ID      | Number      | `woo_order_id`            |
| Order Date    | Date        | `order_date`              |

---

## 4. Fallback: Opportunity Notes

If custom fields are not available or workflow limitations prevent field updates:

### Alternative Step 3: Add Opportunity Note

**Action**: Add Note to Opportunity

```
📊 Attribution Data for Order {{trigger.order_number}}

Source: {{trigger.attribution.utm_source}}
Medium: {{trigger.attribution.utm_medium}}
Campaign: {{trigger.attribution.utm_campaign}}
Content: {{trigger.attribution.utm_content}}
Keyword: {{trigger.attribution.utm_keyword}}
GCLID: {{trigger.attribution.gclid}}
FBCLID: {{trigger.attribution.fbclid}}
Landing Page: {{trigger.attribution.landing_page}}

Order Total: {{trigger.order_total}} {{trigger.currency}}
Order Date: {{trigger.order_date}}
```

> Notes are always available and provide a reliable fallback.

---

## 5. Deduplication (Optional)

To prevent duplicate Opportunities if webhook fires twice:

### Option A: Workflow Filter

Add a filter step after Contact lookup:

- **Condition**: Opportunity with name containing `{{trigger.order_number}}` does NOT exist
- **If false**: Stop workflow

### Option B: Trust WordPress Idempotency

The WordPress plugin already prevents duplicate sends via `_dbx_ghl_sent` meta. This is the primary safeguard.

---

## 6. Workflow Diagram

```
┌─────────────────────────────────────┐
│     Inbound Webhook Trigger         │
│     (receives order payload)        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     Find or Create Contact          │
│     (email = customer.email)        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     Create Opportunity              │
│     (pipeline, stage, value)        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     Update Opportunity Fields       │
│     (UTMs, click IDs, landing page) │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     (Optional) Add Note             │
│     (fallback or additional log)    │
└─────────────────────────────────────┘
```

---

## 7. Testing Checklist

### Webhook Tests

- [ ] Send test payload via Postman/curl → workflow triggers
- [ ] Contact created/found correctly
- [ ] Opportunity created with correct name and value
- [ ] Attribution fields populated on Opportunity

### End-to-End Tests

- [ ] Place order on staging site → verify GHL Opportunity
- [ ] Verify all UTM fields appear correctly
- [ ] Test with missing attribution → Opportunity still created
- [ ] Test duplicate order ID → no duplicate Opportunity

### Test Payload (curl)

```bash
curl -X POST "YOUR_GHL_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order_completed",
    "order_id": 99999,
    "order_number": "TEST-99999",
    "order_total": "99.99",
    "currency": "USD",
    "order_date": "2024-01-15T10:00:00Z",
    "customer": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User",
      "phone": "+1234567890"
    },
    "attribution": {
      "utm_source": "test",
      "utm_medium": "manual",
      "utm_campaign": "integration-test",
      "utm_content": null,
      "utm_keyword": null,
      "gclid": null,
      "fbclid": null,
      "landing_page": "https://dockbloxx.com/test"
    },
    "products": [
      {
        "name": "Test Product",
        "sku": "TEST-001",
        "quantity": 1,
        "total": "99.99"
      }
    ]
  }'
```

---

## 8. Future Enhancements

### v2: Opportunity API Integration

If workflow limitations arise, upgrade to direct API calls:

1. Create a **GHL Private Integration** (API key)
2. WordPress plugin calls Opportunity API directly
3. Full control over field mapping and error handling

### API Endpoint Reference

```
POST https://services.leadconnectorhq.com/opportunities/
Authorization: Bearer YOUR_API_KEY
```

This upgrade requires no frontend changes — only the WordPress plugin transport layer changes.

---

## 9. Troubleshooting

| Issue                          | Solution                                      |
|--------------------------------|-----------------------------------------------|
| Webhook not triggering         | Verify URL, check GHL workflow is published   |
| Contact not found/created      | Check email field mapping                     |
| Custom fields not updating     | Verify fields exist, check field internal IDs |
| Duplicate Opportunities        | Check WP idempotency, add workflow filter     |
| Missing attribution values     | Normal if visitor had no UTMs (dark traffic)  |

---

## 10. Security Notes

- Webhook URL should be treated as a secret (not public)
- GHL workflows run server-side (no CORS issues)
- No API keys exposed to frontend
- WordPress plugin handles all GHL communication
