# Frontend Contract — Next.js Implementation

## Scope

This document defines the **frontend responsibilities** for the GHL Attribution Integration. The Next.js app must:

1. Run the attribution script site-wide
2. Read attribution from `sessionStorage` at checkout
3. Attach attribution to the order-creation request

---

## 1. Attribution Script Integration

### Location

The attribution script should be loaded **site-wide** (e.g., in the root layout or `_app`).

### Script Behavior (Coach's Script)

The script handles:

- **UTM Capture**: Parses URL for `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- **Click ID Capture**: Extracts `gclid`, `fbclid` from URL
- **Landing Page**: Records the first page URL
- **Source Inference**: When UTMs are missing, infers source:
  - `organic` — from search engines without paid params
  - `social` — from social media referrers
  - `ai` — from AI tools (ChatGPT, Perplexity, etc.)
  - `referral` — from other websites
  - `direct` — no referrer
- **First-Touch Storage**: Writes to `sessionStorage` (does NOT overwrite if already set)

### sessionStorage Keys

```
dbx_utm_source
dbx_utm_medium
dbx_utm_campaign
dbx_utm_content
dbx_utm_keyword      // normalized from utm_term
dbx_gclid
dbx_fbclid
dbx_landing_page
dbx_attribution_captured_at
```

> **Note**: `sessionStorage` is authoritative. URL decoration is optional/secondary.

---

## 2. Reading Attribution at Checkout

### When to Read

Read attribution **immediately before** calling the order-creation endpoint (Place Order button click).

### How to Read

```typescript
// Example utility function
function getAttribution(): Record<string, string | null> {
  return {
    utm_source: sessionStorage.getItem('dbx_utm_source'),
    utm_medium: sessionStorage.getItem('dbx_utm_medium'),
    utm_campaign: sessionStorage.getItem('dbx_utm_campaign'),
    utm_content: sessionStorage.getItem('dbx_utm_content'),
    utm_keyword: sessionStorage.getItem('dbx_utm_keyword'),
    gclid: sessionStorage.getItem('dbx_gclid'),
    fbclid: sessionStorage.getItem('dbx_fbclid'),
    landing_page: sessionStorage.getItem('dbx_landing_page'),
    attribution_captured_at: sessionStorage.getItem('dbx_attribution_captured_at'),
  };
}
```

### What NOT to Do

- ❌ Do NOT store attribution in Zustand
- ❌ Do NOT parse URL at checkout time
- ❌ Do NOT make any direct calls to GHL from the browser
- ❌ Do NOT expose any GHL webhook URLs or secrets client-side

---

## 3. Attaching Attribution to Order Request

### Payload Structure

Add an `attribution` object to the existing order-creation POST body:

```typescript
interface OrderCreatePayload {
  // ... existing fields (customer, line_items, shipping, etc.)
  
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_keyword?: string;
    gclid?: string;
    fbclid?: string;
    landing_page?: string;
    attribution_captured_at?: string;
  };
}
```

### Implementation Notes

- Only include non-null values (filter out nulls before sending)
- Attribution is **optional** — order creation must succeed even if attribution is empty
- Backend will store whatever is provided; missing fields are simply not stored

### Example Integration Point

```typescript
// In your checkout submission handler
const attribution = getAttribution();

const orderPayload = {
  // ... existing order data
  attribution: Object.fromEntries(
    Object.entries(attribution).filter(([_, v]) => v != null)
  ),
};

// POST to your order-creation endpoint
await createOrder(orderPayload);
```

---

## 4. File Locations (Suggested)

| Purpose                  | Suggested Path                              |
|--------------------------|---------------------------------------------|
| Attribution script       | `public/scripts/attribution.js` or inline in layout |
| Attribution utility      | `src/lib/attribution.ts`                    |
| Checkout integration     | Existing checkout service/hook              |

---

## 5. Testing Checklist

### Manual Tests

- [ ] Visit site with UTMs → verify `sessionStorage` populated
- [ ] Visit site without UTMs → verify inferred source in `sessionStorage`
- [ ] Place order → verify attribution in request payload (Network tab)
- [ ] Place order without attribution → verify order still succeeds

### Automated Tests (Optional)

- Mock `sessionStorage` in tests
- Verify `getAttribution()` returns expected shape
- Verify order payload includes attribution when present

---

## 6. Dependencies

- **Coach's attribution script** must be provided/integrated
- **Backend endpoint** must accept the `attribution` field (see [WP Plugin Contract](./WP-PLUGIN-CONTRACT.md))

---

## 7. Security Notes

- No secrets on the frontend
- No direct GHL API calls from browser
- Attribution data is non-sensitive (UTMs are public by nature)
