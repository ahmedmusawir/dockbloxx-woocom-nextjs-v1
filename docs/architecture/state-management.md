# State Management

This document explains how application state is modeled and managed in the Dockbloxx frontend. It covers the high-level strategy, why we use Zustand, how global stores are organized, how we treat server vs. client state, and SSR/hydration considerations.

---

## High‑Level Strategy

We use a layered approach to state:

- **Local UI state (React `useState`)**
  - Ephemeral, component‑scoped concerns such as toggles, input values, or transient UI flags.
  - Keep these local whenever the state does not need to be shared.

- **Global client state (Zustand v5)**
  - Cross‑page/session concerns and user workflows that must be shared across components.
  - Examples: cart contents, checkout form data, pagination UI state, product cache in client.

- **Server state (Next.js Server Components + API routes)**
  - Data that originates from WooCommerce/WordPress/Stripe.
  - Fetched on the server via centralized endpoints in `src/constants/apiEndpoints.ts` and exposed through server components or custom API routes under `src/app/api/`.
  - Use Next.js caching semantics (e.g., `revalidate`) and keep secrets server‑side.

This separation keeps UI responsive, reduces over‑fetching, and avoids coupling client stores to remote data fetching.

---

## Why Zustand

Zustand is chosen for global state because it is:

- **Small and fast**: Minimal bundle impact with excellent performance.
- **Simple API**: Plain objects and functions—no reducers or boilerplate.
- **Unopinionated**: We compose domain‑oriented stores ("slices") that fit our app.
- **Persistent**: First‑class middleware for persistence (`persist`) to `localStorage`/IndexedDB.
- **Framework‑friendly**: Works well with Next.js App Router and React Server Components when used in client components.

Reference stores live in `src/store/`.

---

## Global State Slices (Stores)

All stores are colocated in `src/store/` and are designed per domain. Key stores:

- **`useCartStore.ts`**
  - State:
    - `cartItems`
    - `isCartOpen`
    - `isLoading`
  - Actions:
    - `addOrUpdateCartItem`
    - `setOrReplaceCartItemQuantity`
    - `increaseCartQuantity`
    - `decreaseCartQuantity`
    - `removeCartItem`
    - `clearCart`
    - `subtotal`
  - Persistence: `persist` with `createJSONStorage(localStorage)`; partializes to persist only `cartItems`.
  - Hydration: `onRehydrateStorage` toggles `isLoading` → `false` after client rehydrate.
  - Keying: builds a composite key from `id + variations + customFields` to differentiate product variants.

- **`useCheckoutStore.ts`**
  - State:
    - `checkoutData` (billing, shipping, payment/shipping method, cartItems, coupon, totals)
    - `billingSameAsShipping`
    - `orderValidated`
    - `paymentIntentClientSecret`
    - `orderId`
    - `emailSaved`
    - `isAnyBlockEditing`
    - `isHydrated`
    - `customerNote`
  - Actions:
    - granular setters (billing/shipping/methods)
    - `setCartItems`
    - `applyCoupon`
    - `removeCoupon`
    - `calculateTotals`
    - `resetCheckout`
    - `setPaymentIntentClientSecret`
    - `clearPaymentIntent`
  - Business logic: totals are funneled through utilities like `updateCheckoutTotals()` and coupon helpers in `src/lib/`.
  - Persistence: partialized fields are stored to `localStorage`; `onRehydrateStorage` sets `isHydrated`.
  - Guardrails: respects free‑shipping coupons when changing shipping method.

- **`useProductStore.ts`**
  - State:
    - `products`
    - `isLoading`
    - `hasHydrated`
  - Actions:
    - `setProducts`
    - `addProducts`
    - `clearProducts`
  - Persistence: `persist` backed by `localforage` (IndexedDB) to reduce `localStorage` pressure.
  - Hydration: `onRehydrateStorage` flips loading false; exposes `hasHydrated` for UI.

