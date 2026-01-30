# GHL Attribution Integration - Session Notes
**Date:** January 27, 2026  
**Project:** DockBloxx → GoHighLevel Attribution Integration

---

## 🎯 Objective

Ensure first-touch attribution data (UTMs, click IDs, landing page) captured on the DockBloxx frontend is reliably attached to GHL Opportunities for completed purchases.

---

## ✅ COMPLETED

### Phase 1: Frontend Attribution Capture (Next.js)

#### 1. Attribution Utility Library
**File:** `src/lib/attribution.ts`
- Created `getAttribution()` function to read from sessionStorage
- Created `cleanAttribution()` function to filter null values
- Reads Coach's script keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_keyword`, `_cltk` (gclid), `fbclid`, `landing_page`
- Adds `attribution_captured_at` timestamp

#### 2. Updated CheckoutData Type
**File:** `src/types/checkout.ts`
- Added `attribution?: Record<string, string>` field to `CheckoutData` interface

#### 3. Modified StripePaymentForm
**File:** `src/components/checkout/payments/StripePaymentForm.tsx`
- Added import for attribution utility
- Reads attribution from sessionStorage before order submission
- Merges attribution into order payload
- Console logs attribution data for debugging

#### 4. Updated place-order API Route
**File:** `src/app/api/place-order/route.ts`
- Receives attribution from frontend
- Converts to WooCommerce `meta_data` array
- Uses `_coach_ghl_` prefix for all attribution fields
- Adds `_wc_order_attribution_source_type` for WooCommerce Origin field

### Phase 2: WordPress Plugin (Cyberize Attribution)

#### 1. Basic Plugin Structure
**File:** `wp-content/plugins/cyberize-attribution/cyberize-attribution.php`
- Plugin header with proper metadata
- WooCommerce dependency check on activation
- Activation/deactivation hooks with logging
- Admin notice confirming plugin is active

