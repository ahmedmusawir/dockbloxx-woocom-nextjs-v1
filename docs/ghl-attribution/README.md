# DockBloxx → GHL Attribution Integration

## Overview

This integration ensures **first-touch attribution data** (UTMs, click IDs, landing page) captured on the DockBloxx frontend is **reliably attached to GHL Opportunities** for completed purchases.

### Design Principles

- No pollution of frontend checkout state
- No brittle client-side tracking to GHL
- Attribution is **commerce metadata**, not frontend state
- Capture once → store on order → distribute server-side

---

## Key Decisions

### Attribution Source of Truth

- **Coach's attribution script** (not GHL's tracking script)
- Script infers traffic source when UTMs are missing (organic, social, AI, referral, direct)
- Stores first-touch attribution in **`sessionStorage`**
- `sessionStorage` is authoritative (URL decoration is optional)

### What We Are NOT Using

- ❌ GHL external tracking script
- ❌ URL parsing at checkout time
- ❌ Zustand for attribution (checkout state stays clean)

### GHL Integration Choice

- **Inbound Workflow Webhook** (server-to-server)
- UTMs stored on **Opportunity only**
- No LeadConnector / Opportunity API for v1 (architecture allows swapping later)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Attribution script runs site-wide                                   │
│  2. On "Place Order":                                                   │
│     • Read attribution from sessionStorage                              │
│     • Attach to order-creation POST request                             │
│     • No Zustand involvement                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (WordPress + WooCommerce)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  3. Order created as usual                                              │
│  4. Attribution saved to WooCommerce order meta (_dbx_* prefix)         │
│  5. Stripe payment completes                                            │
│  6. Order status → "processing"                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER (Custom WP Plugin)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  7. Plugin listens for "order processing" event                         │
│  8. Plugin:                                                             │
│     • Reads attribution + order + customer from order meta              │
│     • POSTs to GHL inbound workflow webhook (server-to-server)          │
│     • Marks order as "sent to GHL" (idempotency)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                  GHL                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  9. Workflow triggered by inbound webhook:                              │
│     • Identify/create Contact (email anchor)                            │
│     • Create/update Opportunity                                         │
│     • Write attribution to Opportunity fields                           │
│     • Fallback: store as Opportunity Note if fields unavailable         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Attribution Data Model

### Attribution Keys (from script)

| Key            | Description                              |
|----------------|------------------------------------------|
| `utm_source`   | Traffic source (google, facebook, etc.)  |
| `utm_medium`   | Marketing medium (cpc, email, social)    |
| `utm_campaign` | Campaign name                            |
| `utm_content`  | Ad/link variant                          |
| `utm_keyword`  | Search keyword (derived from `utm_term`) |
| `gclid`        | Google Click ID                          |
| `fbclid`       | Facebook Click ID                        |
| `landing_page` | First page URL visited                   |

### WooCommerce Order Meta

| Meta Key                      | Purpose                        |
|-------------------------------|--------------------------------|
| `_dbx_utm_source`             | Attribution field              |
| `_dbx_utm_medium`             | Attribution field              |
| `_dbx_utm_campaign`           | Attribution field              |
| `_dbx_utm_content`            | Attribution field              |
| `_dbx_utm_keyword`            | Attribution field              |
| `_dbx_gclid`                  | Attribution field              |
| `_dbx_fbclid`                 | Attribution field              |
| `_dbx_landing_page`           | Attribution field              |
| `_dbx_attribution_captured_at`| Timestamp of capture           |
| `_dbx_ghl_sent`               | Boolean: sent to GHL           |
| `_dbx_ghl_sent_at`            | Timestamp of GHL webhook       |
| `_dbx_ghl_response`           | Optional: webhook response log |

### Benefits

- Attribution permanently tied to transaction
- GHL downtime does **not** cause data loss
- Retries and audits are possible

---

## Idempotency & Reliability

- Webhook fires **only once per order**
- If webhook POST fails → order is **not marked as sent** → retry possible
- No client-side calls to GHL
- No webhook secrets exposed to browser

---

## Testing Strategy

| Test                      | Description                                                      |
|---------------------------|------------------------------------------------------------------|
| **UTM Test**              | Visit with explicit UTMs → order → verify meta → verify GHL      |
| **Dark Traffic Test**     | Organic/social/AI visit → verify inferred attribution flows      |
| **Payment Failure Test**  | Ensure no GHL webhook fires for failed/abandoned payments        |
| **Duplicate Protection**  | Re-save/re-trigger order → no duplicate Opportunity              |

---

## Future-Proofing

- If GHL workflows cannot reliably write to Opportunity custom fields:
  - **v1 Fallback**: Opportunity Notes
  - **Later**: Upgrade to Opportunity API via private integration
- Payload builder and transport logic are intentionally decoupled

---

## Contract Documents

- [Frontend Contract](./FRONTEND-CONTRACT.md) — Next.js implementation
- [WP Plugin Contract](./WP-PLUGIN-CONTRACT.md) — WordPress plugin specification
- [GHL Workflow Contract](./GHL-WORKFLOW-CONTRACT.md) — GHL webhook/workflow setup
