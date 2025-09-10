 # Data Flow
 
 This document explains how data moves through the application across Server Components, API routes, client components, and Zustand stores. It connects the state management, API endpoints, and rendering strategies into a single picture.
 
 ---
 
 ## System Overview (ASCII Diagram)
 
 ```text
 ┌─────────────────────────────────────────────────────────────────┐
 │                        DOCKBLOXX FRONTEND                      │
 │                         (Next.js 15)                           │
 ├─────────────────────────────────────────────────────────────────┤
 │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
 │  │   Public    │  │  Customers  │  │    Admin    │             │
 │  │   Routes    │  │   Routes    │  │   Routes    │             │
 │  │ (/blog,     │  │ (/account,  │  │ (/admin/*)  │             │
 │  │  /shop,     │  │  /orders,   │  │             │             │
 │  │  /checkout) │  │  /profile)  │  │             │             │
 │  └─────────────┘  └─────────────┘  └─────────────┘             │
 ├─────────────────────────────────────────────────────────────────┤
 │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
 │  │   Custom    │  │   Service   │  │    State    │             │
 │  │ API Routes  │  │    Layer    │  │ Management  │             │
 │  │   (/api/*)  │  │ (fetch/utils)│ │  (Zustand)  │             │
 │  └─────────────┘  └─────────────┘  └─────────────┘             │
 
## Key Data Journeys (ASCII Diagrams)
 
- __Product Page Load (Server-first)__
  ```text
  ┌──────────────┐
  │   Browser    │
  │ (Product URL)│
  └──────┬───────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ Next.js Server Component     │
  │ (App Router)                 │
  └──────┬───────────────────────┘
         │ fetch (server)
         │ via apiEndpoints.ts
         ▼
  ┌──────────────────────────────┐
  │ Woo/WordPress APIs           │
  │ (GraphQL / REST)             │
  └──────┬───────────────────────┘
         │ data
         ▼
  ┌──────────────────────────────┐
  │ Server renders HTML          │
  │ (SSR/Streaming)              │
  └──────┬───────────────────────┘
         │ HTML + minimal JS
         ▼
  ┌──────────────┐
  │   Browser    │
  │ (hydrate UI) │
  └──────────────┘
  ```
 
- __Adding an Item to the Cart (Client-state)__
  ```text
  ┌──────────────────────┐
  │ Client Component     │
  │ "Add to Cart" click  │
  └───────────┬──────────┘
              │
              ▼
  ┌──────────────────────┐
  │ useCartStore action  │
  │ addOrUpdateCartItem  │
  └───────────┬──────────┘
              │ updates
              ▼
  ┌──────────────────────┐
  │ cartItems in store   │
  │ (persist localStorage)│
  └───────────┬──────────┘
              │ subscribe
              ▼
  ┌──────────────────────┐
  │ UI re-renders        │
  │ (badge, drawer)      │
  └──────────────────────┘
  ```
 
- __Checkout Totals Recalculation (Client + Helpers)__
  ```text
  ┌──────────────────────────────┐
  │ Client Component             │
  │ change shipping/apply coupon │
  └────────────┬─────────────────┘
               │
               ▼
  ┌──────────────────────────────┐
  │ useCheckoutStore setters     │
  │ setShippingMethod/applyCoupon│
  └────────────┬─────────────────┘
               │
               ▼
  ┌──────────────────────────────┐
  │ updateCheckoutTotals()       │
  │ (src/lib/checkoutUtils)      │
  └────────────┬─────────────────┘
               │ totals
               ▼
  ┌──────────────────────────────┐
  │ checkoutData updated         │
  │ UI reflects new totals       │
  └──────────────────────────────┘
  ```
 
- __Placing an Order (Server-proxied)__
  ```text
  ┌──────────────────────────┐
  │ Client (Checkout)        │
  │ POST /api/place-order    │
  └────────────┬─────────────┘
               │ server
               ▼
  ┌──────────────────────────┐
  │ Route Handler            │
  │ src/app/api/place-order  │
  └────────────┬─────────────┘
               │ transform payload
               │ call Woo REST (creds)
               ▼
  ┌──────────────────────────┐
  │ WooCommerce API          │
  └────────────┬─────────────┘
               │ order resp
               ▼
  ┌──────────────────────────┐
  │ API responds             │
  │ client navigates/updates │
  └──────────────────────────┘
  ```
 
- __Searching Products (Server-proxied)__
  ```text
  ┌──────────────────────────┐
  │ Client (Search UI)       │
  │ GET /api/search          │
  └────────────┬─────────────┘
               │ server
               ▼
  ┌──────────────────────────┐
  │ Route Handler            │
  │ src/app/api/search       │
  └────────────┬─────────────┘
               │ query Woo REST
               ▼
  ┌──────────────────────────┐
  │ WooCommerce API          │
  └────────────┬─────────────┘
               │ normalized results
               ▼
  ┌──────────────────────────┐
  │ API responds             │
  │ UI renders (optional     │
  │ cache in useProductStore)│
  └──────────────────────────┘
  ```
 
---
 
## Server-side Data Fetching
 
- __Server Components (preferred for page data)__
  - Use when data is needed to render initial HTML for SEO and performance.
  - Fetch directly from WordPress GraphQL or WooCommerce REST using endpoints built in `src/constants/apiEndpoints.ts`.
  - Keep secrets on the server; leverage ISR/`revalidate` for caching.
   - Use when data is needed to render initial HTML for SEO and performance.
   - Fetch directly from WordPress GraphQL or WooCommerce REST using endpoints built in `src/constants/apiEndpoints.ts`.
   - Keep secrets on the server; leverage ISR/`revalidate` for caching.
 
 - __Next.js API Routes as Proxies__
   - Located in `src/app/api/` (e.g., `get-product-by-slug`, `get-all-products`, `products-by-category`, `search`).
   - Use when:
     - Secrets/credentials must be protected (WooCommerce keys, Stripe key).
     - Response needs normalization, validation, or aggregation.
     - Cross-origin or rate-limiting concerns benefit from a controlled server layer.
   - Examples:
     - `GET /api/get-product-by-slug` → GraphQL fetch and normalization.
     - `GET /api/products-by-category` → REST with filters and pagination.
     - `POST /api/create-payment-intent` → Stripe server call returns `clientSecret`.
     - `POST /api/place-order` → transforms checkout payload to Woo REST order.
 
 - __When to choose which__
   - Prefer Server Components for page-level, cacheable data.
   - Prefer API routes for sensitive operations or reusable, normalized endpoints.
 
 ---
 
 ## Client-side Data Fetching
 
 - __Primary approach__
   - Most core product/catalog data is fetched on the server for SEO and perf.
   - Client components fetch only when needed for interactivity or user-triggered queries.
 
 - __Mechanics__
   - Direct `fetch` from Client Components to our own API routes (e.g., `/api/search`, `/api/get-all-posts`).
   - Results may be stored in Zustand when it benefits UX (e.g., caching a loaded page of products with `useProductStore`).
 
 - __Libraries__
   - At present, no SWR/React Query usage is assumed; client fetches are handled with custom calls or services.
 
 ---
 
 ## Data Caching and Performance
 
 - __Centralized Endpoints__
   - All base URLs are composed in `src/constants/apiEndpoints.ts` using `getApiUrl()` and `NEXT_PUBLIC_BACKEND_URL`.
 
 - __Server Rendering & ISR__
   - Server Components can specify `fetch` options with `next: { revalidate: N }` to enable ISR and reduce origin calls.
   - Route handlers may set caching via fetch options or manual headers. Example noted in docs: `/api/featured-products` cached ~60s.
 
 - __Proxy Layer Benefits__
   - API routes handle normalization and error boundaries once.
   - Credentials (WooCommerce keys, Stripe secret) never reach the client.
 
 - __Zustand Persistence__
   - Client caches for UX:
     - `useCartStore` persists `cartItems` in `localStorage`.
     - `useCheckoutStore` persists selected fields (addresses, coupon, flags, payment intent secret as needed).
     - `useProductStore` persists product lists in IndexedDB via `localforage`.
   - Hydration flags (`isLoading`, `hasHydrated`, `isHydrated`) prevent flicker and stale reads.
 
 - __Refresh & Invalidation__
   - Server data refreshes on `revalidate` interval or navigation to pages that refetch on the server.
   - Client-triggered fetches (e.g., search) always hit our API route and get fresh results.
 
 ---
 
 ## Putting It Together (End-to-End Examples)
 
 - __Product Page (SSR + Client interactivity)__
   - Server Component fetches product via GraphQL/REST → renders HTML.
   - Client enhancements (e.g., “Add to Cart”) use Zustand (`useCartStore`) and never block initial paint.
 
 - __Category Browsing (Server fetch + Client pagination)__
   - Initial page list from server (`/api/products-by-category`).
   - Client pagination or infinite scroll fetches next pages via the same API route.
   - Optionally append to `useProductStore` for smoother back/forward navigation.
 
 - __Checkout (Client workflow + Server mutations)__
   - Client manages form state in `useCheckoutStore`; totals via `updateCheckoutTotals()`.
   - Payment intent via `POST /api/create-payment-intent` (server)
   - Place order via `POST /api/place-order` (server)
   - Confirmation page can be a Server Component that reads the resulting order (via API or params).
 
 ---
 
 ## Quick Reference
 
 - __Server data paths__
   - `src/constants/apiEndpoints.ts` for base URLs and endpoints.
   - `src/app/api/*` for proxied, normalized server endpoints.
 
 - __Client state paths__
   - `src/store/useCartStore.ts`, `src/store/useCheckoutStore.ts`, `src/store/useProductStore.ts`.
 
 - __Security__
   - Production env vars (e.g., `WOOCOM_CONSUMER_KEY`, `WOOCOM_CONSUMER_SECRET`, `STRIPE_SECRET_KEY`) are server-only. Client sees only necessary public values.