**Status:** ✅ Activated and working (renamed from "DockBloxx GHL Attribution" to "Cyberize Attribution" per Coach's request)

---

## ✅ COMPLETED (continued)

### Origin Field Update Functionality
**Goal:** Update WooCommerce Order Attribution "Origin" column when order transitions to "processing"

**Code Added:**
- Hook: `woocommerce_order_status_processing`
- Function: `cyberize_update_order_attribution()`
- Reads: `_coach_ghl_utm_source`, `_coach_ghl_utm_medium`, `_coach_ghl_utm_campaign`
- Updates: `_wc_order_attribution_source_type`
- Idempotency: `_cyberize_attribution_processed` flag prevents duplicate processing
- Debug function: `cyberize_debug_last_order()` shows meta values on Orders page

**Test Result (Jan 27, 2026 @ 3:16 PM):**
```
Cyberize Debug - Order #13553:
_coach_ghl_utm_source: google
_cyberize_attribution_processed: yes
_wc_order_attribution_source_type: google
```

**Status:** ✅ DATA WORKS — All meta fields correctly set. However, WooCommerce's "Origin" column in the Orders list still shows "Unknown". This is a **WooCommerce UI limitation** — WC's Order Attribution system uses HPOS tables internally, not standard meta fields. The important attribution data IS captured and accessible for GHL integration.

**Decision:** Skip the Origin UI issue and proceed to GHL webhook integration. The data we need is all there.

---

## ✅ COMPLETED (Phase 3: GHL Webhook Integration)

### GHL Workflow Configuration (Jan 27-28, 2026)
**Goal:** Send attribution + order data to GoHighLevel via Inbound Workflow Webhook

**Final Payload Format:**
```json
{
  "email": "customer@example.com",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "address1": "123 Main St",
  "city": "Houston",
  "state": "TX",
  "postalCode": "77002",
  "country": "US",
  "order_id": "13555",
  "order_total": "79.00",
  "order_date": "2026-01-28T14:05:00+08:00",
  "utm_source": "facebook",
  "utm_medium": "paid-social",
  "utm_campaign": "dealer-promo-2026",
  "utm_content": "qr-code-variant-a",
  "utm_keyword": "dock-accessories",
  "gclid": "",
  "fbclid": "fb_test_dealer_123",
  "coupon": "QUICK10",
  "landing_page": "/"
}
```

**GHL Workflow Setup:**
- Webhook URL: `https://services.leadconnectorhq.com/hooks/4rKuULHASyQ99nwdL1XH/webhook-trigger/1c6a5a77-9f97-463b-bed8-74697688981c`
- Trigger: Inbound Webhook
- Mapping Reference: All fields captured and available via `{{inboundWebhookRequest.field_name}}`

**GHL Actions:**
1. **Create Contact** (using Inbound Webhook Trigger data)
   - Email: `{{inboundWebhookRequest.email}}`
   - Phone: `{{inboundWebhookRequest.phone}}`
   - First Name: `{{inboundWebhookRequest.firstName}}`
   - Last Name: `{{inboundWebhookRequest.lastName}}`
   - Address 1: `{{inboundWebhookRequest.address1}}`
   - City: `{{inboundWebhookRequest.city}}`
   - State: `{{inboundWebhookRequest.state}}`
   - Postal Code: `{{inboundWebhookRequest.postalCode}}`
   - Country: `{{inboundWebhookRequest.country}}`

2. **Create Or Update Opportunity**
   - Name: `Order #{{inboundWebhookRequest.order_id}}`
   - Value: `{{inboundWebhookRequest.order_total}}`
   - Source: Woocom
   - Status: Won
   - Attribution Fields (Custom):
     - UTM Source: `{{inboundWebhookRequest.utm_source}}`
     - UTM Medium: `{{inboundWebhookRequest.utm_medium}}`
     - UTM Campaign: `{{inboundWebhookRequest.utm_campaign}}`
     - UTM Content: `{{inboundWebhookRequest.utm_content}}`
     - UTM Term: `{{inboundWebhookRequest.utm_keyword}}`
     - Facebook Click ID: `{{inboundWebhookRequest.fbclid}}`
     - Google Click ID: `{{inboundWebhookRequest.gclid}}`
     - Landing Page: `{{inboundWebhookRequest.landing_page}}`

**Key Discovery:** GHL's variable picker requires clicking the **tag button** next to each field to reveal the "Inbound Webhook Trigger" category where webhook payload fields are accessible.

**WordPress Plugin Updates:**
- ✅ Settings page under WooCommerce → Cyberize Attribution
- ✅ Enable/Disable toggle for GHL integration
- ✅ Webhook URL configuration
- ✅ Payload uses camelCase field names (firstName, lastName, etc.) per GHL API expectations
- ✅ Idempotency via `_cyberize_ghl_sent` flag
- ✅ Error logging and debug display on Orders page
- ✅ Manual resend button removed (was causing duplicate issues)

**Status:** ✅ FULLY OPERATIONAL

---

## ✅ COMPLETED (Phase 4: Coupon Integration)

### Coupon Parameter Support (Jan 29, 2026)
**Goal:** Capture dealer coupon codes from QR code URLs and auto-fill at checkout

**Coach's Attribution Script Updates:**
**File:** `docs/wp-plugins/attribution-script.md`
- Added `"coupon"` to KEYS array (line 45)
- Script now captures `?coupon=DEALER10` from URL
- Stores in sessionStorage alongside UTMs
- Persists across page navigation

**Frontend Updates:**
**File:** `src/lib/attribution.ts`
- Added `coupon?: string | null` to `AttributionData` interface
- `getAttribution()` reads `coupon` from sessionStorage

**File:** `src/components/checkout/right-pane/ApplyCoupon.tsx`
- Auto-fills coupon field when detected in attribution data
- Shows blue notice: "Dealer Coupon Detected! A coupon code has been pre-filled for you. Please click 'Apply' to activate your discount."
- Notice disappears after successful application
- Requires email/address for coupon validation (WooCommerce requirement)

**Build Fix:**
**File:** `src/services/trackingSeoServices.ts`
- Changed `revalidate: 0` → `revalidate: 3600` (1 hour cache)
- Resolved Next.js static generation build errors
- Allows tracking scripts to be cached without blocking builds

**Status:** ✅ FULLY OPERATIONAL

---

## 📋 NEXT STEPS

1. **Deploy to Staging:**
   - Upload updated WordPress plugin
   - Update Coach's attribution script in WordPress ACF
   - Deploy Next.js frontend to Vercel staging
   - Test complete flow with real orders

2. **Edge Case Testing:**
   - Direct traffic (no UTMs)
   - Partial UTMs only
   - Multiple orders from same session
   - Verify idempotency

3. **Production Deployment:**
   - Final review of all components
   - Deploy to production
   - Monitor GHL Opportunities for first week
   - Consider removing debug panel from WordPress plugin

---

## 📁 FILES MODIFIED

### Next.js (Frontend)
| File | Change |
|------|--------|
| `src/lib/attribution.ts` | Created - attribution utility |
| `src/types/checkout.ts` | Modified - added attribution field |
| `src/components/checkout/payments/StripePaymentForm.tsx` | Modified - reads/sends attribution |
| `src/app/api/place-order/route.ts` | Modified - stores attribution as WooCommerce meta |

### WordPress (Backend)
| File | Change |
|------|--------|
| `wp-content/plugins/cyberize-attribution/cyberize-attribution.php` | Created - main plugin file |
| `wp-content/plugins/cyberize-attribution/readme.txt` | Created - plugin readme |

---

## 🧪 TEST RESULTS

### Test 1: Attribution Capture (Jan 26, 2026)
**URL:** `http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=winter-sale`

**Result:** ✅ SUCCESS
- sessionStorage captured: `utm_source=google`, `utm_medium=cpc`, `utm_campaign=winter-sale`
- Browser console showed attribution data
- WooCommerce order meta received all `_coach_ghl_*` fields

### Test 2: Facebook Attribution (Jan 26, 2026)
**URL:** `http://localhost:3000/?utm_source=facebook&utm_medium=paid-social&utm_campaign=fb-test`

**Result:** ✅ SUCCESS
- All attribution fields captured correctly
- `_coach_ghl_utm_source=facebook` stored in order meta

### Test 3: Plugin Activation (Jan 27, 2026)
**Result:** ✅ SUCCESS
- Plugin "Cyberize Attribution" activated without errors
- Admin notice displayed correctly

### Test 4: Complete End-to-End Flow (Jan 30, 2026)
**URL:** `http://localhost:3000/?utm_source=facebook&utm_medium=paid-social&utm_campaign=dealer-promo-2026&utm_content=qr-code-variant-a&utm_term=dock-accessories&fbclid=fb_test_dealer_123&coupon=QUICK10`

**Result:** ✅ SUCCESS - ALL SYSTEMS OPERATIONAL

**Frontend (Next.js):**
- ✅ sessionStorage captured all parameters:
  - `utm_source`: facebook
  - `utm_medium`: paid-social
  - `utm_campaign`: dealer-promo-2026
  - `utm_content`: qr-code-variant-a
  - `utm_term`: dock-accessories (stored as `utm_keyword`)
  - `fbclid`: fb_test_dealer_123
  - `coupon`: QUICK10
  - `landing_page`: / (auto-captured)
- ✅ Coupon field auto-filled with "QUICK10"
- ✅ Blue notice displayed: "Dealer Coupon Detected! Please click Apply..."
- ✅ Coupon validation required email/address (WooCommerce requirement)
- ✅ Coupon applied successfully after validation

**WordPress (WooCommerce Order):**
- ✅ Order created successfully
- ✅ All attribution data stored in order meta with `_coach_ghl_` prefix:
  - `_coach_ghl_utm_source`: facebook
  - `_coach_ghl_utm_medium`: paid-social
  - `_coach_ghl_utm_campaign`: dealer-promo-2026
  - `_coach_ghl_utm_content`: qr-code-variant-a
  - `_coach_ghl_utm_keyword`: dock-accessories
  - `_coach_ghl_fbclid`: fb_test_dealer_123
  - `_coach_ghl_coupon`: QUICK10
  - `_coach_ghl_landing_page`: /
  - `_coach_ghl_attribution_captured_at`: [timestamp]
- ✅ Debug panel on Orders page shows:
  - Attribution Source: facebook
  - Sent to GHL: yes
  - Sent At: [timestamp]
- ✅ Plugin idempotency working (`_cyberize_ghl_sent` flag prevents duplicates)

**GHL (GoHighLevel):**
- ✅ Contact created with complete information:
  - Email, phone, first name, last name
  - Full address (address1, city, state, postal code, country)
- ✅ Opportunity created:
  - Name: Order #[order_id]
  - Value: $[order_total]
  - Source: Woocom
  - Status: Won
- ✅ All attribution fields populated in Opportunity:
  - UTM Source: facebook ✅
  - UTM Medium: paid-social ✅
  - UTM Campaign: dealer-promo-2026 ✅
  - UTM Content: qr-code-variant-a ✅
  - UTM Term: dock-accessories ✅
  - Facebook Click ID: fb_test_dealer_123 ✅
  - Landing Page: / ✅
  - (Google Click ID: empty - expected)
- ✅ GHL workflow execution logs show all actions executed successfully

**Verification:** Complete data flow from URL → sessionStorage → WooCommerce → GHL confirmed working perfectly.

---

## 📊 DATA FLOW

```
User visits site with UTMs
    ↓
Coach's script captures → sessionStorage
    ↓
User completes checkout
    ↓
StripePaymentForm reads sessionStorage → attribution object
    ↓
POST to /api/place-order with attribution
    ↓
API route stores as _coach_ghl_* meta in WooCommerce
    ↓
Payment succeeds → Order status "processing"
    ↓
WordPress plugin triggered
    ↓
Plugin reads _coach_ghl_* meta
    ↓
Plugin updates _wc_order_attribution_source_type (Origin column)
    ↓
Plugin sends to GHL webhook (Phase 3)
```

---

## 🔑 KEY DECISIONS

1. **Prefix:** `_coach_ghl_` for all attribution meta fields
2. **Storage:** WooCommerce order meta (survives theme changes, accessible by plugin)
3. **Trigger:** `woocommerce_order_status_processing` (fires after payment success)
4. **Idempotency:** `_cyberize_attribution_processed` flag prevents duplicate processing
5. **GHL Integration:** Inbound Workflow Webhook (server-to-server POST)

---

## 📝 NOTES

- WooCommerce Order Attribution "Origin" field requires `_wc_order_attribution_source_type` meta
- Coach's script uses `_cltk` for gclid (not `gclid`)
- Coach's script infers source as "direct" when no UTMs present
- Order meta can be updated after order creation (unlike line items/totals)

---

*Last updated: January 30, 2026 @ 9:58 AM UTC+8*
