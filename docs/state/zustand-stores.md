# Zustand Stores Reference

This document is a definitive reference for the global client state managed with Zustand. It covers the stores in `src/store/`, their purpose, state shape, primary actions, and notable implementation details.

## Cheat Sheet

- __useCartStore__ — Cart items, open state, quick totals.
  ```ts
  const items = useCartStore((s) => s.cartItems);
  const count = useCartStore((s) => s.cartItems.reduce((n,i)=>n+i.quantity,0));
  const subtotal = useCartStore((s) => s.subtotal());
  const add = useCartStore((s) => s.addOrUpdateCartItem);
  ```

- __useCheckoutStore__ — Checkout session state and derived totals.
  ```ts
  const data = useCheckoutStore((s) => s.checkoutData);
  const isHydrated = useCheckoutStore((s) => s.isHydrated);
  const setShipping = useCheckoutStore((s) => s.setShippingMethod);
  const applyCoupon = useCheckoutStore((s) => s.applyCoupon);
  ```

- __useProductStore__ — Client-side product cache for smoother nav.
  ```ts
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.isLoading);
  const setProducts = useProductStore((s) => s.setProducts);
  ```

- __usePaginationStore__ — Cursor-based pagination accumulator.
  ```ts
  const items = usePaginationStore((s) => s.items);
  const hasNext = usePaginationStore((s) => s.hasNextPage);
  const fetchNext = usePaginationStore((s) => s.fetchNextPage);
  ```

- __useNumberedPaginationStore__ — Page-numbered cache with totals.
  ```ts
  const page = useNumberedPaginationStore((s) => s.currentPage);
  const totalPages = useNumberedPaginationStore((s) => s.totalPages);
  const pageData = useNumberedPaginationStore((s) => s.pageData[page]);
  const fetchPage = useNumberedPaginationStore((s) => s.fetchPage);
  ```

## Best Practices

- __Use selectors to minimize re-renders__
  - Subscribe to the smallest slice you need, e.g. `useCartStore((s) => s.subtotal())`.
  - Consider `zustand/shallow` when selecting multiple fields.

- __Persist only what helps UX__
  - Use `partialize` to trim storage (e.g., cart persists only `cartItems`; pagination persists items and cursors).

- __Hydration-aware UI__
  - Gate UI on `isHydrated`/`hasHydrated` (e.g., hide totals until hydrated to avoid flicker).

- __Keep side effects outside stores when possible__
  - Stores should focus on state and pure updates. Put API orchestration in components/services; when async lives in a store (e.g., pagination), keep it small and set `loading` flags.

- __Normalize inputs at the boundary__
  - Example: cart normalizes unit price on insert to avoid compounding errors.

- __Namespace caches__
  - Use keys like `cacheKey` (numbered pagination) to avoid cross-context collisions.

- __Immutable updates and clear reset paths__
  - Always return new objects/arrays; provide `reset*` actions for predictable flows.

---

## `useCartStore` (`src/store/useCartStore.ts`)

- __Store Purpose__
  - Manages the shopping cart: items, UI open state, and helper computations.

- __Key State Variables__
  - `cartItems: CartItem[]`
  - `isCartOpen: boolean`
  - `isLoading: boolean`

- __Primary Actions__
  - `setIsLoading(loading: boolean)`
  - `setIsCartOpen(isOpen: boolean)`
  - `setCartItems(updater: CartItem[] | (prev: CartItem[]) => CartItem[])`
  - `addOrUpdateCartItem(item: CartItem)`
  - `setOrReplaceCartItemQuantity(item: CartItem)`
  - `removeCartItem(item: CartItem)`
  - `clearCart()`
  - `increaseCartQuantity(target: CartItem)`
  - `decreaseCartQuantity(target: CartItem)`

- __Derived/Helpers__
  - `subtotal(): number` — computes total cost from `cartItems`.
  - `getItemQuantity(itemId: number): number`
  - `getCartDetails(): CartItem[]`
  - `makeKey(item: CartItem): string` — composite key of `id + variations + customFields`.

- __Implementation Details__
  - Uses `persist` with `localStorage` via `createJSONStorage`.
  - `partialize` persists only `{ cartItems }` to minimize storage.
  - On rehydrate, `setIsLoading(false)` is invoked.
  - Normalizes `price` on `addOrUpdateCartItem` to ensure unit price (uses `basePrice` when present).
  - Quantity replacement vs increment: `setOrReplaceCartItemQuantity` sets an exact quantity; `addOrUpdateCartItem` increments when keys match.

---

## `useCheckoutStore` (`src/store/useCheckoutStore.ts`)

- __Store Purpose__
  - Holds and derives checkout state: addresses, shipping/payment selections, coupon, totals, and order/session flags.

- __Key State Variables__
  - `checkoutData: CheckoutData` with fields:
    - `billing`, `shipping`
    - `paymentMethod: string`
    - `shippingMethod: "flat_rate" | "free_shipping" | "local_pickup"`
    - `shippingCost: number`
    - `cartItems: CartItem[]`
    - `coupon: Coupon | null`
    - Totals: `subtotal`, `taxTotal`, `discountTotal`, `total`
    - `customerNote: string`
  - Flags/metadata:
    - `billingSameAsShipping: boolean`
    - `orderValidated: boolean`
    - `paymentIntentClientSecret: string`
    - `orderId: number | null`
    - `emailSaved: boolean`
    - `isAnyBlockEditing: boolean`
    - `isHydrated: boolean`

