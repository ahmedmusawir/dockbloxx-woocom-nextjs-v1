# Responsive Design

This guide documents how we build a consistent, high‑quality experience across devices using Tailwind’s mobile‑first utilities and our project’s breakpoints.

---

## Core Philosophy

- **Mobile‑first**: Start with the smallest screens by default, then layer on enhancements using responsive variants (`sm: md: lg: xl: 2xl:`).
- **Content‑driven layouts**: Grids and components adapt to available space; no fixed pixel assumptions.
- **Token‑driven visuals**: Colors, radius, and typography use semantic tokens so themes work across breakpoints.

---

## Tailwind Breakpoints

We use Tailwind’s defaults with a custom `lg` breakpoint.

- `sm` — 640px
- `md` — 768px
- `lg` — 1150px (custom; see `tailwind.config.ts` → `theme.extend.screens.lg`)
- `xl` — 1280px
- `2xl` — 1536px

Notes:
- Validate key layouts at `md` (tablet) and `lg` (our elevated desktop threshold at 1150px).

---

## Common Patterns

- **Fluid grids and flexible layouts**
  ```tsx
  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    {/* product cards */}
  </ul>
  ```
  - For auto‑fitting grids, use the plugin: `grid grid-auto-fit gap-6` with min widths via utilities (see Tailwind Grid Auto Fit plugin docs).

- **Responsive font sizes**
  ```tsx
  <h1 className="text-2xl sm:text-3xl md:text-4xl">Heading</h1>
  <p className="text-sm md:text-base">Body copy that scales up on tablets.</p>
  ```

- **Stack → row transitions**
  ```tsx
  <div className="flex flex-col md:flex-row gap-6">
    <aside className="md:w-64">Sidebar</aside>
    <main className="flex-1">Content</main>
  </div>
  ```

- **Conditional rendering by size**
  ```tsx
  {/* Mobile‑only */}
  <MobileNavOverlay className="block md:hidden" />
  {/* Desktop‑only */}
  <DesktopNav className="hidden md:flex" />
  ```

- **Responsive containers and paddings**
  ```tsx
  <section className="px-4 sm:px-6 lg:px-8 2xl:px-10">
    <div className="mx-auto w-full max-w-7xl">...</div>
  </section>
  ```

- **Image/media aspect ratios**
  ```tsx
  <div className="aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg">
    {/* image */}
  </div>
  ```

---

## Best Practices

- **Start small, then override**
  - Write base (mobile) classes first; apply larger breakpoints only where needed.
- **Minimize breakpoint churn**
  - Prefer fluid layouts that work across ranges; introduce breakpoints for meaningful shifts only.
- **Use semantic spacing**
  - Keep consistent `gap-*`, `space-*`, and padding scales between related sections.
- **Prefer utility composition**
  - Avoid custom media queries; use Tailwind’s responsive variants for clarity and consistency.
- **Test at custom `lg` (1150px)**
  - Our `lg` is higher than Tailwind’s default; ensure desktop layouts feel right at ~1150–1280px.
- **Performance**
  - Avoid rendering heavy desktop UI on mobile; guard with `hidden md:block` when appropriate.

---

## Touch Device Considerations

- **Tap targets**
  - Ensure actionable elements have at least ~44×44px hit areas (`h-11 px-4`, `py-3`, etc.).
- **Hover alternatives**
  - Don’t rely solely on `hover:`; provide visible focus/pressed states (`focus-visible:`, `aria-*` states, `data-[state=]:`).
- **Gestures & scroll**
  - Avoid horizontal scroll traps; use `overflow-x-auto` for carousels and tables.
- **Keyboard and accessibility**
  - Maintain focus styles (`focus-visible:ring-2 ring-ring ring-offset-2`) across breakpoints.
- **Fixed and sticky UI**
  - Test sticky headers/footers on mobile browsers to avoid content being obscured.

---

## Examples From the Codebase

- **Navigation**
  - `src/components/global/Navbar.tsx` uses mobile overlays (`block md:hidden`) and desktop menus (`hidden md:flex`).
- **Product grids**
  - `src/components/shop/ProductList.tsx` and `src/components/home/HomeProductList.tsx` vary columns with `sm: md: xl:` breakpoints.
- **Checkout panes**
  - `src/components/checkout/right-pane/OrderDetailsDesktop.tsx` and `OrderDetailsMobile.tsx` split rendering by breakpoint for optimal UX.

For Tailwind configuration details, see `tailwind.config.ts`. For design tokens and class conventions, see `docs/ui-ux/design-system.md` and `docs/ui-ux/styling-conventions.md`.