- **Pagination stores**
  - Files:
    - `usePaginationStore.ts`
    - `useNumberedPaginationStore.ts`
  - Manage: page, limit, cursors, and UI concerns for list/grid views.

Each store focuses on its domain. Components subscribe to only the state they need, minimizing rerenders.

---

## Server vs. Client State

- **Server state**
  - Fetched on the server via `fetch`/GraphQL/Woo REST using centralized endpoints from `src/constants/apiEndpoints.ts`.
  - Exposed through server components or API routes under `src/app/api/` such as: `/api/get-all-products`, `/api/products-by-category`, `/api/search`, `/api/get-post-by-slug`, etc.
  - Use `next: { revalidate: N }` or route handlers with ISR where appropriate.

- **Client state**
  - User interactions and workflow state (cart, checkout, filters) live in Zustand stores.
  - Server data can be copied into client stores when necessary for UX (e.g., seeding `cartItems` into checkout store), but we avoid duplicating remote truth unless required for UX.

- **Pattern**
  - Prefer rendering server‑fetched data in Server Components when possible.
  - Use Client Components + Zustand for interactive slices (cart drawer, quantity steppers, coupon application) that require immediate responsiveness.

---

## SSR and Hydration with Zustand

Zustand stores are consumed from Client Components only. For SSR/Streaming with the App Router:

- **Persisted stores**
  - `useCartStore` and `useCheckoutStore` use `persist` to keep critical workflow state across reloads.
  - `partialize` ensures we only store what we need (e.g., `cartItems`, not UI flags unless required).
  - `onRehydrateStorage` is used to mark hydration completion (`isLoading`/`isHydrated`) to avoid UI flicker.

- **Hydration flow**
  1. Server renders page structure (mostly server components);
  2. Client mounts; Zustand rehydrates from storage;
  3. UI gates on `isLoading`/`isHydrated` flags to prevent using stale/empty state before hydration.

- **Recommended patterns**
  - Gate interactive UI with flags from the store:
    ```tsx
    "use client";
    import { useCartStore } from "@/store/useCartStore";

    export function CartDrawer() {
      const { isLoading, cartItems } = useCartStore((s) => ({
        isLoading: s.isLoading,
        cartItems: s.cartItems,
      }));
      if (isLoading) return null; // or a skeleton
      return <div>{cartItems.length} items</div>;
    }
    ```
  - Avoid reading from persisted stores in Server Components. Pass necessary data via props into Client Components instead.
  - When moving server data to client stores, do so explicitly (e.g., after a user action) and keep the server as the source of truth for refetches.

---

## Usage Notes and Best Practices

- **Keep stores small and cohesive**: one domain per file in `src/store/`.
- **Selector pattern**: subscribe to slices of state (`useStore((s) => s.field)`) to minimize rerenders.
- **Persistence thoughtfully**: only persist what must survive reloads (e.g., cart contents, checkout form fields, payment intent secret as needed).
- **Derivations via helpers**: compute totals/discounts through utilities (`src/lib/checkoutUtils`, `src/lib/couponUtils`) to keep stores lean and testable.
- **Side‑effects**: keep network effects in components or dedicated service modules, not inside store definitions.
- **Type safety**: stores are fully typed (e.g., `CartItem`, `CheckoutData`, `Product`).

---

## Quick Reference

- Global stores live under `src/store/`:
  - `useCartStore.ts`, `useCheckoutStore.ts`, `useProductStore.ts`, `usePaginationStore.ts`, `useNumberedPaginationStore.ts`.
- Server data entry points:
  - Centralized endpoints in `src/constants/apiEndpoints.ts` using `getApiUrl()` with `NEXT_PUBLIC_BACKEND_URL`.
  - API route handlers in `src/app/api/` for Woo/WordPress/Stripe operations.

This approach balances SSR performance with rich client interactivity while keeping the state model simple and maintainable.