- __Primary Actions__
  - Address/payment/shipping setters:
    - `setBilling(billing)`
    - `setShipping(shipping)`
    - `setPaymentMethod(method)`
    - `setShippingMethod(method, cost)` — recalculates totals; guarded if `coupon.free_shipping` is set.
  - Cart/coupon/totals:
    - `setCartItems(items)` — funnels through `updateCheckoutTotals(...)`.
    - `setCoupon(coupon)` — stores coupon then recalculates via `updateCheckoutTotals`.
    - `calculateTotals()` — single source of truth via `updateCheckoutTotals`.
    - `applyCoupon(coupon)` — validates, stores, recalculates.
    - `removeCoupon()` — clears coupon and restores shipping cost according to `subtotal` tiers; recomputes total.
  - Session/order flags:
    - `setBillingSameAsShipping(value)`
    - `setOrderValidated(value)`
    - `setPaymentIntentClientSecret(secret)` / `clearPaymentIntent()`
    - `setOrderId(id)`
    - `setEmailSaved(value)`
    - `setIsAnyBlockEditing(value)`
    - `setIsHydrated(value)`
    - `setCustomerNote(note)`
  - Lifecycle:
    - `resetCheckout()` — resets all `checkoutData` fields to defaults.

- __Implementation Details__
  - Uses `persist` with `localStorage` via `createJSONStorage`.
  - `partialize` persists: `checkoutData`, `billingSameAsShipping`, `orderValidated`, `paymentIntentClientSecret`, `emailSaved`.
  - On rehydrate, sets `isHydrated = true` (via `onRehydrateStorage`).
  - Derivations centralized in `updateCheckoutTotals()` from `src/lib/checkoutUtils`.
  - `applyCoupon()` uses `validateCoupon()` from `src/lib/couponUtils`.
  - `setShippingMethod()` is a no-op when `coupon.free_shipping` is active.

---

## `useProductStore` (`src/store/useProductStore.ts`)

- __Store Purpose__
  - Lightweight cache for product data to improve client navigation UX.

- __Key State Variables__
  - `products: Product[]`
  - `isLoading: boolean`
  - `hasHydrated: boolean`

- __Primary Actions__
  - `setIsLoading(loading: boolean)`
  - `setHasHydrated(hydrated: boolean)`
  - `setProducts(products: Product[])` — overwrite cache.
  - `addProducts(products: Product[])` — append to cache.
  - `clearProducts()` — clear cache.

- __Implementation Details__
  - Uses `persist` with a custom `localforage` storage (IndexedDB) for larger payloads.
  - On rehydrate, sets `isLoading = false`.
  - No `partialize` — the store persists the product array by design.

---

## `usePaginationStore` (`src/store/usePaginationStore.ts`)

- __Store Purpose__
  - Cursor-based pagination state for GraphQL-like or cursor APIs.

- __Key State Variables__
  - `items: T[]` — accumulated items
  - `endCursor: string | null`
  - `hasNextPage: boolean`
  - `isLoading: boolean`
  - `hasHydrated: boolean`

- __Primary Actions__
  - `fetchNextPage(fetchFn)` — calls `fetchFn(endCursor)` and appends results.
  - `updateData(newItems, newEndCursor, newHasNextPage)` — manual append/update.
  - `resetPagination()` — clears items and cursors.
  - `setIsLoading(loading)`
  - `markHydrated()`

- __Implementation Details__
  - Uses `persist` with `localStorage` via `createJSONStorage`.
  - `partialize` persists `{ items, endCursor, hasNextPage }` only.
  - On rehydrate, `setIsLoading(false)` is invoked.
  - `fetchNextPage` catches and logs errors and ensures loading state is reset.

---

## `useNumberedPaginationStore` (`src/store/useNumberedPaginationStore.ts`)

- __Store Purpose__
  - Page-number based pagination with cached pages and total counts.

- __Key State Variables__
  - `currentPage: number`
  - `cacheKey: string` — namespace for scenarios (e.g., shop vs category context)
  - `totalProducts: number`
  - `productsPerPage: number`
  - `totalPages: number`
  - `pageData: Record<number, Product[]>` — per-page cache
  - `loading: boolean`

- __Primary Actions__
  - `setCurrentPage(page)`
  - `setCacheKey(key)`
  - `setLoading(loading)`
  - `setTotalProducts(count)` — recomputes `totalPages`.
  - `fetchPage(page)` — fetches via `fetchPaginatedProducts(page, productsPerPage)`; caches into `pageData` and updates totals on first fetch.
  - `setPageData(page, products)` — manual cache insert.
  - `resetPagination(initialProducts, totalProducts, key?)` — seeds page 1 and totals (useful with SSR data).

- __Implementation Details__
  - Uses `persist` with `createJSONStorage(() => localforage)` to store into IndexedDB.
  - `partialize` persists: `currentPage`, `totalProducts`, `totalPages`, `pageData`, `cacheKey`.
  - Short-circuits network if the requested page is already in `pageData`.
  - Service dependency: `fetchPaginatedProducts` from `src/services/productServices`.

---

## Usage Tips

- __Prefer selectors when subscribing__ to avoid unnecessary re-renders, e.g.:
  ```ts
  const cartCount = useCartStore((s) => s.cartItems.reduce((n, i) => n + i.quantity, 0));
  const subtotal = useCartStore((s) => s.subtotal());
  const isCheckoutHydrated = useCheckoutStore((s) => s.isHydrated);
  const products = useProductStore((s) => s.products);
  const currentPage = useNumberedPaginationStore((s) => s.currentPage);
  ```
- __Keep stores cohesive and small__: UI-local state should stay in components; use stores for cross-component data.
- __Hydration-aware UI__: leverage `isHydrated`/`hasHydrated` flags to prevent flicker.
- __Persistence scope__: only persist what improves UX (use `partialize`).

