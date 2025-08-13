# Client Data Persistence

This document explains how client-side data is persisted across sessions in Dockbloxx, why we persist specific slices, and the patterns we follow to hydrate state safely in a Next.js (App Router) app.

---

## Overall Strategy

- __Persist only UX-critical state__
  - Cart contents and small checkout session flags should survive reloads.
  - Product lists and paginated pages are cached to speed up navigation.
- __Do not persist sensitive data__
  - Secrets and payment processing are server-only. Client persistence stores UI/session state only.
- __Minimize writes and payload size__
  - Use `partialize` to persist only the minimal subset that improves UX.
- __Be hydration-aware__
  - Expose hydration flags (e.g., `isHydrated`, `hasHydrated`) and set them in `onRehydrateStorage` to avoid UI flicker.

What we persist (high level):
- __Cart__: `cartItems` for continuity of the shopping session.
- __Checkout__: core `checkoutData` and a few small flags (e.g., `billingSameAsShipping`, `orderValidated`, `paymentIntentClientSecret`, `emailSaved`).
- __Products cache__: product arrays for smoother client navigation (IndexedDB).
- __Pagination caches__: cursor items or page-indexed results, plus cursors/counts.

---

## Storage Mechanisms

- __localStorage (synchronous, small payloads)__
  - Used by: `useCartStore`, `useCheckoutStore`, `usePaginationStore`.
  - Why: small, quick reads; suitable for compact objects like cart items, totals, cursors, and booleans.
  - Pattern: `persist(..., { storage: createJSONStorage(() => localStorage) })`.

- __IndexedDB via localforage (asynchronous, large payloads)__
  - Used by: `useProductStore`, `useNumberedPaginationStore`.
  - Why: handles larger datasets (pages of products) without blocking the main thread or hitting localStorage limits.
  - Patterns:
    - Custom storage wrapper (products): JSON encode/decode over `localforage`.
    - `createJSONStorage(() => localforage)` (numbered pagination) for a simpler JSON store.

Decision guidance:
- Prefer __localStorage__ for <= ~50KB items, small objects, and critical quick reads.
- Prefer __IndexedDB/localforage__ for larger arrays, paginated caches, or when growth is unbounded.

---

## The Role of `partialize`

`partialize` lets us choose which fields get persisted, shrinking storage, speeding hydration, and reducing risk.

- Examples in this repo:
  - `useCartStore`: persists only `{ cartItems }`.
  - `useCheckoutStore`: persists a carefully selected subset: `checkoutData`, `billingSameAsShipping`, `orderValidated`, `paymentIntentClientSecret`, `emailSaved`.
  - `usePaginationStore`: persists `{ items, endCursor, hasNextPage }` only (not volatile flags like `isLoading`).
  - `useNumberedPaginationStore`: persists `currentPage`, `totalProducts`, `totalPages`, `pageData`, `cacheKey`.
- Benefits:
  - Smaller payloads and faster rehydration.
  - Avoid persisting transient UI flags (`loading`, etc.).
  - Lower chance of leaking unnecessary data.

Snippet:
```ts
persist(
  (set, get) => ({ /* state & actions */ }),
  {
    name: "cart-storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ cartItems: state.cartItems }),
  }
)
```

---

## Hydration Logic (Next.js + SSR)

Hydration = restoring persisted client state after the initial server render.

- __Flags__: stores expose `isHydrated`/`hasHydrated` to signal UI readiness.
- __onRehydrateStorage__: callback executed after the store loads from storage; we flip flags or adjust `loading`.
- __Why it matters__: Without gating, UI may flicker between SSR defaults and hydrated client state.

Patterns in this repo:
- `useCartStore` and `useProductStore` set `isLoading` to `false` in `onRehydrateStorage`.
- `useCheckoutStore` sets `isHydrated = true` in `onRehydrateStorage` and uses `updateCheckoutTotals` for consistent totals.
- `usePaginationStore` clears loading after hydration.

Snippet:
```ts
persist(
  (set, get) => ({
    isHydrated: false,
    setIsHydrated: (v: boolean) => set({ isHydrated: v }),
    /* ... */
  }),
  {
    name: "checkout-storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ /* selected fields */ }),
    onRehydrateStorage: () => (store) => {
      // Runs after the persisted state is loaded
      store?.setIsHydrated(true);
    },
  }
)
```

UI usage:
```tsx
const isHydrated = useCheckoutStore((s) => s.isHydrated);
if (!isHydrated) return <Skeleton />; // prevent flash/flicker
return <CheckoutForm />;
```

---

## Common Patterns (Quick Reference)

- __Minimal persistence via partialize__
  ```ts
  partialize: (s) => ({ cartItems: s.cartItems })
  ```

- __Hydration flags & loading resets__
  ```ts
  onRehydrateStorage: () => (s) => { s?.setIsLoading(false); }
  ```

- __Unit price normalization at the boundary__ (cart)
  ```ts
  const unitPrice = typeof item.basePrice === number ? item.basePrice : item.price / Math.max(item.quantity || 1, 1);
  ```

- __Cursor pagination append__
  ```ts
  fetchNextPage: async (fn) => {
    set({ isLoading: true });
    try {
      const { items, endCursor, hasNextPage } = await fn(get().endCursor);
      set((st) => ({ items: [...st.items, ...items], endCursor, hasNextPage, isLoading: false }));
    } catch { set({ isLoading: false }); }
  }
  ```

- __Page-number pagination with cache__
  ```ts
  if (pageData[page]) { set({ currentPage: page }); return; }
  const { products, totalProducts } = await fetchPaginatedProducts(page, productsPerPage);
  set((st) => ({ currentPage: page, pageData: { ...st.pageData, [page]: products } }));
  if (totalProducts !== get().totalProducts) get().setTotalProducts(totalProducts);
  ```

- __IndexedDB via localforage__
  ```ts
  const storage = createJSONStorage(() => localforage);
  persist((set) => ({ /* ... */ }), { name: numbered-pagination-storage, storage });
  ```

- __Selector-friendly subscription__
  ```ts
  const subtotal = useCartStore((s) => s.subtotal());
  const products = useProductStore((s) => s.products);
  ```

---

## Notes and Gotchas

- __Avoid persisting secrets or PII__: credentials and server keys are never stored client-side; server routes proxy sensitive ops.
- __Migrations__: if store shapes change, consider `version` and `migrate` options on `persist`.
- __Size limits__: localStorage is small; prefer IndexedDB for growing arrays.
- __SSR differences__: initial server HTML won’t include hydrated client state—use flags to avoid jank.

