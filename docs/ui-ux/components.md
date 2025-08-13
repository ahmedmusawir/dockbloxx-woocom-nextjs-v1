# Components Catalogue

This document maps the component architecture of Dockbloxx, where to find things, and how to work with our reusable primitives and feature components.

---

## Component Organization

Location: `src/components/`

- **global/** — Application-wide UI (navigation, footer, mobile nav overlays).
- **common/** — Reusable layout primitives and utilities (container, grid/rows, paginations, spinners).
- **shop/** — Shop and product listing UI (lists, cards, product-page subcomponents).
  - `shop/product-page/` — PDP sections (gallery, info, reviews, etc.).
- **cart/** — Cart drawer/slideover, cart imagery, cart page.
- **checkout/** — Checkout flow split into panes and payments.
  - `checkout/left-pane/` — forms (billing, shipping, methods, validation).
  - `checkout/right-pane/` — order details, coupon, comments.
  - `checkout/payments/` — dialogs and Stripe payment form.
- **home/** — Home page sections (hero, curated product sections).
- **about/**, **blog/**, **contact/**, **dealer/** — Section-specific blocks.

Conventions:
- Co-locate styles (module.scss only when necessary; prefer Tailwind utilities in JSX).
- Extract UI primitives to `common/` or `global/` when reused across features.

---

## Component Inventory (by category)

Below are the most important/commonly used components. Not exhaustive, but representative.

### Navigation (global/)
- **`Navbar.tsx`** — Top navigation, menu, mobile trigger.
- **`MobileNavOverlay.tsx`** — Fullscreen overlay for small screens.
- **`MobileNavItem.tsx`** — Mobile nav item entry.
- **`Footer.tsx`** — Primary footer. (`Footer-ORG.tsx` is older variant retained for reference.)
- **`SocialMediaLinks.tsx`** — Social icon list used in footer/header.

### Layout & Utilities (common/)
- **`Container.tsx`** — Page width constraints and gutters.
- **`Page.tsx`** / **`Main.tsx`** — Semantic page wrappers.
- **`Row.tsx`** / **`Box.tsx`** — Simple layout primitives for spacing/stacking.
- **`NumberedPagination.tsx`** — Page-number pagination UI; integrates with `useNumberedPaginationStore`.
- **`LoadMoreButton.tsx`** — Cursor-based pagination control; integrates with `usePaginationStore`.
- **`Sidebar.tsx`** — Sidebar layout shell.
- **`Spinner*.tsx`** — Loading indicators in three sizes (`Spinner`, `SpinnerSmall`, `SpinnerLarge`).
- **`FeaturedProducts.tsx`** — Reusable grid of featured products.

### E‑commerce: Shop & PDP (shop/)
- **`ProductList.tsx`** — Grid list of products with paging.
- **`ProductListItem.tsx`** — Single product card (image, title, price, add-to-cart action).
- **`search/SearchProductList.tsx`** — Product results for search page.
- PDP (`shop/product-page/`):
  - **`ProductImageGallery.tsx`** — Image carousel/gallery.
  - **`ProductInfo.tsx`** — Title, price, CTA block; hooks into cart/checkout.
  - **`ProductDetails.tsx`** — Detailed specs/attributes.
  - **`ProductShortDescription.tsx`**, **`ProductDescription.tsx`** — Marketing copy blocks.
  - **`ProductReviews.tsx`** — Reviews list and rating summary.
  - **`ProductFaq.tsx`** — FAQ section.
  - **`ProductColorRadio.tsx`** — Variant/attribute selection control.
  - **`RelatedProducts.tsx`** — PDP cross-sell grid.
  - **`DynamicProductUi.tsx`** — Conditional rendering of PDP sections based on product data.

### Cart (cart/)
- **`CartSlide.tsx`** — Slide-over cart drawer; reads/writes `useCartStore`.
- **`CartImage.tsx`** — Product image in cart contexts.
- **`cart-page/CartItems.tsx`** — Full cart page items list and controls.

### Checkout (checkout/)
- Left pane (`checkout/left-pane/`):
  - **`LeftPane.tsx`** — Orchestrates left-pane sections.
  - **`BillingForm.tsx`**, **`ShippingForm.tsx`**, **`ShippingInfo.tsx`**, **`StateSelector.tsx`** — Customer data forms.
  - **`PaymentMethods.tsx`** — Method selection.
  - **`ShippingMethods.tsx`** — Method selection and cost; updates totals.
  - **`ContactEmail.tsx`** — Saves customer email; updates checkout store.
  - **`OrderValidation.tsx`** — Validates checkout steps.
- Right pane (`checkout/right-pane/`):
  - **`RightPane.tsx`** — Summary panel.
  - **`OrderDetailsDesktop.tsx`**, **`OrderDetailsMobile.tsx`** — Responsive order summary.
  - **`CheckoutCartItems.tsx`** — Items summary for checkout.
  - **`ApplyCoupon.tsx`** — Coupon entry and apply/remove workflow.
  - **`CustomerComments.tsx`** — Optional order notes.
- Payments (`checkout/payments/`):
  - **`StripePaymentForm.tsx`** — Stripe Elements form; handles payment intent and confirmation.
  - **`OrderInfoDialog.tsx`** — Modal dialog for order info/errors.

### Home (home/)
- **`Hero.tsx`** — Top hero section.
- **`HomeProductList.tsx`** — Product grid for home.
- **`SectionOneBestSellers*.tsx`**, **`SectionTwoWaterSports*.tsx`**, **`SectionThreeEntertainments.tsx`**, **`SectionFiveDockEssentials.tsx`** — Curated home sections.

### Content & Marketing
- **about/**: `MeetTheTeam.tsx`, `VideoBlock.tsx`
- **blog/**: `BlogPostItems.tsx`
- **contact/**: `Faq.tsx`
- **dealer/**: `DealerCTA.tsx`, `DealerCouponClientBlock.tsx`

---

## The Role of shadcn/ui (Primitives)

We follow shadcn-style primitives: components are composed with Tailwind utilities and **CVA** variant recipes, not imported from a monolithic UI kit. This yields:
- Consistent styling through tokens (see `docs/ui-ux/design-system.md`).
- Type-safe variants and small, focused APIs.
- Easy extension for domain-specific needs (e.g., shop/product cards).

---

## Variant‑based Components (CVA)

We use `class-variance-authority` to express component variants (e.g., button `intent` and `size`). See `docs/ui-ux/styling-conventions.md` for full example.

Guidelines:
- Keep variant sets minimal: `intent` (primary, secondary, ghost), `size` (sm, md, lg).
- Token-first classes (`bg-primary`, `text-foreground`) to honor themes.
- Compose final className with a `cn()` helper (tailwind-merge + clsx) when needed.

---

## Props and APIs (critical components)

- **Navigation**
  - `Navbar` — Props: none/implicit route detection. Behavior: renders primary nav, mobile trigger; uses semantic tokens for dark/light.
  - `MobileNavOverlay` — Props: `open: boolean`, `onClose: () => void`. Behavior: fullscreen overlay with focus-locking.

- **Product list & card**
  - `ProductList` — Props: `products: Product[]`, optional paging props. Behavior: renders grid; may trigger pagination store actions.
  - `ProductListItem` — Props: `product: Product`, optional `onAddToCart(product)`. Behavior: card UI with image, title, price, CTA.

- **PDP sections**
  - `ProductImageGallery` — Props: `images: { src: string; alt?: string; }[]`. Behavior: gallery/carousel.
  - `ProductInfo` — Props: `product: Product`. Behavior: displays pricing, variant selectors, and add-to-cart; syncs with `useCartStore` / `useCheckoutStore` where applicable.

- **Cart**
  - `CartSlide` — Props: `open: boolean`, `onOpenChange(next: boolean)`. Behavior: drawer that lists cart items; uses `useCartStore` for actions like increase/decrease/remove.

- **Checkout**
  - `BillingForm` — Props: `value: Billing`, `onChange(next: Billing)`. Behavior: controlled form; updates `useCheckoutStore`.
  - `ShippingMethods` — Props: `methods: ShippingMethod[]`, `selected: string`, `onSelect(id: string)`. Behavior: updates shipping method and triggers totals recalculation.
  - `StripePaymentForm` — Props: implied via Stripe Elements context; Behavior: confirms payment, handles errors and success callbacks.
  - `OrderDetailsDesktop/Mobile` — Props: derived from `useCheckoutStore` selectors. Behavior: show order totals; responsive.

- **Pagination**
  - `NumberedPagination` — Props: `currentPage: number`, `totalPages: number`, `onChange(page: number)`. Behavior: emits page changes; integrates with numbered pagination store.
  - `LoadMoreButton` — Props: `loading: boolean`, `disabled?: boolean`, `onClick(): void`. Behavior: triggers cursor pagination fetch.

Notes:
- Exact prop shapes follow the TypeScript types in their files; when integrating, use local TS types imported from data or `src/types/` if available.

---

## Adding New Components

- Prefer adding primitives under `common/` or `global/` if broadly useful; otherwise, place feature-specific components in their feature folder.
- Use Tailwind utilities in JSX; extract a CVA recipe if variants are needed.
- Honor tokens (`bg-background`, `text-foreground`, etc.) and follow class ordering from the styling guide.
- If a component interacts with stores, use selectors to minimize re-renders and respect hydration flags.

For styling and token references, see `docs/ui-ux/styling-conventions.md` and `docs/ui-ux/design-system.md`.
